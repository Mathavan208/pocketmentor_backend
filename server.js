const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
// In your backend (e.g., server.js or app.js)




const allowedOrigins = [
  'http://localhost:5173/', // Local development
  'https://pocketmentor-frontend.onrender.com/' // Deployed frontend
];

const cors=require('cors');
app.use(cors());
// Init middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/users', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/workshops', require('./routes/workshops'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/instructors',require('./routes/instructors'));
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));