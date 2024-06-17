// controllers/termController.js

import Term from '../models/Term.js';

// Função para atualizar o status do termo
export const updateTermStatus = async (req, res) => {
    try {
        const { termId } = req.params;
        const { userId, isCorrect } = req.body;

        const term = await Term.findById(termId);
        if (!term) {
            return res.status(404).json({ message: 'Term not found' });
        }

        let userStatus = term.statuses.find(status => status.user.toString() === userId);
        if (!userStatus) {
            // Se não houver status anterior para o usuário, cria um novo status
            userStatus = {
                user: userId,
                status: isCorrect ? 5 : 3
            };
            term.statuses.push(userStatus);
        } else {
            // Atualiza o status existente
            userStatus.status += isCorrect ? 1 : -1;
            userStatus.status = Math.min(Math.max(userStatus.status, 1), 7); // Garante que o status fique entre 1 e 7
        }

        await term.save();
        res.status(200).json({ message: 'Term status updated', term });
    } catch (error) {
        res.status(500).json({ message: 'Error updating term status', error });
    }
};
