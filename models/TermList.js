// models/TermList.js

import mongoose from 'mongoose';

const categories = [
    'idiomas',
    'entretenimento',
    'matemática',
    'física',
    'química',
    'biologia',
    'história',
    'geografia',
    'filosofia',
];

const TermListSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    listName: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50
    },
    description: {
        type: String,
        maxlength: 250
    },
    category: {
        type: String,
        enum: categories,
        required: true,
    },
    isPublic: {
        type: Boolean,
        default: false,
        required: true,
    },
    usersWhoFavourited: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    terms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Term',
    }],
}, {
    timestamps: true, // Adiciona campos createdAt e updatedAt automaticamente
});

const TermList = mongoose.model('TermList', TermListSchema);

export default TermList;
