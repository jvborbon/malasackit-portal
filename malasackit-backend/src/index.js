// src/index.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // Add this
import locationRoutes from './routes/locationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import donationRequestRoutes from './routes/donationRequestRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import beneficiaryRoutes from './routes/beneficiaryRoutes.js';
import distributionRoutes from './routes/distributionRoutes.js';
import walkInRoutes from './routes/walkInRoutes.js';
import receiptRoutes from './routes/receiptRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { sanitizeMiddleware } from './middleware/sanitization.js';

const app = express();
const port = 3000;

// CORS configuration for cookies
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Your frontend URL
    credentials: true // Allow cookies
}));

app.use(cookieParser()); // Add cookie parser middleware
app.use(express.json());

// Input sanitization middleware (MUST be after express.json())
app.use(sanitizeMiddleware);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/api', locationRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/donation-requests', donationRequestRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/distribution', distributionRoutes);
app.use('/api/walkin', walkInRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);



// Backend - Add to your server.js
app.post("/api/generate-insights", async (req, res) => {
  try {
    const { chartType, data, context } = req.body;

    if (!chartType || !data || !context) {
      return res.status(400).json({
        error: "Missing required fields: chartType, data, or context",
      });
    }

    const prompt = `Analyze this ${chartType} data briefly:

${JSON.stringify(data, null, 2)}

Context: ${context}

Give me 3-4 SHORT insights using simple words. Make each point 1 sentence only. Focus on what's important and what to do for prescriptive analytics.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 250,
            candidateCount: 1,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();

    if (result.candidates && result.candidates.length > 0) {
      const candidate = result.candidates[0];

      if (
        candidate.content &&
        candidate.content.parts &&
        candidate.content.parts.length > 0
      ) {
        const insights = candidate.content.parts[0].text;
        res.json({ insights, success: true });
      } else {
        throw new Error("No content generated");
      }
    } else {
      throw new Error("No insights generated");
    }
  } catch (error) {
    console.error("Generate Insights Error:", error);
    res.status(500).json({
      error: "Failed to generate insights. Please try again.",
      details: error.message,
    });
  }
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});


