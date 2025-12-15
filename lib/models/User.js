// lib/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    reputation: {
        type: Number,
        default: 1,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// 비밀번호 해싱 미들웨어
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return; // next() 호출 필요 없음
    this.password = await bcrypt.hash(this.password, 10);
    // 함수가 완료되면 자동으로 다음 작업으로 넘어갑니다.
});

// 비밀번호 비교 메서드
UserSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);