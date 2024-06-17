import express from 'express';
import { signup, signin, signout, googleSignin } from '../controllers/Auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/signout', signout);
router.post('/google-signin', googleSignin);

export default router;
