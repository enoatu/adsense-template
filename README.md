# Google AdSense 静的サイトテンプレート

このテンプレートは、Google AdSenseで広告収入を得るための静的サイトを簡単に作成できるテンプレートです。

## 特徴

- 完全な静的サイト（サーバー不要）
- レスポンシブデザイン対応
- SEO最適化済み
- Google AdSense統合

## セットアップ手順

### 1. テンプレートのクローン

```bash
git clone <repository-url>
cd adsense-template
npm install
```

### 2. ローカルでの確認

```bash
npm start
```

ブラウザで`http://localhost:8000`にアクセスして確認します。

## カスタマイズ

### アプリケーションの実装

`public/app.js`ファイルに、サービス固有のJavaScriptコードを実装します。

### スタイルのカスタマイズ

`public/style.css`ファイルでデザインをカスタマイズできます。


## デプロイ

### GitHub Pagesへのデプロイ

1. GitHubリポジトリを作成
2. コードをプッシュ
3. Settings > Pages > Source を "Deploy from a branch" に設定
4. Branch を "main" に、フォルダを "/public" に設定

### Cloudflare Pagesへのデプロイ（GitHub Actions使用）

#### 初回セットアップ

1. Cloudflareアカウントの準備
   - [Cloudflare](https://www.cloudflare.com/) にログイン
   - 右上のプロフィール > "My Profile" > "API Tokens" を開く
   - "Create Token" をクリック
   - "Custom token" を選択して以下の権限を設定：
     - Account: Cloudflare Pages:Edit
     - Zone: Zone:Read
   - トークンを作成してコピー
   - https://dash.cloudflare.com/945c6b2b8ad75e9da21e7aa16495d181/pages/new/provider/github からプロジェクトをインポートし、/public ディレクトリを選択

2. CloudflareアカウントIDの取得
   - Cloudflareダッシュボードの右サイドバーからAccount IDをコピー

3. GitHubリポジトリのシークレット設定
   - GitHubリポジトリの "Settings" > "Secrets and variables" > "Actions" を開く
   - "New repository secret" をクリックして以下を追加：
     - `CLOUDFLARE_API_TOKEN`: 手順1で作成したトークン
     - `CLOUDFLARE_ACCOUNT_ID`: 手順2で取得したアカウントID

4. プロジェクト名の設定
   - `.github/workflows/deploy.yml` の51行目 `projectName: my-project-name` をcloudflareのプロジェクト名に変更!!重要!!

#### デプロイ

mainブランチにpushすると自動的にデプロイされます：

```bash
git add .
git commit -m "Deploy to Cloudflare Pages"
git push origin main
```

## ディレクトリ構造

```
adsense-template/
├── public/                # 公開ディレクトリ
│   ├── index.html        # メインページ
│   ├── app.js           # アプリケーションコード
│   ├── style.css        # スタイルシート
├── package.json         # 依存関係
└── README.md           # このファイル
```

## SEO最適化ガイド

このテンプレートには包括的なSEO対策が組み込まれています：

### 1. メタタグの最適化
- Open Graph tags（Facebook、LinkedIn等でのシェア最適化）
- Twitter Card tags（Twitterでのシェア最適化）
- 適切なmeta description（150文字程度で検索結果に表示）
- キーワードメタタグ（5-8個の関連キーワード）

### 2. 構造化データ（JSON-LD）
- Schema.org準拠のWebSiteマークアップを実装済み
- 検索エンジンがサイト内容を理解しやすく構造化

### 3. 検索エンジン最適化ファイル
- `robots.txt`: 検索エンジンのクローリング指示
- `sitemap.xml`: サイト構造を検索エンジンに伝達
- `site.webmanifest`: PWA対応とモバイル最適化

### 4. パフォーマンス最適化
- DNS prefetch設定でAdSense読み込み高速化
- 適切なpreconnect設定

### カスタマイズ時のSEO注意点
1. **プロジェクト名の更新**: すべてのファイルで「プロジェクト名」を実際のドメイン名に変更
2. **メタ情報の更新**: タイトル、説明文、キーワードを実際のサービス内容に合わせて更新
3. **画像の最適化**: og-image.jpg、twitter-card.jpgなどのソーシャル画像を用意
4. **ファビコンの設置**: favicon.ico、apple-touch-icon.png等のアイコンファイルを設置

## 注意事項

- Google AdSenseの利用には審査が必要です
- コンテンツはGoogleのポリシーに準拠する必要があります
- 適切なプライバシーポリシーと利用規約を設置してください

## ライセンス

MIT License
