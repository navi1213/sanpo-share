"use server";

import db from "@/db/drizzle";
import { hash } from "bcryptjs";
import { users } from "@/db/usersSchema";
import { userRegistrationSchema } from "@/validation/schemas";

export const registerUser = async ({
  email,
  username,
  password,
  passwordConfirm,
}: {
  email: string;
  username: string;
  password: string;
  passwordConfirm: string;
}) => {
  console.log('=== registerUser 開始 ===');
  console.log('registerUser: 受信データ', { email, username, password: '***', passwordConfirm: '***' });
  console.log('registerUser: データ型確認', {
    emailType: typeof email,
    emailLength: email?.length,
    emailValue: email,
    emailEmpty: email === '',
    emailUndefined: email === undefined,
    emailNull: email === null,
    usernameType: typeof username,
    usernameLength: username?.length,
    usernameValue: username
  });

  try {
    console.log('registerUser: バリデーション前のデータ準備');
    const dataToValidate = {
      email,
      username,
      password,
      confirmPassword: passwordConfirm, // 注意: フィールド名を confirmPassword に変更
    };
    console.log('registerUser: バリデーション用データ', dataToValidate);

    const newUserValidation = userRegistrationSchema.safeParse(dataToValidate);
    
    console.log('registerUser: バリデーション結果', {
      success: newUserValidation.success,
      error: newUserValidation.error?.issues || null
    });
    
    if (!newUserValidation.success) {
      console.log('registerUser: バリデーションエラー詳細', newUserValidation.error);
      console.log('registerUser: エラーの最初の問題', newUserValidation.error.issues[0]);
      return {
        error: true,
        message:
          newUserValidation.error.issues[0]?.message ?? "エラーが発生しました",
      };
    }
    
    const hashedPassword = await hash(password, 10);
    
    await db.insert(users).values({
      email,
      username,
      password: hashedPassword,
    });

    return {
      success: true,
      message: "ユーザー登録が完了しました。",
    };
  } catch (e: unknown) {
    if (e instanceof Error) {
      // "code" プロパティがあるか確認
      if (
        typeof e === "object" &&
        e !== null &&
        "code" in e &&
        typeof (e as { code: unknown }).code === "string"
      ) {
        const code = (e as { code: string }).code;
        if (code === "23505") {
          return {
            error: true,
            message:
              "このメールアドレスもしくはユーザー名で登録されたアカウントがすでに存在します。",
          };
        }
      }
    }
    
    return {
      error: true,
      message: "エラーが発生しました",
    };
  }
};
