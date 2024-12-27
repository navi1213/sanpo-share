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



## 機能一覧

- **ユーザー登録・ログイン機能**
  - アカウントの作成、削除、ログイン、ログアウトが可能。2段階認証機能でのログインも可
- **散歩ルートの投稿・管理**
  - 地図上でルートを自由に描き、保存・編集が可能。
- **ルートの共有**
  - 他のユーザーの投稿を閲覧し、コメントを残せます。
- **コメント・フィードバック機能**
  - 他のユーザーの投稿にコメントを追加可能。


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
  - Neon Serverless Postgres
  - PostgreSQL (Drizzle ORM)

- **その他**:
  - Google Maps API (散歩ルートの描画)
  - Vercel (ホスティング)

---

## スクリーンショット

### ホーム画面
![ホーム画面](/public/screencapture-localhost-3000-2024-12-28-04_49_13.png)

### 散歩ルートの作成
![ルート作成](/public/screencapture-localhost-3000-new-2024-12-28-04_49_52.png)

### ユーザーの投稿一覧
![投稿一覧](/public/screencapture-localhost-3000-routes-2024-12-28-04_51_23.png)

## セットアップ手順

1. リポジトリをクローンします:

   ```bash
   git clone https://github.com/navi1213/sanpo-share.git
   cd sanpo-share
2. 依存関係をインストールします:
    ```bash
    npm install
3. 環境変数を設定します:
    プロジェクトルートに.env.localファイルを作成し、以下を記述してください:
    ```bash
    NEON_DATABASE_URL=your_database_url
    NEXTAUTH_SECRET=your_secret
    GOOGLE_MAPS_API_KEY=your_api_key
    RESEND_API_KEY=your_resend_key
    AUTH_SECRET=your_secret_key
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
4. 開発サーバーを起動します:
    ```bash
    npm run dev
5. ブラウザでアプリにアクセスします: http://localhost:3000

## 開発の工夫ポイント
  - Google Maps APIを使用して、ユーザーが地図上に直感的にルートを描画できるように実装しました。
  - 地図上でクリックすると、ポイント間を結ぶ「ポリライン」がリアルタイムで描画され、ルートの視覚化を可能にしています。
  - 線の描画はgoogle.maps.Polylineオブジェクトを用い、clickイベントをトリガーにして動的に頂点を追加する仕組みを採用しました。
  - 描画済みのルートを削除・編集できる機能も実装し、UXの向上を図りました。
  - ワンタイムパスワードを利用した2段階認証を導入。
### UI/UX
- シンプルで直感的なデザインを採用し、誰でも使いやすいアプリを目指しました。

### 実装
- **Resend** を使用して、ドメイン認証済みの安全なメール通知を実現。


## ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

---

ぜひ、このプロジェクトをクローンして、自分だけの散歩体験をシェアしてください！  
また、問題や改善点があれば [Issue](https://github.com/navi1213/sanpo-share/issues) をお知らせください。
