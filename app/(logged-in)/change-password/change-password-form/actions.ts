"use server";

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { users } from "@/db/usersSchema";
import { passwordMatchSchema } from "@/validation/passwordMatchSchema";
import { passwordSchema } from "@/validation/passwordSchema";
import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const changePassword = async ({
  currentPassword,
  password,
  passwordConfirm,
}: {
  currentPassword: string;
  password: string;
  passwordConfirm: string;
}) => {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: true,
      message: "パスワードを変更するにはログインする必要があります。",
    };
  }
  const formSchema = z
    .object({
      currentPassword: passwordSchema,
    })
    .and(passwordMatchSchema);

  const passwordValidation = formSchema.safeParse({
    currentPassword,
    password,
    passwordConfirm,
  });

  if (passwordValidation?.error) {
    return {
      error: true,
      message:
        passwordValidation?.error.issues?.[0]?.message ??
        "エラーが発生しました",
    };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, parseInt(session.user.id)));

  if(!user) {
    return {
        error:true,
        message:"ユーザーが見つかりませんでした。"
    }
  }
  const passwordMatch = await compare(currentPassword,user.password!);

  if(!passwordMatch) {
    return {
        error:true,
        message:"現在のパスワードが間違っています。"
    }
  }

  const hashedPassword = await hash(password,10);

  await db.update(users).set({
    password:hashedPassword
  }).where(eq(users.id, parseInt(session.user.id)));
};
