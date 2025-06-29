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

### Cloudflare Pagesへのデプロイ

1. Cloudflareにログイン
2. "Pages" > "Create a project" を選択
3. GitHubアカウントを接続してリポジトリを選択
4. Build output directory を "public" に設定
5. デプロイ

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

## 注意事項

- Google AdSenseの利用には審査が必要です
- コンテンツはGoogleのポリシーに準拠する必要があります
- 適切なプライバシーポリシーと利用規約を設置してください

## ライセンス

MIT License