const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const User = require("../models/User");
const config = require("../config");

const jwtConfig = {
    secret: config.jwtSecret,
    expiresIn: config.jwtExpiresIn,
    validateConfig: () => {
        if (!config.jwtSecret) {

            if (config.nodeEnv === 'development') {
                process.env.JWT_SECRET_KEY = crypto.randomBytes(64).toString('hex');
                config.jwtSecret = process.env.JWT_SECRET_KEY;
            } else {
                process.exit(1);
            }
        }
    }
};

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = {userId: decoded.userId};
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    const query = { email };

    try {
        const existingUser = await User.findOne(query);
        if (existingUser) {
            return res.status(409).json({error: "User already exists"});
        }

        const user = new User({
            username,
            email,
            password: password,
        });

        await user.save();

        const token = jwt.sign({
                userId: user._id },
            config.jwtSecret, {
                expiresIn: jwtConfig.expiresIn
            });
        res.json({token});
    } catch(err){
        res.status(500).json({error: "Error creating user"});
    }
});

router.post("/login", async (req, res) => {
    const { password, email } = req.body;
    const query = { email };

    try {
        const user = await User.findOne(query);
        if (!user) {
            return res.status(401).json({error: "Invalid credentials"});
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({error: "Invalid credentials"});
        }

        const token = await jwt.sign(
            { userId: user._id },
            config.jwtSecret,
            { expiresIn: jwtConfig.expiresIn }
        );

        res.cookie("token", token, {
            maxAge: 3600000,
            sameSite: "strict",
            httpOnly: true,
            secure: config.nodeEnv === "production",
        });

        res.json({token});
    } catch(err){
        res.status(500).json({error: "Login Error"});
    }
});

router.post("/logout", (req, res) => {
    if (!req.cookies.token) {
        return res.status(400).json({ error: "No token found" });
    }

    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
});

router.get("/current-user", authenticateJWT, async (req, res) => {
    try {
        res.json({ userId: req.user.userId });
    } catch (err) {
        res.status(500).json({ error: "Unable to fetch current user" });
    }
});

jwtConfig.validateConfig();

module.exports = {router, authenticateJWT, jwtConfig};