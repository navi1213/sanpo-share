import nodemailer from "nodemailer";
import { passwordResetEmail } from "./template";

// メーラー設定
export const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.resend.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "resend",
    pass: process.env.SMTP_PASS || process.env.RESEND_API_KEY || "",
  },
});

// メール送信の型定義
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// メール送信関数
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const mailOptions = {
      from: options.from || process.env.SMTP_FROM || "noreply@sanpo-share.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    await mailer.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("メール送信エラー:", error);
    return false;
  }
};

// パスワードリセットメール送信
export const sendPasswordResetEmail = async (
  email: string,
  resetLink: string
): Promise<boolean> => {
  const html = passwordResetEmail(email, resetLink);
  
  return await sendEmail({
    to: email,
    subject: "パスワード再設定のご案内",
    html,
  });
};

// メール送信の検証
export const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    await mailer.verify();
    return true;
  } catch (error) {
    console.error("メール接続エラー:", error);
    return false;
  }
}; 