// カスタムエラークラス
export class AuthError extends Error {
    constructor(public code: string, message: string) {
      super(message);
      this.name = "AuthError";
    }
  }
  