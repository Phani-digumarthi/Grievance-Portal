const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const Grievance = require('./models/Grievance');
const User = require('./models/User'); // <--- IMPORT USER MODEL

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ... (Keep your existing multer/upload configuration here) ...
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// Connect to MongoDB
mongoose.connect('mongodb+srv://grievanceanalysis:Phani1234@atlascloud.58bqyub.mongodb.net/grievance_platform?appName=AtlasCloud')
    .then(() => console.log('✅ MongoDB Connected to Atlas Cloud'))
    .catch(err => console.log('❌ DB Connection Error:', err));

// ==========================================
// 🚀 NEW: AUTHENTICATION ROUTES
// ==========================================

// 1. Citizen Registration (Sign Up)
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password, pincode } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "⚠️ Email already exists." });
        }

        const newUser = new User({ name, email, password, pincode });
        await newUser.save();

        res.json({ success: true, message: "✅ Account created successfully!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. Citizen Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "❌ Account not found." });
        }

        // Check password (simple check)
        if (user.password !== password) {
            return res.status(401).json({ success: false, message: "❌ Incorrect Password." });
        }

        // Success: Send back user info (excluding password)
        res.json({ 
            success: true, 
            user: { name: user.name, email: user.email, pincode: user.pincode } 
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});


// ==========================================
// END NEW ROUTES
// ==========================================

// ... (Keep your existing Grievance Routes: GET /api/grievances, POST /api/grievances/submit, etc.) ...

app.get('/api/grievances', async (req, res) => {
    try {
        const { email } = req.query; // Check if email is passed in URL
        let query = {};
        
        // If email is provided, only fetch grievances for that email
        if (email) {
            query.userEmail = email;
        }

        const grievances = await Grievance.find(query).sort({ createdAt: -1 });
        res.json({ success: true, data: grievances });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/grievances/submit', upload.fields([{ name: 'image' }, { name: 'audio' }]), async (req, res) => {
    try {
        // ... (existing file logic) ...
        let imagePath = req.files['image'] ? req.files['image'][0].path : null;
        let audioPath = req.files['audio'] ? req.files['audio'][0].path : null;

        const newGrievance = new Grievance({
            citizenName: req.body.citizenName,
            userEmail: req.body.userEmail, // <--- SAVE THE EMAIL
            area: req.body.area,
            category: 'General',
            priority: 'Medium',
            description: req.body.description,
            imageUrl: imagePath,
            audioUrl: audioPath,
            status: 'Pending'
        });

        await newGrievance.save();
        res.json({ success: true, data: newGrievance });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// UPDATE: Mark Grievance as Resolved
app.put('/api/grievances/:id', async (req, res) => {
    console.log(`🔹 Request to update ID: ${req.params.id}`);
    console.log("🔹 Data received:", req.body);

    try {
        const { status, adminReply, estimatedTime } = req.body;

        const updatedGrievance = await Grievance.findByIdAndUpdate(
            req.params.id, 
            { 
                status: status,
                adminReply: adminReply || "Issue resolved by administration.", // Default message
                estimatedTime: estimatedTime || "Completed"
            },
            { new: true } // Return the updated document
        );

        if (!updatedGrievance) {
            console.log("❌ Grievance not found with that ID");
            return res.status(404).json({ success: false, error: "Grievance not found" });
        }

        console.log("✅ Update Successful!");
        res.json({ success: true, data: updatedGrievance });

    } catch (err) {
        console.error("❌ Database Update Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));