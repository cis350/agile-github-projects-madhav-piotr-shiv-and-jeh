const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const UserModel = require('./models/Users')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const verifyToken = require('./auth');


const app = express()
app.use(express.json())
app.use(cors())

mongoose.connect("mongodb+srv://plazarek:AjBjyBowQlMUgYxr@cluster0.xnjfdga.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

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
            return res.status(401).json({ message: "The password is incorrect" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '5m' });

        res.json({ message: "Success", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.get('/protected-route', verifyToken, (req, res) => {
    // This route is now protected, your route logic here
    res.json({ message: "This is protected data." });
});

app.listen(3001, () => {
    console.log("server is running");
})