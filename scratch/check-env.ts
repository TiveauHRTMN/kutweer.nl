import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Supabase URL configured:", !!url);
if (url) console.log("URL starts with:", url.substring(0, 15) + "...");
console.log("Supabase Anon Key configured:", !!key);
if (key) console.log("Key length:", key.length);
console.log("Key starts with:", key.substring(0, 10) + "...");
