import fs from 'fs';

async function test() {
  const content = fs.readFileSync('.env.local', 'utf8');
  let apiKey = '';
  content.split('\n').forEach(line => {
    if (line.startsWith('RESEND_API_KEY')) apiKey = line.split('=')[1].trim();
  });

  console.log("Fetching sent emails from Resend...");
  const resp = await fetch("https://api.resend.com/emails", {
    headers: { "Authorization": `Bearer ${apiKey}` }
  });
  const data = await resp.json();
  console.log("Recent Emails:", JSON.stringify(data, null, 2));
}

test();
