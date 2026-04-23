import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testImageGen() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error("Missing GEMINI_API_KEY");
    return;
  }

  const genAI = new GoogleGenerativeAI(key);
  
  // Try to use a model that might support image generation
  // In 2026, some Gemini models might generate images directly
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Generate a beautiful photorealistic image of a sunset in the Netherlands. Return the image data.");
    
    // Check if there are any files in the response
    const response = await result.response;
    console.log("Response Keys:", Object.keys(response));
    
    // In some versions, images are in the 'candidates' or 'parts'
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          console.log("Found inline data (image?) with mimeType:", part.inlineData.mimeType);
          fs.writeFileSync("test_image.png", Buffer.from(part.inlineData.data, "base64"));
          console.log("Image saved to test_image.png");
        }
      }
    }
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}

testImageGen();
