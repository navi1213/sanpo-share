import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: 'ユーザー名とパスワードは必須です' },
        { status: 400 }
      );
    }

    // 既存ユーザーの確認
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { message: 'このユーザー名は既に使用されています' },
        { status: 409 }
      );
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12);

    // 新規ユーザーの作成
    const newUser = new User({
      username,
      password: hashedPassword, // ハッシュ化したパスワードを保存
    });

    await newUser.save();

    return NextResponse.json(
      { message: 'ユーザー登録が完了しました！' },
      { status: 201 }
    );
  } catch (error) {
    console.error('登録処理中にエラー:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { message: 'バリデーションエラー', error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'サーバーエラーが発生しました', error: error.message },
      { status: 500 }
    );
  }
}

