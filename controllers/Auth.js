import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User({ username, email, password });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const signin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                avatar: user.avatar,
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const googleSignin = async (req, res) => {
    const { username, email } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            const password = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
            user = new User({ username, email, password }); 
            await user.save();
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                avatar: user.avatar,
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const signout = (req, res) => {
    res.cookie('token', '', { maxAge: 1 });
    res.status(200).json({ message: 'Signed out successfully' });
};
