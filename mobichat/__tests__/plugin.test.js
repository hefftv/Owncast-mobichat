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
      // ChatClient wire fields include ipAddress / userAgent / messageCount.
      // They must never appear in the public projection.
      chatClients: [
        {
          id: 1,
          displayName: "alice",
          userId: "u-alice",
          messageCount: 3,
          ipAddress: "203.0.113.10",
          userAgent: "SecretAgent/1.0",
        },
        {
          id: 2,
          displayName: "alice",
          userId: "u-alice",
          messageCount: 1,
          ipAddress: "203.0.113.10",
          userAgent: "SecretAgent/1.0",
        },
        {
          id: 3,
          displayName: "bob",
          userId: "u-bob",
          messageCount: 0,
          ipAddress: "198.51.100.7",
          userAgent: "Other/2.0",
        },
      ],
      users: [
        {
          id: "u-alice",
          displayName: "alice",
          displayColor: 0,
          scopes: ["MODERATOR"],
        },
        {
          id: "u-bob",
          displayName: "bob",
          displayColor: 1,
          scopes: [],
        },
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
