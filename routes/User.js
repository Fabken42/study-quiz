import express from 'express';
import { verifyToken } from '../utils/verifyToken.js';
import { getUserLists, editUserProfile } from '../controllers/User.js';

const router = express.Router();

router.get('/:userId/termlists', getUserLists);
router.put('/:userId/edit-profile', verifyToken, editUserProfile);

export default router;
