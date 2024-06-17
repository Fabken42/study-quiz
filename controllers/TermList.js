import Term from '../models/Term.js';
import TermList from '../models/TermList.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

export const createTermList = async (req, res) => {
    const { listName, description, category, isPublic } = req.body;
    try {
        const newTermList = new TermList({
            author: req.user._id,
            listName,
            description,
            category,
            isPublic
        });
        const savedTermList = await newTermList.save();

        await User.findByIdAndUpdate(req.user._id, {
            $push: { createdTermLists: savedTermList._id }
        });

        res.status(201).json(savedTermList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const toggleFavourite = async (req, res) => {
    const { termListId } = req.params;
    const userId = req.user._id;

    try {
        const termList = await TermList.findById(termListId);

        if (!termList) {
            return res.status(404).json({ message: 'Term list not found' });
        }

        // Verifica se o usuário já favoritou a lista
        const userIndex = termList.usersWhoFavourited.indexOf(userId);

        if (userIndex === -1) {
            // Adicionar usuário aos favoritos
            termList.usersWhoFavourited.push(userId);
        } else {
            // Remover usuário dos favoritos
            termList.usersWhoFavourited.splice(userIndex, 1);
        }

        await termList.save();

        return res.status(200).json({ message: 'Favourite status toggled' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

export const getTermListById = async (req, res) => {
    try {
        const termList = await TermList.findById(req.params.termListId)
            .populate({
                path: 'terms',
                populate: ('statuses.user', '_id')
            })
            .populate({
                path: 'author',
                select: 'username'
            });

        if (!termList) {
            return res.status(404).json({ message: 'Term list not found' });
        }

        res.json({
            ...termList.toObject(),
            isPublic: termList.isPublic
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const updateTermListTerms = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { listName, description, terms, isPublic } = req.body;
        const { termListId } = req.params;

        if (terms.length > 300) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'A lista de termos não pode ter mais de 300 termos.' });
        }

        const adjustedListName = listName.trim().replace(/\s+/g, ' ');
        const adjustedDescription = description.trim().replace(/\s+/g, ' ');

        const termList = await TermList.findById(termListId).session(session);
        if (!termList) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Term list not found' });
        }

        if (termList.author.toString() !== req.user._id.toString()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: 'Unauthorized to update this term list' });
        }

        termList.listName = adjustedListName;
        termList.description = adjustedDescription;
        termList.isPublic = isPublic;
        await termList.save({ session });

        for (const term of terms) {
            const adjustedTerm = term.term.trim().replace(/\s+/g, ' ');
            const adjustedDefinition = term.definition.trim().replace(/\s+/g, ' ');
            const adjustedReminder = term.reminder ? term.reminder.trim().replace(/\s+/g, ' ') : '';

            if (!adjustedTerm || adjustedTerm.length < 1 || adjustedTerm.length > 100) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: 'Termo deve ter entre 1 e 100 caracteres.' });
            }
            if (!adjustedDefinition || adjustedDefinition.length < 1 || adjustedDefinition.length > 100) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: 'Definição deve ter entre 1 e 100 caracteres.' });
            }
            if (adjustedReminder && adjustedReminder.length > 100) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: 'Lembrete deve ter no máximo 100 caracteres.' });
            }

            term.term = adjustedTerm;
            term.definition = adjustedDefinition;
            term.reminder = adjustedReminder;
        }

        const updatedTerms = await Promise.all(terms.map(async (term) => {
            if (term._id) {
                return Term.findByIdAndUpdate(term._id, term, { new: true, session });
            } else {
                const newTerm = new Term({
                    ...term,
                    author: req.user._id
                });
                await newTerm.save({ session });
                return newTerm;
            }
        }));

        termList.terms = updatedTerms.map(term => term._id);
        await termList.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.json(termList);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: 'Server error', error });
    }
};

export const resetStatus = async (req, res) => {
    try {
        const { termListId } = req.params;
        const userId = req.user._id;

        const termList = await TermList.findById(termListId).populate('terms');
        if (!termList) {
            return res.status(404).json({ message: 'Term list not found' });
        }

        const termPromises = termList.terms.map(async (term) => {
            const termDoc = await Term.findById(term._id);
            if (termDoc) {
                termDoc.statuses = termDoc.statuses.filter(status => !status.user.equals(userId));
                return termDoc.save();
            }
        });

        await Promise.all(termPromises); 

        res.json({ message: 'Status reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getRecentlyVisitedLists = async (req, res) => {
    try {
        const ids = req.query.ids.split(',').map(id => id.trim()); 
        const lists = await TermList.find({ _id: { $in: ids }, isPublic: true })
            .limit(3)
            .populate('author', 'username avatar')
            .populate({
                path: 'terms',
                populate: ('statuses.user', '_id')
            });
        res.json(lists);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getPopularLists = async (req, res) => {
    try {
        const category = req.query.category;
        const query = { isPublic: true };

        if (category) {
            query.category = category;
        }

        const popularLists = await TermList.find(query)
            .sort({ usersWhoFavourited: -1 })
            .limit(24)
            .populate('author', 'username avatar')
            .populate({
                path: 'terms',
                populate: ('statuses.user', '_id')
            });
        res.json(popularLists);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

 
export const getQuizTerms = async (req, res) => {
    const { includePerfect, rounds } = req.query;
    const { termListId } = req.params;

    try {
        const termList = await TermList.findById(termListId).populate('terms');
        if (!termList) {
            return res.status(404).json({ error: 'Lista de termos não encontrada' });
        }

        let terms = termList.terms;

        if (includePerfect === 'false') {
            terms = terms.filter(term => term.statuses.every(status => status.status !== 7));
        }

        if (terms.length < 4) {
            return res.status(400).json({ error: 'Não há termos suficientes para o quiz. É necessário pelo menos 4 termos.' });
        }

        // Shuffle the terms
        const shuffledTerms = terms.sort(() => 0.5 - Math.random());

        let selectedTerms = [];
        if (rounds <= shuffledTerms.length) {
            selectedTerms = shuffledTerms.slice(0, rounds);
        } else {
            selectedTerms = shuffledTerms;
        }
        res.json(selectedTerms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteTermList = async (req, res) => {
    const { termListId } = req.params;

    try {
        const termList = await TermList.findById(termListId);

        if (!termList) {
            return res.status(404).json({ message: 'Term list not found' });
        }

        if (termList.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to delete this term list' });
        }

        await Term.deleteMany({ _id: { $in: termList.terms } });
        await termList.deleteOne();

        res.json({ message: 'Term list deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};