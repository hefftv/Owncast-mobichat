const { definePlugin, owncast } = require("@owncast/plugin-sdk");

// Who is in chat — adapted from cameronurnes/owncast-chat-tools (MIT).
//
// Wire protocol (`ChatClient`) may include ipAddress / userAgent / userId.
// Never echo those on public HTTP or SSE — project to { name, mod } only.
// See: https://github.com/owncast/plugin-sdk/blob/main/docs/WIRE_PROTOCOL.md
function currentUsers() {
  const seen = new Set();
  const users = [];
  for (const client of owncast.chat.clients()) {
    const name = (client.displayName || "").trim();
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    let mod = false;
    // userId is the stable lookup key (User.id). Display names are not unique.
    if (client.userId) {
      try {
        const u = owncast.users.get(client.userId);
        mod =
          !!u && Array.isArray(u.scopes) && u.scopes.includes("MODERATOR");
      } catch (err) {
        // Reader denials / missing users: treat as non-mod.
      }
    }
    users.push({ name, mod });
  }
  users.sort(
    (a, b) =>
      Number(b.mod) - Number(a.mod) ||
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
  return users;
}

let pendingBroadcast = null;

function broadcast() {
  // sse.send data is a UTF-8 string on the wire; the SDK JSON-encodes objects.
  owncast.sse.send("room", "users", { users: currentUsers() });
}

// Coalesce the delayed refresh so rapid join/leave churn cannot
// stack toward the host's 64 pending-timer cap (PLUGIN_AUTHOR_GUIDE Limits).
function broadcastSoon() {
  broadcast();
  if (pendingBroadcast != null) {
    owncast.timer.clear(pendingBroadcast);
  }
  pendingBroadcast = owncast.timer.setTimeout(() => {
    pendingBroadcast = null;
    broadcast();
  }, 2000);
}

function json(status, data) {
  return {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(data),
  };
}

module.exports = definePlugin({
  onChatUserJoined() {
    broadcast();
  },
  onChatUserParted() {
    broadcastSoon();
  },
  onChatUserRenamed() {
    broadcast();
  },

  onHttpRequest(req) {
    // OutgoingHttpResponse.body must be a string on the wire.
    if (req.method === "GET" && req.path === "/api/users") {
      return json(200, { users: currentUsers() });
    }
    return json(404, { error: "Not found." });
  },
});
