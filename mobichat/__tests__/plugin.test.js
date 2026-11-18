const { runScenarios } = require("@owncast/plugin-sdk/testing");

const user = (name) => ({ id: name, displayName: name });

runScenarios([
  {
    name: "does not post to chat",
    events: [
      {
        event: "chat.message.received",
        payload: {
          id: "1",
          user: { id: "alice", displayName: "alice" },
          body: "hi everyone",
          timestamp: "2024-01-01T00:00:00Z",
        },
      },
    ],
    expect: { chatSends: [] },
  },
  {
    name: "GET /api/users returns only names and mod flags",
    given: {
      chatClients: [
        { displayName: "alice", userId: "u-alice" },
        { displayName: "alice", userId: "u-alice" },
        { displayName: "bob", userId: "u-bob" },
      ],
      users: [
        {
          id: "u-alice",
          displayName: "alice",
          scopes: ["MODERATOR"],
        },
        { id: "u-bob", displayName: "bob", scopes: [] },
      ],
    },
    events: [
      {
        http: {
          method: "GET",
          path: "/api/users",
          expect: {
            status: 200,
            body: JSON.stringify({
              users: [
                { name: "alice", mod: true },
                { name: "bob", mod: false },
              ],
            }),
          },
        },
      },
    ],
  },
  {
    name: "unknown path returns 404",
    events: [
      {
        http: {
          method: "GET",
          path: "/api/nope",
          expect: {
            status: 404,
            body: JSON.stringify({ error: "Not found." }),
          },
        },
      },
    ],
  },
  {
    name: "pushes the user list when someone joins",
    events: [{ event: "chat.user.joined", payload: user("alice") }],
    expect: { sseSends: [{ channel: "room", event: "users" }] },
  },
  {
    name: "pushes the user list when someone leaves",
    events: [{ event: "chat.user.parted", payload: user("alice") }],
    expect: { sseSends: [{ channel: "room", event: "users" }] },
  },
  {
    name: "pushes the user list when someone renames",
    events: [
      {
        event: "chat.user.renamed",
        payload: { user: user("alice"), previousName: "old_alice" },
      },
    ],
    expect: { sseSends: [{ channel: "room", event: "users" }] },
  },
]);
