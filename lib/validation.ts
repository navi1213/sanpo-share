import { VALIDATION_LIMITS } from "./constants";

// 共通のバリデーション関数
export const validation = {
  // ユーザー名のバリデーション
  username: (value: string): string | null => {
    if (!value) return "ユーザー名は必須です";
    if (value.length < VALIDATION_LIMITS.username.min) {
      return `ユーザー名は${VALIDATION_LIMITS.username.min}文字以上で入力してください`;
    }
    if (value.length > VALIDATION_LIMITS.username.max) {
      return `ユーザー名は${VALIDATION_LIMITS.username.max}文字以下で入力してください`;
    }
    if (!/^[a-zA-Z0-9_\u3040-\u309F\u30A0-\u30FF]+$/.test(value)) {
      return "ユーザー名は英数字、アンダースコア、ひらがな、カタカナのみ使用できます";
    }
    return null;
  },

  // メールアドレスのバリデーション
  email: (value: string): string | null => {
    if (!value) return "メールアドレスは必須です";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "正しい形式のメールアドレスを入力してください";
    }
    return null;
  },

  // パスワードのバリデーション
  password: (value: string): string | null => {
    if (!value) return "パスワードは必須です";
    if (value.length < VALIDATION_LIMITS.password.min) {
      return `パスワードは${VALIDATION_LIMITS.password.min}文字以上で入力してください`;
    }
    if (value.length > VALIDATION_LIMITS.password.max) {
      return `パスワードは${VALIDATION_LIMITS.password.max}文字以下で入力してください`;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return "パスワードは大文字、小文字、数字を含む必要があります";
    }
    return null;
  },

  // パスワード確認のバリデーション
  confirmPassword: (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword) return "パスワード確認は必須です";
    if (password !== confirmPassword) {
      return "パスワードが一致しません";
    }
    return null;
  },

  // ルート名のバリデーション
  routeName: (value: string): string | null => {
    if (!value) return "ルート名は必須です";
    if (value.length < VALIDATION_LIMITS.routeName.min) {
      return `ルート名は${VALIDATION_LIMITS.routeName.min}文字以上で入力してください`;
    }
    if (value.length > VALIDATION_LIMITS.routeName.max) {
      return `ルート名は${VALIDATION_LIMITS.routeName.max}文字以下で入力してください`;
    }
    return null;
  },

  // 場所のバリデーション
  location: (value: string): string | null => {
    if (!value) return "場所は必須です";
    if (value.length > VALIDATION_LIMITS.location.max) {
      return `場所は${VALIDATION_LIMITS.location.max}文字以下で入力してください`;
    }
    return null;
  },

  // 座標のバリデーション
  coordinates: (coordinates: Array<{ lat: number; lng: number }>): string | null => {
    if (!coordinates || coordinates.length === 0) {
      return "少なくとも1つの座標が必要です";
    }
    
    for (const coord of coordinates) {
      if (coord.lat < -90 || coord.lat > 90) {
        return "緯度は-90から90の範囲で入力してください";
      }
      if (coord.lng < -180 || coord.lng > 180) {
        return "経度は-180から180の範囲で入力してください";
      }
    }
    
    return null;
  },

  // 距離のバリデーション
  distance: (value: string): string | null => {
    if (!value) return "距離は必須です";
    const distance = parseFloat(value);
    if (isNaN(distance) || distance <= 0) {
      return "有効な距離を入力してください";
    }
    return null;
  },

  // レビュー内容のバリデーション
  reviewContent: (value: string): string | null => {
    if (!value) return "レビュー内容は必須です";
    if (value.length > VALIDATION_LIMITS.reviewContent.max) {
      return `レビューは${VALIDATION_LIMITS.reviewContent.max}文字以下で入力してください`;
    }
    return null;
  },
};

// フォーム全体のバリデーション
export const validateForm = <T extends Record<string, any>>(
  data: T,
  validators: Record<keyof T, (value: any) => string | null>
): Record<keyof T, string> | null => {
  const errors: Record<keyof T, string> = {} as Record<keyof T, string>;
  let hasErrors = false;

  for (const [key, validator] of Object.entries(validators)) {
    const error = validator(data[key as keyof T]);
    if (error) {
      errors[key as keyof T] = error;
      hasErrors = true;
    }
  }

  return hasErrors ? errors : null;
}; 