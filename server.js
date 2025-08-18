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