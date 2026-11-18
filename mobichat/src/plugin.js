const { definePlugin, owncast } = require("@owncast/plugin-sdk");

// Who is in chat — adapted from cameronurnes/owncast-chat-tools (MIT).
// One entry per display name. Only name + moderator flag leave the server.
function currentUsers() {
  const seen = new Set();
  const users = [];
  for (const client of owncast.chat.clients()) {
    const name = (client.displayName || "").trim();
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    let mod = false;
    if (client.userId) {
      try {
        const u = owncast.users.get(client.userId);
        mod =
          !!u && Array.isArray(u.scopes) && u.scopes.includes("MODERATOR");
      } catch (err) {
        // Failed lookup: no mod marker.
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

function broadcast() {
  owncast.sse.send("room", "users", { users: currentUsers() });
}

function broadcastSoon() {
  broadcast();
  owncast.timer.setTimeout(broadcast, 2000);
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
    // Public list of display names currently in chat. No ids, IPs, or
    // user-agents. Same shape chat-tools exposes for its header button.
    if (req.method === "GET" && req.path === "/api/users") {
      return json(200, { users: currentUsers() });
    }
    return json(404, { error: "Not found." });
  },
});
