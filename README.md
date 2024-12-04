# 散歩シェア

「散歩シェア」は、散歩コースやルートを簡単に投稿・共有できるアプリです。散歩が好きな人や、他の人の散歩コースを参考にしたい方に向けて作られたシンプルで直感的なツールです。

---

## プロジェクト概要

### 制作背景

散歩コースを記録したり共有するための方法は多くありません。特に、他の人がどのようなルートを歩いているのか、どういった風景が見られるのかを知りたいという声に応えるために「散歩シェア」を開発しました。

このサービスでは、自分の散歩ルートを地図上に描き、保存・編集し、他のユーザーと共有することができます。また、他のユーザーが投稿したルートを参考にして新しい散歩コースを発見することもできます。

---

## URL

**URL**: [散歩シェア](https://sanposhare.online)

ゲストログインボタンで簡単にログインできます。

---

## 機能一覧

- **ユーザー登録・ログイン機能**
  - アカウントの作成、削除、ログイン、ログアウトが可能。
- **散歩ルートの投稿・管理**
  - 地図上でルートを自由に描き、保存・編集が可能。
- **ルートの共有**
  - 他のユーザーの投稿を閲覧し、評価やコメントを残せます。
- **検索機能**
  - 地域やキーワードで散歩ルートを検索可能。
- **コメント・フィードバック機能**
  - 他のユーザーの投稿にコメントを追加可能。
- **モバイル対応**
  - スマートフォンからも快適に利用できるレスポンシブデザイン。

---

## 技術スタック

- **フロントエンド**:
  - Next.js 14
  - TypeScript
  - Tailwind CSS

- **バックエンド**:
  - NextAuth.js
  - Node.js
  - Resend (メール送信)

- **データベース**:
  - PostgreSQL (Drizzle ORM)

- **その他**:
  - Google Maps API (散歩ルートの描画)
  - Vercel (ホスティング)

---

## スクリーンショット

### ホーム画面
![ホーム画面](https://example.com/screenshot-home.png)

### 散歩ルートの作成
![ルート作成](https://example.com/screenshot-route.png)

### ユーザーの投稿一覧
![投稿一覧](https://example.com/screenshot-list.png)

---

## インフラ構成図

![インフラ構成図](https://example.com/infra-diagram.png)

---

## セットアップ手順

1. リポジトリをクローンします:

   ```bash
   git clone https://github.com/your-username/sanpo-share.git
   cd sanpo-share

以下は、Markdown形式で作成した「散歩シェア」のREADMEです。

markdown
コードをコピーする
# 散歩シェア

「散歩シェア」は、散歩コースやルートを簡単に投稿・共有できるアプリです。散歩が好きな人や、他の人の散歩コースを参考にしたい方に向けて作られたシンプルで直感的なツールです。

---

## プロジェクト概要

### 制作背景

散歩コースを記録したり共有するための方法は多くありません。特に、他の人がどのようなルートを歩いているのか、どういった風景が見られるのかを知りたいという声に応えるために「散歩シェア」を開発しました。

このサービスでは、自分の散歩ルートを地図上に描き、保存・編集し、他のユーザーと共有することができます。また、他のユーザーが投稿したルートを参考にして新しい散歩コースを発見することもできます。

---

## URL

**URL**: [散歩シェア](https://sanposhare.online)

ゲストログインボタンで簡単にログインできます。

---

## 機能一覧

- **ユーザー登録・ログイン機能**
  - アカウントの作成、削除、ログイン、ログアウトが可能。
- **散歩ルートの投稿・管理**
  - 地図上でルートを自由に描き、保存・編集が可能。
- **ルートの共有**
  - 他のユーザーの投稿を閲覧し、評価やコメントを残せます。
- **検索機能**
  - 地域やキーワードで散歩ルートを検索可能。
- **コメント・フィードバック機能**
  - 他のユーザーの投稿にコメントを追加可能。
- **モバイル対応**
  - スマートフォンからも快適に利用できるレスポンシブデザイン。

---

## 技術スタック

- **フロントエンド**:
  - Next.js 14
  - TypeScript
  - Tailwind CSS

- **バックエンド**:
  - NextAuth.js
  - Node.js
  - Resend (メール送信)

- **データベース**:
  - PostgreSQL (Drizzle ORM)

- **その他**:
  - Google Maps API (散歩ルートの描画)
  - Vercel (ホスティング)

---

## スクリーンショット

### ホーム画面
![ホーム画面](https://example.com/screenshot-home.png)

### 散歩ルートの作成
![ルート作成](https://example.com/screenshot-route.png)

### ユーザーの投稿一覧
![投稿一覧](https://example.com/screenshot-list.png)

---

## インフラ構成図

![インフラ構成図](https://example.com/infra-diagram.png)

---

## セットアップ手順

1. リポジトリをクローンします:

   ```bash
   git clone https://github.com/your-username/sanpo-share.git
   cd sanpo-share
2. 依存関係をインストールします:
    ```bash
    npm install
3. 環境変数を設定します:
    プロジェクトルートに.env.localファイルを作成し、以下を記述してください:
    ```bash
    DATABASE_URL=your_database_url
    NEXTAUTH_SECRET=your_secret
    GOOGLE_MAPS_API_KEY=your_api_key
    RESEND_API_KEY=your_resend_key
4. 開発サーバーを起動します:
    ```bash
    npm run dev
5. ブラウザでアプリにアクセスします: http://localhost:3000

## 開発の工夫ポイント

### UI/UX
- シンプルで直感的なデザインを採用し、誰でも使いやすいアプリを目指しました。

### 実装
- **Resend** を使用して、ドメイン認証済みの安全なメール通知を実現。

---

## ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

---

ぜひ、このプロジェクトをクローンして、自分だけの散歩体験をシェアしてください！  
また、問題や改善点があれば [Issue](https://github.com/your-username/sanpo-share/issues) をお知らせください。
