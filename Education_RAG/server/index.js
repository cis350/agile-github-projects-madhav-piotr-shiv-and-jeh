const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const UserModel = require('./models/Users')

const app = express()
app.use(express.json())
app.use(cors())

mongoose.connect("mongodb+srv://plazarek:AjBjyBowQlMUgYxr@cluster0.xnjfdga.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

app.post('/signup', (req, res) => {
    const { email, password } = req.body;

    // Basic password validation (you can expand this based on your rules)
    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    UserModel.findOne({ email: email })
        .then(user => {
            if (user) {
                return res.status(400).json({ message: "An account with this email already exists." });
            } else {
                UserModel.create(req.body)
                    .then(users => res.json({ message: "User created successfully." }))
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({ message: "Error creating user." });
                    });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Server error." });
        });
});

app.post('/login', (req, res) => {
    const {email, password} = req.body;
    UserModel.findOne({email: email})
    .then(user => {
        if (!user) {
            return res.status(404).json({ message: "No account exists with this email" });
        } 
        if (user.password !== password) {
            return res.status(401).json({ message: "The password is incorrect" });
        }
        res.json({ message: "Success" });
    }).catch(err => {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    });
});

app.listen(3001, () => {
    console.log("server is running");
})