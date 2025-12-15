// lib/models/Vote.js
import mongoose from 'mongoose';

const VoteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    voteType: {
        type: String,
        enum: ['up', 'down'],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// 한 유저는 하나의 게시물에 하나의 투표만 가능
VoteSchema.index({ user: 1, post: 1 }, { unique: true });

// Delete the model from cache if it exists to force reload
if (mongoose.models.Vote) {
    delete mongoose.models.Vote;
}

export default mongoose.model('Vote', VoteSchema);
