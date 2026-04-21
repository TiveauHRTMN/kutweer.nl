async function run() {
  const token = 'TOUtIfNJIwUK0_lkbdLXNfEVWoylZDqLcU1yTJi8x0x';
  const query = `
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        ... on PostActionSuccess {
          post {
            id
          }
        }
      }
    }
  `;
  const variables = {
    input: {
      channelId: "69e51ee4031bfa423c1f65c6", // X
      text: "Test post via WeerZone API (22-04-2026) 🚀🤖 — Het werkt!",
      schedulingType: "automatic",
      mode: "shareNow"
    }
  };

  const res = await fetch('https://api.buffer.com', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  });

  const body = await res.json();
  console.log(JSON.stringify(body, null, 2));
}
run();
