// lib/models/Follow.js
import mongoose from 'mongoose';

const FollowSchema = new mongoose.Schema({
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
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// 한 유저는 하나의 게시물을 한 번만 팔로우 가능
FollowSchema.index({ user: 1, post: 1 }, { unique: true });

// Delete the model from cache if it exists to force reload
if (mongoose.models.Follow) {
    delete mongoose.models.Follow;
}

export default mongoose.model('Follow', FollowSchema);
