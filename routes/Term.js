import express from 'express';
import { updateTermStatus } from '../controllers/Term.js';

const router = express.Router();

router.put('/:termId/updateStatus', updateTermStatus);

export default router;
 