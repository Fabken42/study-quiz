import express from 'express';
import { verifyToken } from '../utils/verifyToken.js'; // Middleware de autenticação
import { createTermList, getRecentlyVisitedLists, getPopularLists, getTermListById, toggleFavourite, updateTermListTerms, resetStatus, getQuizTerms, deleteTermList } from '../controllers/TermList.js';

const router = express.Router();

router.post('/create', verifyToken, createTermList);
router.get('/recent', getRecentlyVisitedLists);
router.get('/popular', getPopularLists);
router.get('/:termListId/play', getQuizTerms);
router.get('/:termListId', getTermListById);
router.put('/:termListId/favourite', verifyToken, toggleFavourite);
router.post('/:termListId/edit', verifyToken, updateTermListTerms);
router.post('/:termListId/reset-status', verifyToken, resetStatus);
router.delete('/:termListId/delete', verifyToken, deleteTermList);

export default router;
