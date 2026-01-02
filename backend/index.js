require('dotenv').config();
console.log("JWT SECRET:", process.env.ACCESS_TOKEN_SECRET);

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


const app = express();

app.use(express.json());

app.use(cors({
   
    origin: [
        "http://localhost:5173", 
        "https://tripscribe.onrender.com"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));




app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));

app.post("/create-account",async (req, res) => {
   const { fullName, email, password } = req.body;

   if (!fullName || !email || !password) {
         return res.status(400).json({ message: "All fields are required." });

   }

   const isUser = await User.findOne({ email });
    if (isUser) {
        return res.status(400).json({ message: "User already exists." });
    }


const hashedPassword = await bcrypt.hash(password, 10);
const user = new User({
    fullName,
    email,
    password: hashedPassword
});
await user.save();

const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '72h' }
);

 return res.status(201).json({ 
    error: false,
    user: {fullName: user.fullName, email: user.email },
    accessToken,
    message: "Registeration successful.",});

});


app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "user not found." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid credentials." });
    }


    const accessToken = jwt.sign(
        { userId: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '72h' }
    );

    return res.json({ 
        error: false,
        message: "Login successful.",
        user: {fullName: user.fullName, email: user.email },
        accessToken,
    })
});


app.get("/get-user", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId; // ✅ from decoded JWT

        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.sendStatus(401);
        }

        return res.json({
            error: false,
            user,
            message: ""
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
});




