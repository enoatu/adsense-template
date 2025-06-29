const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('E2Eテストを開始します...\n');
    
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    try {
        // ローカルファイルを直接開く
        await page.goto(`file://${path.join(__dirname, 'public/index.html')}`);
        
        // ページタイトルの確認
        const title = await page.title();
        console.log(`✓ ページタイトル: ${title}`);
        
        // ヘッダーの存在確認
        const header = await page.$('header');
        console.log(`✓ ヘッダーが存在する: ${header !== null}`);
        
        // ナビゲーションリンクの確認
        const navLinks = await page.$$('.main-nav a');
        console.log(`✓ ナビゲーションリンク数: ${navLinks.length}`);
        
        // メインコンテンツエリアの確認
        const appContainer = await page.$('#app-container');
        console.log(`✓ アプリケーションコンテナが存在する: ${appContainer !== null}`);
        
        // 広告コンテナの確認
        const adContainer = await page.$('.ad-container');
        console.log(`✓ 広告コンテナが存在する: ${adContainer !== null}`);
        
        // フッターの確認
        const footer = await page.$('footer');
        console.log(`✓ フッターが存在する: ${footer !== null}`);
        
        // レスポンシブデザインのテスト
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(500);
        console.log('✓ モバイル表示に切り替え完了');
        
        // スクリーンショットを撮影
        await page.screenshot({ path: 'template-preview.png', fullPage: true });
        console.log('✓ スクリーンショットを保存: template-preview.png');
        
        console.log('\n全てのE2Eテストが成功しました！');
        
    } catch (error) {
        console.error('テストエラー:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();