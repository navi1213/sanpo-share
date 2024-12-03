"use server";
import db from "@/db/drizzle";
import { passwordMatchSchema } from "@/validation/passwordMatchSchema";
import { z } from "zod";
import { hash } from "bcryptjs";
import {users} from "@/db/schema"
export const registerUser = async ({
  email,
  password,
  passwordConfirm,
}: {
  email: string;
  password: string;
  passwordConfirm: string;
}) => {
    try {

    
  const newUserSchema = z
    .object({
      email: z.string().email(),
    })
    .and(passwordMatchSchema);

  const newUserValidation = newUserSchema.safeParse({
    email,
    password,
    passwordConfirm,
  });
  if (!newUserValidation.success) {
    return {
      error: true,
      message:
        newUserValidation.error.issues[0]?.message ?? "エラーが発生しました",
    };
  }
  const hashedPassword = await hash(password,10);

  await db.insert(users).values({
    email,
    password:hashedPassword,
  })
}catch(e:unknown) {
  if (e instanceof Error && "code" in e) {
    const code = (e as any).code;
    if(code === "23505") {
        return {
            error:true,
            message:"このメールアドレスで登録されたアカウントがすでに存在します。"
        }
    }
    return {
        error:true,
        message:"エラーが発生しました"
    }
}
}
};
