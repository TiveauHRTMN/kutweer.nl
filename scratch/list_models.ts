import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function listModels() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return;
  
  const res = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${key}`);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

listModels();
