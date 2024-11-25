import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('環境変数 MONGODB_URI が設定されていません。');
}

const uri = process.env.MONGODB_URI;

async function dbConnect() {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    return await mongoose.connect(uri);
  } catch (error) {
    console.error('MongoDB接続エラー:', error);
    throw new Error('データベースへの接続に失敗しました');
  }
}

export default dbConnect;

