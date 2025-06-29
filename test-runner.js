const fs = require('fs');
const path = require('path');

// テスト結果を管理
let passed = 0;
let failed = 0;

function test(description, fn) {
    try {
        fn();
        console.log(`✓ ${description}`);
        passed++;
    } catch (error) {
        console.error(`✗ ${description}`);
        console.error(`  ${error.message}`);
        failed++;
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

// ファイル存在チェック
function assertFileExists(filePath) {
    assert(fs.existsSync(filePath), `File not found: ${filePath}`);
}

// テスト実行
console.log('テンプレート構造テストを実行します...\n');

// 必須ファイルの存在確認
test('index.htmlが存在する', () => {
    assertFileExists(path.join(__dirname, 'public/index.html'));
});

test('app.jsが存在する', () => {
    assertFileExists(path.join(__dirname, 'public/app.js'));
});

test('style.cssが存在する', () => {
    assertFileExists(path.join(__dirname, 'public/style.css'));
});

// HTMLの内容確認
test('index.htmlにGoogle AdSenseコードが含まれている', () => {
    const content = fs.readFileSync(path.join(__dirname, 'public/index.html'), 'utf8');
    assert(content.includes('adsbygoogle'), 'Google AdSenseコードが見つかりません');
    assert(content.includes('ca-pub-'), 'AdSense Client IDが見つかりません');
});


// 結果表示
console.log('\n=================');
console.log(`合計: ${passed + failed} テスト`);
console.log(`成功: ${passed}`);
console.log(`失敗: ${failed}`);
console.log('=================');

process.exit(failed > 0 ? 1 : 0);