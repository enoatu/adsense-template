// FFmpeg.wasm の初期化とビデオエディタ機能
const { FFmpeg } = FFmpegWASM;
const { fetchFile } = FFmpegUtil;

class VideoEditor {
    constructor() {
        this.ffmpeg = null;
        this.currentVideo = null;
        this.currentVideoData = null;
        this.isProcessing = false;
        this.init();
    }

    async init() {
        // FFmpeg.wasm の初期化
        this.showLoading('FFmpeg.wasmを初期化中...');
        
        try {
            this.ffmpeg = new FFmpeg();
            
            // ログ出力の設定
            this.ffmpeg.on('log', ({ message }) => {
                console.log(message);
            });

            // 進捗状況の監視
            this.ffmpeg.on('progress', ({ progress, time }) => {
                const percentage = Math.round(progress * 100);
                this.updateLoadingText(`処理中... ${percentage}%`);
            });

            // FFmpeg.wasmのロード
            await this.ffmpeg.load({
                coreURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.js',
                wasmURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.wasm',
            });

            this.hideLoading();
            this.setupEventListeners();
        } catch (error) {
            console.error('FFmpeg初期化エラー:', error);
            this.hideLoading();
            alert('FFmpeg.wasmの初期化に失敗しました。ブラウザの互換性を確認してください。');
        }
    }

