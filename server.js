// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
// Init middleware
const allowedOrigins = [
  'http://localhost:5173', // for local dev
  'https://pocketmentor-frontend.onrender.com' // deployed frontend
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ extended: false }));
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('Missing GEMINI_API_KEY environment variable');
  process.exit(1);
}

// Gemini route
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { prompt } = req.body; // expecting a string from frontend
  if (typeof prompt !== "string") {
      prompt = JSON.stringify(prompt);
    }
    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          
          // required by Gemini
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ]
        }),
      }
    );

    const data = await apiResponse.json();
    res.json(data);
  } catch (err) {
    console.error('Gemini API error:', err);
    res.status(500).json({ error: 'Error communicating with Gemini API' });
  }
});
router.post("/api/send-certificate", async (req, res) => {
  try {
    const { email, pdfBase64, filename } = req.body;

    if (!email || !pdfBase64) {
      return res.status(400).json({ message: "Email and PDF are required" });
    }

    // Convert base64 PDF to Buffer
    const pdfBuffer = Buffer.from(pdfBase64.split(",")[1], "base64");

    // Configure nodemailer (using Gmail example, you can use other SMTP)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use App Password if 2FA enabled
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Course Certificate",
      text: "Congratulations! Please find your course completion certificate attached.",
      attachments: [
        {
          filename: filename || "certificate.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Certificate sent via email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});
// Define Routes
app.use('/api/users', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/workshops', require('./routes/workshops'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/instructors', require('./routes/instructors'));

// Admin routes
app.use('/api/admin/workshops', require('./routes/adminWorkshops'));
app.use('/api/admin/instructors', require('./routes/adminInstructors'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));