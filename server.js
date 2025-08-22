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
const GEMINI_API_KEY = process.env.PERPLEXITY_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('Missing PERPLEXITY_API_KEY environment variable');
  process.exit(1);
}

// Gemini route
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messagesFinal } = req.body; // expecting a string from frontend

    // const apiResponse = await fetch(
    //   `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'X-goog-api-key': GEMINI_API_KEY, // required by Gemini
    //     },
    //     body: JSON.stringify({
    //       contents: [
    //         {
    //           parts: [
    //             { text: messagesFinal }
    //           ]
    //         }
    //       ]
    //     }),
    //   }
    // );

    // const data = await apiResponse.json();
    res.json(messagesFinal);
  } catch (err) {
    console.error('Gemini API error:', err);
    res.status(500).json({ error: 'Error communicating with Gemini API' });
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