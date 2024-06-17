import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/Auth.js';
import userRoutes from './routes/User.js';
import termListRoutes from './routes/TermList.js';
import termRoutes from './routes/Term.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/termlists', termListRoutes);
app.use('/api/terms', termRoutes);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message
    })
})

app.use(express.static(path.join(__dirname, '/client/build')))
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/client/build/index.html'))
});

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Conectado ao MongoDB!');
    })
    .catch((err) => {
        console.log('Erro ao conectar com MongoDB: ' + err);
    })

app.listen(8080, () => {
    console.log(`Servidor rodando na porta 8080`);
}) 
