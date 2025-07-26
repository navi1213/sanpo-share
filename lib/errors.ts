import { ErrorType, AppError, ApiResponse } from "@/types";

// エラーファクトリー関数
export class ErrorFactory {
  static create(type: ErrorType, message: string, code?: string, details?: Record<string, any>): AppError {
    return {
      type,
      message,
      code,
      details,
      timestamp: new Date(),
    };
  }

  static validation(message: string, details?: Record<string, any>): AppError {
    return this.create(ErrorType.VALIDATION, message, 'VALIDATION_ERROR', details);
  }

  static authentication(message: string, details?: Record<string, any>): AppError {
    return this.create(ErrorType.AUTHENTICATION, message, 'AUTH_ERROR', details);
  }

  static authorization(message: string, details?: Record<string, any>): AppError {
    return this.create(ErrorType.AUTHORIZATION, message, 'AUTHORIZATION_ERROR', details);
  }

  static notFound(message: string, details?: Record<string, any>): AppError {
    return this.create(ErrorType.NOT_FOUND, message, 'NOT_FOUND_ERROR', details);
  }

  static conflict(message: string, details?: Record<string, any>): AppError {
    return this.create(ErrorType.CONFLICT, message, 'CONFLICT_ERROR', details);
  }

  static internalError(message: string, details?: Record<string, any>): AppError {
    return this.create(ErrorType.INTERNAL_ERROR, message, 'INTERNAL_ERROR', details);
  }
}

// APIレスポンスヘルパー - 冗長性を削除
export class ApiResponseHelper {
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
    };
  }

  static error(error: AppError): ApiResponse {
    return {
      success: false,
      message: error.message,
    };
  }
}

// エラーハンドリング関数
export function handleError(error: unknown): AppError {
  if (error instanceof Error) {
    // すでにAppErrorの場合はそのまま返す
    if ('type' in error && 'message' in error) {
      return error as AppError;
    }

    // 通常のErrorオブジェクトの場合
    return ErrorFactory.internalError(error.message);
  }

  // その他の場合
  return ErrorFactory.internalError('Unknown error occurred');
}

// エラーメッセージ定数
export const ERROR_MESSAGES = {
  VALIDATION: {
    REQUIRED_FIELD: '必須項目です',
    INVALID_EMAIL: '有効なメールアドレスを入力してください',
    PASSWORD_TOO_SHORT: 'パスワードは8文字以上で入力してください',
    PASSWORD_MISMATCH: 'パスワードが一致しません',
    ROUTE_NAME_REQUIRED: 'ルート名は必須です',
    LOCATION_REQUIRED: '場所は必須です',
    COORDINATES_REQUIRED: '座標が必要です',
  },
  AUTHENTICATION: {
    LOGIN_REQUIRED: 'ログインが必要です',
    INVALID_CREDENTIALS: 'メールアドレスまたはパスワードが正しくありません',
    INVALID_TOKEN: 'トークンが無効です',
    SESSION_EXPIRED: 'セッションが期限切れです',
  },
  AUTHORIZATION: {
    ACCESS_DENIED: 'アクセスが拒否されました',
    INSUFFICIENT_PERMISSIONS: '権限が不足しています',
  },
  NOT_FOUND: {
    USER_NOT_FOUND: 'ユーザーが見つかりません',
    ROUTE_NOT_FOUND: 'ルートが見つかりません',
    REVIEW_NOT_FOUND: 'レビューが見つかりません',
  },
  CONFLICT: {
    EMAIL_ALREADY_EXISTS: 'このメールアドレスは既に使用されています',
    USERNAME_ALREADY_EXISTS: 'このユーザー名は既に使用されています',
  },
  INTERNAL_ERROR: {
    GENERAL: '内部エラーが発生しました',
    DATABASE_ERROR: 'データベースエラーが発生しました',
    EXTERNAL_API_ERROR: '外部API呼び出しでエラーが発生しました',
  },
} as const;

// Zod エラーを AppError に変換
export const zodErrorToAppError = (zodError: any): AppError => {
  const firstIssue = zodError.issues?.[0];
  if (firstIssue) {
    return ErrorFactory.validation(
      firstIssue.message || ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
      { issues: zodError.issues }
    );
  }
  return ErrorFactory.validation(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD);
}; 