require('dotenv').config();
const config = require('./config.json');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const upload = require('./multer');
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('./utilities');

const User = require('./models/user.model');
const TravelStory = require('./models/travelStory.model');

mongoose.connect(config.connectionString);

// Create folders if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "https://tripscribe.onrender.com"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// --- AUTH ROUTES ---

app.post("/create-account", async (req, res) => {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ message: "All fields required" });

    const isUser = await User.findOne({ email });
    if (isUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ fullName, email, password: hashedPassword });
    await user.save();

    const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '72h' });
    return res.status(201).json({ error: false, user: { fullName: user.fullName, email: user.email }, accessToken, message: "Registration successful" });
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '72h' });
    return res.json({ error: false, message: "Login successful", user: { fullName: user.fullName, email: user.email }, accessToken });
});

app.get("/get-user", authenticateToken, async (req, res) => {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.sendStatus(401);
    return res.json({ error: false, user });
});

// --- IMAGE HANDLING ---

app.post("/image-upload", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: true, message: "No file uploaded" });
        const protocol = req.get('host').includes('localhost') ? 'http' : 'https';
        const imageUrl = `${protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.status(200).json({ imageUrl });
    } catch (err) { res.status(500).json({ message: "Upload error" }); }
});

app.delete("/delete-image", async (req, res) => {
    const { imageUrl } = req.query;
    if (!imageUrl) return res.status(400).json({ message: "No URL provided" });
    try {
        const filename = path.basename(imageUrl);
        const filePath = path.join(__dirname, 'uploads', filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.status(200).json({ message: "Image deleted" });
        } else {
            res.status(404).json({ message: "File not found" });
        }
    } catch (err) { res.status(500).json({ message: "Delete error" }); }
});

// --- TRAVEL STORY ROUTES ---

app.post("/add-travel-story", authenticateToken, async (req, res) => {
    const { title, story, visitedLocations, imageUrl, visitedDate } = req.body;
    if (!title || !story || !imageUrl || !visitedDate) return res.status(400).json({ message: "Fields missing" });

    try {
        const newStory = new TravelStory({
            title, story, visitedLocations, imageUrl, 
            visitedDate: new Date(Number(visitedDate)), 
            userId: req.user.userId 
        });
        await newStory.save();
        res.status(201).json({ error: false, message: "Story added", story: newStory });
    } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/get-all-stories", authenticateToken, async (req, res) => {
    try {
        const stories = await TravelStory.find({ userId: req.user.userId }).sort({ visitedDate: -1 });
        res.status(200).json({ stories });
    } catch (err) { res.status(500).json({ message: "Fetch error" }); }
});

app.put("/edit-travel-story/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, story, visitedLocations, imageUrl, visitedDate } = req.body;
    
    try {
        const travelStory = await TravelStory.findOne({ _id: id, userId: req.user.userId });
        if (!travelStory) return res.status(404).json({ message: "Story not found" });

        const protocol = req.get('host').includes('localhost') ? 'http' : 'https';
        const placeholderImgUrl = `${protocol}://${req.get('host')}/assets/placeholder.jpg`;

        travelStory.title = title;
        travelStory.story = story;
        travelStory.visitedLocations = visitedLocations;
        travelStory.imageUrl = imageUrl || placeholderImgUrl;
        travelStory.visitedDate = new Date(Number(visitedDate));

        await travelStory.save();
        res.status(200).json({ story: travelStory, message: "Update successful" });
    } catch (err) { res.status(500).json({ message: "Update error" }); }
});

app.delete("/delete-travel-story/:id", authenticateToken, async (req, res) => {
    try {
        const travelStory = await TravelStory.findOne({ _id: req.params.id, userId: req.user.userId });
        if (!travelStory) return res.status(404).json({ message: "Story not found" });

        await TravelStory.deleteOne({ _id: req.params.id, userId: req.user.userId });
        res.status(200).json({ message: "Story deleted" });
    } catch (err) { res.status(500).json({ message: "Delete error" }); }
});

app.put("/update-is-favourite/:id", authenticateToken, async (req, res) => {
    try {
        const story = await TravelStory.findOne({ _id: req.params.id, userId: req.user.userId });
        if (!story) return res.status(404).json({ message: "Not found" });
        story.isFavourite = req.body.isFavourite;
        await story.save();
        res.status(200).json({ story, message: "Updated" });
    } catch (err) { res.status(500).json({ message: "Fav error" }); }
});

app.get("/search", authenticateToken, async (req, res) => {
    const { query } = req.query;
    try {
        const searchResults = await TravelStory.find({
            userId: req.user.userId,
            $or: [
                { title: { $regex: query, $options: "i" } },
                { story: { $regex: query, $options: "i" } },
                { visitedLocations: { $regex: query, $options: "i" } }
            ]
        }).sort({ visitedDate: -1 });
        res.status(200).json({ stories: searchResults });
    } catch (err) { res.status(500).json({ message: "Search error" }); }
});

app.get("/travel-stories/filter", authenticateToken, async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const stories = await TravelStory.find({
            userId: req.user.userId,
            visitedDate: { $gte: new Date(Number(startDate)), $lte: new Date(Number(endDate)) }
        }).sort({ visitedDate: -1 });
        res.status(200).json({ stories });
    } catch (err) { res.status(500).json({ message: "Filter error" }); }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));