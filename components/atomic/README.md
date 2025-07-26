# Atomic Design Component Structure

## 概要
このプロジェクトでは[Atomic Design](https://qiita.com/putan/items/ec312314698087fca5b2)の原則に基づいてコンポーネントを整理します。

## ディレクトリ構成

```
components/
├── atoms/          # 最小単位のUIパーツ
├── molecules/      # atomsを組み合わせた機能単位
├── organisms/      # 独立した機能ブロック
├── templates/      # レイアウト定義
└── pages/          # 実際のページコンポーネント
```

## 分類基準

### Atoms (atoms/)
- **役割**: トンマナ、基本デザイン
- **特徴**: 
  - UIパーツの最小構成部品
  - 他のコンポーネントには依存しない
  - 配置パターンも含む
- **例**: Button, Input, Label, Card

### Molecules (molecules/)
- **役割**: 操作性
- **特徴**:
  - atomsを組み合わせて作る部品
  - atomsの原始的行動に意味を付加
  - 例: 文字を入れる + クリックする = 検索する
- **例**: SearchBox, FormField, AuthCard

### Organisms (organisms/)
- **役割**: 機能、価値、サービス
- **特徴**:
  - atoms, molecules, organismsを組み合わせて作る部品
  - 独立して機能し、他のページでも同じ意図で使える
  - global stateとの接続を許容（バケツリレー回避）
- **例**: Header, Navigation, MapContainer, RouteForm

### Templates (templates/)
- **役割**: レイアウト
- **特徴**:
  - organisms等を配置する
  - プレイスホルダーのスケルトン状態
- **例**: AuthLayout, DashboardLayout

### Pages (pages/)
- **役割**: 流し込むデータ
- **特徴**:
  - templatesにデータを流し込みページを動かす
  - 実際のデータに依存
- **例**: LoginPage, RouteDetailPage

## カスタマイズ

### 本プロジェクトの特徴を考慮した調整

1. **複雑な部品への対応**
   - 地図関連の多機能UI部品（MapContainer等）が存在
   - moleculesを組み合わせたmoleculesを許容

2. **Global State接続**
   - organismsでのglobal state接続を許容
   - バケツリレー回避のため

3. **Templates簡素化**
   - 使いまわせるtemplatesが少ない
   - 必要に応じてpagesで直接レイアウト

## 依存方向

```
atoms ← molecules ← organisms ← templates ← pages
```

- 自分より左側のレイヤーにのみ依存
- 修正の影響は右側にのみ伝播 