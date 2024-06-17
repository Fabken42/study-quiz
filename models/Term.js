import mongoose from 'mongoose';

const UserStatusSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: Number,
        required: true,
        default: 4,
        min: 1, // pior desempenho
        max: 7  // melhor desempenho
    }
}, {
    _id: false // Evita a criação automática de _id para subdocumentos
});

const TermSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    term: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 100
    },
    definition: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 100
    },
    reminder: {
        type: String,
        maxlength: 100
    },
    statuses: [UserStatusSchema] // Array de subdocumentos
}, {
    timestamps: true // Adiciona campos createdAt e updatedAt automaticamente
});

const Term = mongoose.model('Term', TermSchema);

export default Term;