    setupEventListeners() {
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const trimButton = document.getElementById('trimButton');
        const exportButton = document.getElementById('exportButton');
        const compressButton = document.getElementById('compressButton');

        // ドラッグ&ドロップ
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFile(files[0]);
            }
        });

        // クリックでファイル選択
        dropZone.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFile(e.target.files[0]);
            }
        });

        // トリミングボタン
        trimButton.addEventListener('click', () => {
            this.trimVideo();
        });

        // 圧縮ボタン
        compressButton.addEventListener('click', () => {
            this.compressVideo();
        });

        // エクスポートボタン
        exportButton.addEventListener('click', () => {
            this.exportVideo();
        });

        // 形式変換ボタン
        document.querySelectorAll('.convertButton').forEach(button => {
            button.addEventListener('click', (e) => {
                const format = e.target.dataset.format;
                this.convertVideo(format);
            });
        });
    }

    async handleFile(file) {
        if (!file.type.startsWith('video/')) {
            alert('動画ファイルを選択してください。');
            return;
        }

        this.currentVideo = file;
        this.currentVideoData = await fetchFile(file);

        // プレビュー表示
        const videoPreview = document.getElementById('videoPreview');
        const noVideoMessage = document.getElementById('noVideoMessage');
        const videoInfo = document.getElementById('videoInfo');
        const editingTools = document.getElementById('editingTools');

        const url = URL.createObjectURL(file);
        videoPreview.src = url;
        videoPreview.style.display = 'block';
        noVideoMessage.style.display = 'none';

        // 動画情報の取得と表示
        videoPreview.addEventListener('loadedmetadata', () => {
            document.getElementById('fileName').textContent = file.name;
            document.getElementById('fileSize').textContent = this.formatFileSize(file.size);
            document.getElementById('duration').textContent = this.formatTime(videoPreview.duration);
            document.getElementById('resolution').textContent = `${videoPreview.videoWidth} x ${videoPreview.videoHeight}`;
            
            videoInfo.classList.remove('hidden');
            editingTools.classList.remove('hidden');

            // タイムコードの初期設定
            document.getElementById('endTime').value = this.formatTime(videoPreview.duration);
        });
    }

    async trimVideo() {
        if (!this.currentVideoData || this.isProcessing) return;

        const startTime = document.getElementById('startTime').value || '00:00:00';
        const endTime = document.getElementById('endTime').value;

        if (!this.validateTimeFormat(startTime) || !this.validateTimeFormat(endTime)) {
            alert('時間の形式が正しくありません。HH:MM:SS形式で入力してください。');
            return;
        }

        this.isProcessing = true;
        this.showLoading('動画をトリミング中...');

        try {
            // 入力ファイルを書き込み
            await this.ffmpeg.writeFile('input.mp4', this.currentVideoData);

            // トリミング実行
            await this.ffmpeg.exec([
                '-i', 'input.mp4',
                '-ss', startTime,
                '-to', endTime,
                '-c', 'copy',
                'output.mp4'
            ]);

            // 結果を読み込み
            const data = await this.ffmpeg.readFile('output.mp4');
            this.currentVideoData = data;

            // プレビュー更新
            const blob = new Blob([data.buffer], { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);
            document.getElementById('videoPreview').src = url;

            // クリーンアップ
            await this.ffmpeg.deleteFile('input.mp4');
            await this.ffmpeg.deleteFile('output.mp4');

            this.hideLoading();
            alert('トリミングが完了しました！');
        } catch (error) {
            console.error('トリミングエラー:', error);
            this.hideLoading();
            alert('トリミング中にエラーが発生しました。');
        } finally {
            this.isProcessing = false;
        }
    }

    async convertVideo(format) {
        if (!this.currentVideoData || this.isProcessing) return;

        this.isProcessing = true;
        this.showLoading(`${format.toUpperCase()}形式に変換中...`);

        try {
            await this.ffmpeg.writeFile('input.mp4', this.currentVideoData);

            // 形式に応じたコマンドを実行
            const outputFile = `output.${format}`;
            const commands = ['-i', 'input.mp4'];

            switch (format) {
                case 'webm':
                    commands.push('-c:v', 'libvpx-vp9', '-c:a', 'libopus');
                    break;
                case 'avi':
                    commands.push('-c:v', 'mpeg4', '-c:a', 'mp3');
                    break;
                case 'mov':
                    commands.push('-c:v', 'h264', '-c:a', 'aac');
                    break;
                default:
                    commands.push('-c', 'copy');
            }

            commands.push(outputFile);
            await this.ffmpeg.exec(commands);

            const data = await this.ffmpeg.readFile(outputFile);
            this.currentVideoData = data;

            // プレビュー更新
            const blob = new Blob([data.buffer], { type: `video/${format}` });
            const url = URL.createObjectURL(blob);
            document.getElementById('videoPreview').src = url;

            // クリーンアップ
            await this.ffmpeg.deleteFile('input.mp4');
            await this.ffmpeg.deleteFile(outputFile);

            this.hideLoading();
            alert(`${format.toUpperCase()}形式への変換が完了しました！`);
        } catch (error) {
            console.error('変換エラー:', error);
            this.hideLoading();
            alert('変換中にエラーが発生しました。');
        } finally {
            this.isProcessing = false;
        }
    }

    async compressVideo() {
        if (!this.currentVideoData || this.isProcessing) return;

        const quality = document.getElementById('quality').value;
        this.isProcessing = true;
        this.showLoading('動画を圧縮中...');

        try {
            await this.ffmpeg.writeFile('input.mp4', this.currentVideoData);

            // 品質に応じたビットレート設定
            let videoBitrate, audioBitrate;
            switch (quality) {
                case 'high':
                    videoBitrate = '2M';
                    audioBitrate = '192k';
                    break;
                case 'low':
                    videoBitrate = '500k';
                    audioBitrate = '96k';
                    break;
                default:
                    videoBitrate = '1M';
                    audioBitrate = '128k';
            }

            await this.ffmpeg.exec([
                '-i', 'input.mp4',
                '-c:v', 'libx264',
                '-b:v', videoBitrate,
                '-c:a', 'aac',
                '-b:a', audioBitrate,
                'output.mp4'
            ]);

            const data = await this.ffmpeg.readFile('output.mp4');
            this.currentVideoData = data;

            // プレビュー更新
            const blob = new Blob([data.buffer], { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);
            document.getElementById('videoPreview').src = url;

            // ファイルサイズの更新
            const originalSize = this.currentVideo.size;
            const compressedSize = data.buffer.byteLength;
            const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(1);

            await this.ffmpeg.deleteFile('input.mp4');
            await this.ffmpeg.deleteFile('output.mp4');

            this.hideLoading();
            alert(`圧縮が完了しました！\nファイルサイズ: ${compressionRatio}%削減`);
        } catch (error) {
            console.error('圧縮エラー:', error);
            this.hideLoading();
            alert('圧縮中にエラーが発生しました。');
        } finally {
            this.isProcessing = false;
        }
    }

    exportVideo() {
        if (!this.currentVideoData) {
            alert('エクスポートする動画がありません。');
            return;
        }

        const blob = new Blob([this.currentVideoData.buffer], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `edited_${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ユーティリティ関数
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    validateTimeFormat(time) {
        const regex = /^([0-9]{2}):([0-9]{2}):([0-9]{2})$/;
        return regex.test(time);
    }

    showLoading(text) {
        const loading = document.getElementById('loading');
        const loadingText = document.getElementById('loadingText');
        loading.classList.remove('hidden');
        loadingText.textContent = text;
    }

    updateLoadingText(text) {
        document.getElementById('loadingText').textContent = text;
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    new VideoEditor();
});