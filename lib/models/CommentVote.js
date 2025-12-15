// lib/models/CommentVote.js
import mongoose from 'mongoose';

const CommentVoteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
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

// 한 유저는 하나의 댓글에 하나의 투표만 가능
CommentVoteSchema.index({ user: 1, comment: 1 }, { unique: true });

// Delete the model from cache if it exists to force reload
if (mongoose.models.CommentVote) {
    delete mongoose.models.CommentVote;
}

export default mongoose.model('CommentVote', CommentVoteSchema);
