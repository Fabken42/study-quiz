import TermList from '../models/TermList.js';
import User from '../models/User.js';

// Função para obter listas favoritedas e listas criadas pelo usuário
export const getUserLists = async (req, res) => {
    const userId = req.params.userId;
    try {
        // Listas criadas pelo usuário
        const createdLists = await TermList.find({ author: userId }).populate([{ path: 'terms' }, { path: 'author', select: 'avatar username' }]);

        // Listas favoritedas pelo usuário
        const favouritedLists = await TermList.find({ usersWhoFavourited: userId }).populate([{ path: 'terms' }, { path: 'author', select: 'avatar username' }]);

        return res.status(200).json({
            createdLists,
            favouritedLists
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

export const editUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.username = req.body.username || user.username;
        if (req.body.password) {
            user.password = req.body.password;
        }
        user.avatar = req.body.avatar || user.avatar;

        const updatedUser = await user.save();
        res.json({
            id: updatedUser._id,
            username: updatedUser.username,
            avatar: req.body.avatar || updatedUser.avatar,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};