app.post("/image-upload", upload.single("image"), async (req, res) => {

try {
    if (!req.file) {
        return res
        .status(400)
        .json({ error: true, message: "No file uploaded" });
    }
    const imageUrl = `http://localhost:8000/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
} catch (err) {
    res.status(500).json({ error: true, message: "Server error" });
}

});



app.delete("/delete-image", async (req, res) => {
    if (!req.body || !req.body.imageUrl) {
        return res.status(400).json({ 
            error: true, 
            message: "Custom Error: No Image URL provided in request body" 
        });
    }

    const { imageUrl } = req.body; 
    
    try {
        const filename = path.basename(imageUrl);
        
        const filePath = path.join(__dirname, 'uploads', filename); 

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return res.status(200).json({
                error: false,
                message: "Image deleted successfully",
            });
        } else {
           
            return res.status(404).json({
                error: true, 
                message: "Image file does not exist on server."
            });
        }
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});


app.post("/add-travel-story", authenticateToken, async (req, res) => {
    try {
        const { title, story, visitedLocations, imageUrl, visitedDate } = req.body;
        
const userId = req.user._id || req.user.userId || (req.user.user && req.user.user._id);

        
        if (!title || !story || !imageUrl || !visitedDate || !visitedLocations) {
            return res.status(400).json({ 
                error: true, 
                message: "All fields are required." 
            });
        }

        
        const parsedDate = new Date(Number(visitedDate));

        
        const newStory = new TravelStory({
    title,
    story,
    visitedLocations,
    imageUrl,
    visitedDate: parsedDate,
    userId: userId, 
});

        await newStory.save();

        res.status(201).json({ 
            error: false, 
            message: "Travel story added successfully", 
            data: newStory 
        });
    } catch (err) {
        console.error("Error adding travel story:", err);
        res.status(500).json({ error: true, message: "Server error" });
    }
});

app.get("/get-all-stories", authenticateToken, async (req, res) => {
    const {userId}= req.user;
    try{
        const travelStories = await TravelStory.find({userId}).sort({visitedDate: -1});
        res.status(200).json({stories: travelStories});
    } catch(err){
        res.status(500).json({error: true, message: "Server error"});
    }
});


app.put("/edit-travel-story/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, story, visitedLocations, imageUrl, visitedDate } = req.body;

    const userId = req.user._id || req.user.userId || (req.user.user && req.user.user._id);

  
    if (!title || !story || !visitedDate || !visitedLocations) {
        return res.status(400).json({ error: true, message: "All fields are required." });
    }

    const parsedDate = isNaN(visitedDate) ? new Date(visitedDate) : new Date(Number(visitedDate));

    try {
       
        const travelStory = await TravelStory.findOne({ _id: id, userId: userId });

        if (!travelStory) {
            return res.status(404).json({ error: true, message: "Travel story not found or unauthorized." });
        }

        const placeholderImgUrl = "http://localhost:8000/assets/placeholder.jpg";

    
        travelStory.title = title;
        travelStory.story = story;
        travelStory.visitedLocations = visitedLocations;
        travelStory.imageUrl = imageUrl || placeholderImgUrl;
        travelStory.visitedDate = parsedDate;

        await travelStory.save();

        res.status(200).json({ story: travelStory, message: "Update successful" });

    } catch (err) {
        console.error("Edit Error:", err);
        res.status(500).json({ error: true, message: "Server error" });
    }
});

app.delete("/delete-travel-story/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id || req.user.userId || (req.user.user && req.user.user._id);

    try {
        const travelStory = await TravelStory.findOne({ _id: id, userId: userId });

        if (!travelStory) {
            return res.status(404).json({ error: true, message: "Travel story not found or unauthorized." });
        }

        await TravelStory.deleteOne({ _id: id, userId: userId });

        const imageUrl = travelStory.imageUrl;

        if (imageUrl && !imageUrl.includes('placeholder.jpg')) {
            const filename = path.basename(imageUrl);
            const filePath = path.join(__dirname, 'uploads', filename);

            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) console.error("Failed to delete image file:", err);
                });
            }
        }

        res.status(200).json({ message: "Travel story and associated image deleted successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: "Server error" });
    }
});

app.put("/update-is-favourite/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { isFavourite } = req.body;
    const userId = req.user._id || req.user.userId || (req.user.user && req.user.user._id);

    try {
        const travelStory = await TravelStory.findOne({ _id: id, userId: userId });
        if (!travelStory) {
            return res.status(404).json({ error: true, message: "Travel story not found or unauthorized." });
        }
        travelStory.isFavourite = isFavourite;
        await travelStory.save();
        res.status(200).json({ message: "Favourite status updated successfully.", story: travelStory });
    } catch (err) {
        res.status(500).json({ error: true, message: "Server error" });
    }
});


app.get("/search", authenticateToken, async (req, res) => {
    const { query } = req.query;
    
    const userId = req.user._id || req.user.userId || (req.user.user && req.user.user._id);

   
    if (!query) {
        return res.status(400).json({ error: true, message: "Search query is required" });
    }

    try {
        const searchResults = await TravelStory.find({
            userId: userId, 
            $or: [
                { title: { $regex: query, $options: "i" } },
                { story: { $regex: query, $options: "i" } },
                { visitedLocations: { $regex: query, $options: "i" } },
            ],
        }).sort({ visitedDate: -1 });

        res.status(200).json({ stories: searchResults });
    } catch (err) {
        console.error("Search Error:", err);
        res.status(500).json({ error: true, message: "Server error" });
    }
});



app.get('/travel-stories/filter', authenticateToken, async (req, res) => {
    const { startDate, endDate } = req.query;
    
    
    const userId = req.user._id || req.user.userId || (req.user.user && req.user.user._id);

    try {
       
        if (!startDate || !endDate) {
            return res.status(400).json({ 
                error: true, 
                message: "Both startDate and endDate are required" 
            });
        }

        const start = new Date(parseInt(startDate));
        const end = new Date(parseInt(endDate));

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ 
                error: true, 
                message: "Invalid date format. Please send valid timestamps." 
            });
        }

        end.setHours(23, 59, 59, 999);

        const filteredStories = await TravelStory.find({
            userId: userId,
            visitedDate: { 
                $gte: start, 
                $lte: end 
            },
        }).sort({ visitedDate: -1 });

       
        res.status(200).json({ 
            stories: filteredStories,
            count: filteredStories.length 
        });

    } catch (err) {
        console.error("Filter Error:", err);
        res.status(500).json({ 
            error: true, 
            message: "Internal Server Error" 
        });
    }
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));





const PORT = process.env.PORT || 8000; 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
module.exports = app;