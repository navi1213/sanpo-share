import mongoose from 'mongoose';

// 既存のモデルをクリーンアップ
mongoose.models = {};

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'ユーザー名は必須です'],
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: [true, 'パスワードは必須です'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// 既存のインデックスを削除してから新しいインデックスを作成
userSchema.pre('save', async function(next) {
  try {
    const collection = mongoose.connection.collection('users');
    await collection.dropIndexes();
    next();
  } catch (error) {
    next();
  }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
