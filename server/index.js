const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require("jsonwebtoken"); 
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Models ---
const Grievance = require('./models/Grievance');
const User = require('./models/User');

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// 2. Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Put these in .env file
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 3. Set up Cloudinary Storage Engine
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'civic_connect_uploads', // Folder name in Cloudinary dashboard
        allowed_formats: ['jpg', 'png', 'jpeg', 'wav', 'mp3'], // Allowed file types
        resource_type: 'auto' // Auto-detect image vs audio
    },
});

const upload = multer({ storage: storage });

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/civic_connect_db')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ DB Connection Error:', err));

//  ADMIN SECURITY (Still Active)

const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(403).json({ message: "No token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: "Access Denied: Admins only" });
        }
        req.admin = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid Token" });
    }
};

// AUTH ROUTES

// 1. Citizen Sign Up (Still used to create account for Name/Email)
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password, pincode } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: "Email already exists." });

        const newUser = new User({ name, email, password, pincode, role: 'citizen' });
        await newUser.save();

        res.json({ success: true, message: "Account created successfully!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. Citizen Login (Used only to retrieve Name/Email for localStorage)
app.post('/api/auth/login', async (req, res) => { 
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || user.password !== password) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // We still send a token just in case, but frontend won't force it
        const token = jwt.sign({ id: user._id, role: "citizen" }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });

        res.json({ 
            success: true, 
            token: token,
            user: { name: user.name, email: user.email, pincode: user.pincode } 
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 3. Admin Login (STRICT)
app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await User.findOne({ email, role: 'admin' });
        
        if (!admin || admin.password !== password) {
            return res.status(401).json({ success: false, message: "Invalid Admin Credentials" });
        }

        const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });
        res.json({ success: true, token });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GRIEVANCE ROUTES (Open for Citizens)

// GET: Fetch Grievances (Open Access - Filtered by Email)
app.get('/api/grievances', async (req, res) => {
    try {
        const { email } = req.query; 
        let query = {};
        
        // If email provided, show user history. If not (and not admin), show nothing or public feed.
        if (email) query.userEmail = email;

        const grievances = await Grievance.find(query).sort({ createdAt: -1 });
        res.json({ success: true, data: grievances });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST: Submit Grievance (Updated for Cloudinary)
app.post('/api/grievances/submit', upload.fields([{ name: 'image' }, { name: 'audio' }]), async (req, res) => {
    try {
        // Cloudinary returns the URL in `req.files[...][0].path`
        let imageUrl = req.files['image'] ? req.files['image'][0].path : null;
        let audioUrl = req.files['audio'] ? req.files['audio'][0].path : null;

        const newGrievance = new Grievance({
            citizenName: req.body.citizenName,
            userEmail: req.body.userEmail, 
            area: req.body.area,
            category: 'General',
            priority: 'Medium',
            description: req.body.description,
            imageUrl: imageUrl, // Saves the Cloudinary URL (starts with https://)
            audioUrl: audioUrl,
            status: 'Pending'
        });

        await newGrievance.save();
        res.json({ success: true, data: newGrievance });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 🛡️ ADMIN ACTIONS (Protected)

// PUT: Resolve Grievance (ADMIN ONLY)
app.put('/api/grievances/:id', verifyAdmin, async (req, res) => { 
    try {
        const { status, adminReply, estimatedTime } = req.body;

        const updatedGrievance = await Grievance.findByIdAndUpdate(
            req.params.id, 
            { 
                status: status,
                adminReply: adminReply || "Issue resolved by administration.",
                estimatedTime: estimatedTime || "Completed"
            },
            { new: true }
        );

        if (!updatedGrievance) return res.status(404).json({ success: false, error: "Grievance not found" });

        res.json({ success: true, data: updatedGrievance });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE: Delete Grievance (ADMIN ONLY)
app.delete('/api/grievances/:id', verifyAdmin, async (req, res) => { 
    try {
        const deletedGrievance = await Grievance.findByIdAndDelete(req.params.id);
        if (!deletedGrievance) return res.status(404).json({ success: false, message: "Grievance not found" });

        res.json({ success: true, message: "Grievance deleted", data: deletedGrievance });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));