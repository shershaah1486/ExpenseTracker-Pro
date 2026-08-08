import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

app.get("/", (req, res) => {
    res.send("✅ TrackWise AI Backend Running");
});
app.post("/analyze-receipt", async (req, res) => {
  try {
    const { receiptText } = req.body;

    if (!receiptText) {
      return res.status(400).json({
        error: "Receipt text is required"
      });
    }

    const prompt = `
You are an AI receipt analyzer.

Analyze this receipt and return ONLY valid JSON.

Format:

{
  "merchant": "",
  "amount": 0,
  "category": "",
  "type": "",
  "date": "",
  "summary": ""
}

Rules:

- category must be one of:
Food
Shopping
Travel
Bills
Entertainment
Health
Education
Salary
Other

- type must be:
expense
or
income

- date format:
YYYY-MM-DD

- amount should be the TOTAL amount.
- summary should be a short 1-sentence description of the purchase.
- Mention what was purchased and the spending category when possible.
- Keep the summary under 20 words.

Receipt:

${receiptText}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    let text = response.text;

    text = text.replace(/```json/g, "")
               .replace(/```/g, "")
               .trim();

    const result = JSON.parse(text);

    res.json(result);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});
app.listen(process.env.PORT || 5000, () => {
  console.log("🚀 Server running on port 5000");
});