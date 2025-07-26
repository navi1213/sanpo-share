// アプリケーション全体の定数

export const APP_CONFIG = {
  name: "散歩シェア",
  description: "散歩ルートを共有するアプリケーション",
  version: "1.0.0",
} as const;

export const MAP_CONFIG = {
  defaultCenter: {
    lat: 35.51805063978616,
    lng: 139.7048587992674,
  },
  defaultZoom: 13,
  minDistance: 1000, // 1km
} as const;

export const VALIDATION_LIMITS = {
  username: {
    min: 3,
    max: 50,
  },
  password: {
    min: 8,
    max: 128,
  },
  routeName: {
    min: 1,
    max: 100,
  },
  routeDescription: {
    max: 500,
  },
  location: {
    max: 200,
  },
  reviewContent: {
    max: 1000,
  },
} as const;

export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 20,
  maxLimit: 100,
} as const;

export const SESSION_CONFIG = {
  maxAge: 30 * 24 * 60 * 60, // 30 days
} as const;

export const EMAIL_CONFIG = {
  resetTokenExpiry: 60 * 60, // 1 hour
} as const;

// エラーメッセージの定数
export const MESSAGES = {
  SUCCESS: {
    ROUTE_CREATED: "ルートが正常に作成されました",
    ROUTE_UPDATED: "ルートが正常に更新されました",
    ROUTE_DELETED: "ルートが正常に削除されました",
    USER_REGISTERED: "アカウントが正常に作成されました",
    PASSWORD_RESET: "パスワードが正常にリセットされました",
  },
  ERROR: {
    UNKNOWN: "予期しないエラーが発生しました",
    NETWORK: "ネットワークエラーが発生しました",
    VALIDATION: "入力内容に誤りがあります",
  },
} as const; 