const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const UserModel = require('./models/Users')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const ChatModel = require('./models/Chat');
const verifyToken = require('./auth');


const app = express()
app.use(express.json())
app.use(cors())

//mongoose.connect("mongodb+srv://plazarek:AjBjyBowQlMUgYxr@cluster0.xnjfdga.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
//mongoose.connect("mongodb+srv://madhavpuri100:@cluster0.xnjfdga.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
mongoose.connect("mongodb+srv://madhavpuri100:k8c6gNkdmon2hves@cluster0.hjtbryn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

app.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    try {
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "An account with this email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await UserModel.create({ email, password: hashedPassword });
        
        res.status(201).json({ message: "User created successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating user." });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "No account exists with this email." });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "The password is incorrect." });
        }

        // Include user's email in the token
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '5m' });

        res.json({ message: "Success", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

app.get('/get-user-id', verifyToken, async (req, res) => {
    const email = req.email; // Extracted from the token in `verifyToken` middleware

    try {
        const user = await UserModel.findOne({ email: email }).select('_id');
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({ userId: user._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching user ID." });
    }
});

app.post('/update-settings', verifyToken, async (req, res) => {
    const { userId, settings } = req.body;

    console.log(userId, settings)

    try {
        // Update user settings based on the provided userId
        const updatedUser = await UserModel.findByIdAndUpdate(userId, {
            $set: { "settings": settings }
        }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({ message: "Settings updated successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating settings." });
    }
});

app.get('/get-user-settings', verifyToken, async (req, res) => {
    const email = req.email; // Extracted from the token in `verifyToken` middleware

    try {
        const user = await UserModel.findOne({ email: email }, 'settings');
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({ settings: user.settings });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching user settings." });
    }
});

app.get('/protected-route', verifyToken, (req, res) => {
    // This route is now protected, your route logic here
    res.json({ message: "This is protected data." });
});


// Message POST

app.post('/send-message', verifyToken, async (req, res) => {
    const { chatId, message, isUserMessage } = req.body;
    const userEmail = req.email;

    if (!message) {
        return res.status(400).json({ message: "Message content cannot be empty." });
    }

    try {
        // Update chat with the user's message
        const chat = await ChatModel.findOneAndUpdate(
            { chatId: chatId, userEmail: userEmail },
            {
                $push: { messages: { message, isUserMessage, createdAt: new Date() } },
                $set: { lastActivity: new Date() }
            },
            { new: true }
        );

        if (!chat) {
            return res.status(404).json({ message: "Chat not found or access denied." });
        }

        // Generate a response from the bot
        const botMessage = {
            message: "Hello, I'm the CIS 350 TA. How can I assist you today?",
            isUserMessage: false,
            createdAt: new Date()
        };

        // Append bot's message to the chat
        await ChatModel.findOneAndUpdate(
            { chatId: chatId, userEmail: userEmail },
            {
                $push: { messages: botMessage },
                $set: { lastActivity: new Date() }
            },
            { new: true }
        );

        // Send back the updated chat including the bot's response
        res.status(201).json({ message: "Message sent successfully.", chat: chat.messages.concat(botMessage) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error sending message." });
    }
});

// Fetch messages for a chat
app.get('/fetch-messages/:chatId', verifyToken, async (req, res) => {
    const { chatId } = req.params;
    const userEmail = req.email;

    try {
        const chat = await ChatModel.findOne({ chatId: chatId, userEmail: userEmail }).populate('userEmail');
        if (!chat) {
            return res.status(404).json({ message: "Chat not found or access denied." });
        }

        res.json({ message: "Messages fetched successfully.", messages: chat.messages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching messages." });
    }
});

// Create a new chat
app.post('/api/chats', verifyToken, async (req, res) => {
    const { chatName } = req.body;
    const userEmail = req.email;

    try {
        const newChat = new ChatModel({
            chatId: new mongoose.Types.ObjectId().toString(),
            chatName,
            userEmail,
            messages: []
        });
        await newChat.save();
        res.status(201).json(newChat);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating new chat.", error: err.message });
    }
});

// Fetch all chats
app.get('/api/chats', verifyToken, async (req, res) => {
    const userEmail = req.email;

    try {
        const chats = await ChatModel.find({ userEmail }).select('chatId chatName createdAt');
        res.json({ chats });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching chats." });
    }
});

// Endpoint to delete a chat
app.delete('/api/chats/:chatId', verifyToken, async (req, res) => {
    const { chatId } = req.params;
    const userEmail = req.email;

    try {
        const chat = await ChatModel.findOneAndDelete({ chatId: chatId, userEmail: userEmail });
        if (!chat) {
            return res.status(404).json({ message: "Chat not found or access denied." });
        }
        res.json({ message: "Chat deleted successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error deleting chat." });
    }
});

app.listen(3001, () => {
    console.log("server is running");
})

module.exports = app;