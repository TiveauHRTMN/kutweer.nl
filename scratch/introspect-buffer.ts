async function run() {
  const token = 'TOUtIfNJIwUK0_lkbdLXNfEVWoylZDqLcU1yTJi8x0x';
  const query = `
    {
      Type1: __type(name: "SchedulingType") {
        enumValues {
          name
        }
      }
      Type2: __type(name: "ShareMode") {
        enumValues {
          name
        }
      }
    }
  `;

  const res = await fetch('https://api.buffer.com', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });

  const body = await res.json();
  if (body.errors) {
    console.log("ERRORS:", JSON.stringify(body.errors, null, 2));
  } else {
    console.log(JSON.stringify(body.data, null, 2));
  }
}
run();
