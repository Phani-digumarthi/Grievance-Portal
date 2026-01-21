const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

const app = express();
const Grievance = require('./models/Grievance');

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/civic_connect_db')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ DB Connection Error:', err));

app.get('/api/grievances', async (req, res) => {
    try {
        const grievances = await Grievance.find().sort({ createdAt: -1 });
        res.json({ success: true, data: grievances });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/grievances/submit', upload.fields([{ name: 'image' }, { name: 'audio' }]), async (req, res) => {
    try {
        let imagePath = null;
        let audioPath = null;

        if (req.files['image']) {
            imagePath = req.files['image'][0].path;
        }
        if (req.files['audio']) {
            audioPath = req.files['audio'][0].path;
        }

        const newGrievance = new Grievance({
            citizenName: req.body.citizenName || 'Anonymous',
            area: req.body.area,
            category: req.body.category || 'General',
            priority: req.body.priority || 'Medium',
            description: req.body.textInput || req.body.description || 'Media Evidence Submitted',
            imageUrl: imagePath,
            audioUrl: audioPath,
            status: 'Pending'
        });

        await newGrievance.save();

        res.json({ success: true, data: newGrievance });

    } catch (err) {
        console.error("Submission Error:", err);
        res.status(500).json({ success: false, error: "Failed to save grievance." });
    }
});

app.put('/api/grievances/:id', async (req, res) => {
    try {
        const updated = await Grievance.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status },
            { new: true }
        );
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));