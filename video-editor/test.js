// Video Editor Test Suite
const { FFmpeg } = FFmpegWASM;
const { fetchFile } = FFmpegUtil;

class TestRunner {
    constructor() {
        this.tests = [];
        this.results = [];
        this.ffmpeg = null;
    }

    async init() {
        try {
            this.ffmpeg = new FFmpeg();
            await this.ffmpeg.load({
                coreURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.js',
                wasmURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.wasm',
            });
            return true;
        } catch (error) {
            console.error('FFmpeg initialization failed:', error);
            return false;
        }
    }

    addTest(name, testFn) {
        this.tests.push({ name, testFn });
    }

    async runTests() {
        this.results = [];
        const resultsDiv = document.getElementById('testResults');
        resultsDiv.innerHTML = '';

        // Initialize FFmpeg first
        const initResult = await this.init();
        if (!initResult) {
            this.displayResult({
                name: 'FFmpeg Initialization',
                passed: false,
                error: 'Failed to initialize FFmpeg.wasm'
            });
            return;
        }

        for (const test of this.tests) {
            const result = await this.runTest(test);
            this.results.push(result);
            this.displayResult(result);
        }

        this.displaySummary();
    }

    async runTest(test) {
        const startTime = performance.now();
        let passed = false;
        let error = null;

        try {
            await test.testFn.call(this);
            passed = true;
        } catch (e) {
            error = e.message || e.toString();
        }

        const duration = performance.now() - startTime;

        return {
            name: test.name,
            passed,
            error,
            duration
        };
    }

    displayResult(result) {
        const resultsDiv = document.getElementById('testResults');
        const resultDiv = document.createElement('div');
        resultDiv.className = `p-4 rounded-lg text-white ${result.passed ? 'test-pass' : 'test-fail'}`;
        
        resultDiv.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <strong>${result.name}</strong>
                    ${result.error ? `<p class="text-sm mt-1">${result.error}</p>` : ''}
                </div>
                <div class="text-sm">
                    ${result.duration ? `${result.duration.toFixed(2)}ms` : 'N/A'}
                </div>
            </div>
        `;
        
        resultsDiv.appendChild(resultDiv);
    }

    displaySummary() {
        const resultsDiv = document.getElementById('testResults');
        const passed = this.results.filter(r => r.passed).length;
        const failed = this.results.filter(r => !r.passed).length;
        
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'mt-6 p-4 bg-gray-800 text-white rounded-lg';
        summaryDiv.innerHTML = `
            <h2 class="text-xl font-bold mb-2">Test Summary</h2>
            <p>Total Tests: ${this.results.length}</p>
            <p class="text-green-400">Passed: ${passed}</p>
            <p class="text-red-400">Failed: ${failed}</p>
        `;
        
        resultsDiv.appendChild(summaryDiv);
    }

    // Utility function to create test video
    async createTestVideo() {
        // Create a simple test video using FFmpeg
        await this.ffmpeg.exec([
            '-f', 'lavfi',
            '-i', 'testsrc=duration=5:size=320x240:rate=30',
            '-f', 'lavfi',
            '-i', 'sine=frequency=1000:duration=5',
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-t', '5',
            'test_input.mp4'
        ]);
        
        return await this.ffmpeg.readFile('test_input.mp4');
    }

    // Assert helper
    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }

    assertEquals(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, but got ${actual}`);
        }
    }
}

// Create test runner instance
const runner = new TestRunner();

// Test 1: FFmpeg Loading
runner.addTest('FFmpeg.wasm Loading', async function() {
    this.assert(this.ffmpeg !== null, 'FFmpeg should be loaded');
});

// Test 2: Create Test Video
runner.addTest('Create Test Video', async function() {
    const videoData = await this.createTestVideo();
    this.assert(videoData !== null, 'Test video should be created');
    this.assert(videoData.length > 0, 'Test video should have content');
});

// Test 3: Video Trimming
runner.addTest('Video Trimming', async function() {
    const inputData = await this.createTestVideo();
    await this.ffmpeg.writeFile('input.mp4', inputData);
    
    await this.ffmpeg.exec([
        '-i', 'input.mp4',
        '-ss', '00:00:01',
        '-to', '00:00:03',
        '-c', 'copy',
        'output.mp4'
    ]);
    
    const outputData = await this.ffmpeg.readFile('output.mp4');
    this.assert(outputData !== null, 'Trimmed video should be created');
    this.assert(outputData.length < inputData.length, 'Trimmed video should be smaller');
    
    // Cleanup
    await this.ffmpeg.deleteFile('input.mp4');
    await this.ffmpeg.deleteFile('output.mp4');
});

// Test 4: Format Conversion to WebM
runner.addTest('Format Conversion to WebM', async function() {
    const inputData = await this.createTestVideo();
    await this.ffmpeg.writeFile('input.mp4', inputData);
    
    await this.ffmpeg.exec([
        '-i', 'input.mp4',
        '-c:v', 'libvpx-vp9',
        '-c:a', 'libopus',
        '-t', '2',
        'output.webm'
    ]);
    
    const outputData = await this.ffmpeg.readFile('output.webm');
    this.assert(outputData !== null, 'WebM video should be created');
    this.assert(outputData.length > 0, 'WebM video should have content');
    
    // Cleanup
    await this.ffmpeg.deleteFile('input.mp4');
    await this.ffmpeg.deleteFile('output.webm');
});

// Test 5: Video Compression
runner.addTest('Video Compression', async function() {
    const inputData = await this.createTestVideo();
    await this.ffmpeg.writeFile('input.mp4', inputData);
    
    await this.ffmpeg.exec([
        '-i', 'input.mp4',
        '-c:v', 'libx264',
        '-b:v', '500k',
        '-c:a', 'aac',
        '-b:a', '96k',
        'output.mp4'
    ]);
    
    const outputData = await this.ffmpeg.readFile('output.mp4');
    this.assert(outputData !== null, 'Compressed video should be created');
    this.assert(outputData.length < inputData.length, 'Compressed video should be smaller');
    
    // Cleanup
    await this.ffmpeg.deleteFile('input.mp4');
    await this.ffmpeg.deleteFile('output.mp4');
});

// Test 6: Multiple Operations
runner.addTest('Multiple Operations Chain', async function() {
    const inputData = await this.createTestVideo();
    await this.ffmpeg.writeFile('input.mp4', inputData);
    
    // First trim
    await this.ffmpeg.exec([
        '-i', 'input.mp4',
        '-ss', '00:00:01',
        '-to', '00:00:04',
        '-c', 'copy',
        'trimmed.mp4'
    ]);
    
    // Then compress
    await this.ffmpeg.exec([
        '-i', 'trimmed.mp4',
        '-c:v', 'libx264',
        '-b:v', '300k',
        '-c:a', 'aac',
        '-b:a', '64k',
        'final.mp4'
    ]);
    
    const finalData = await this.ffmpeg.readFile('final.mp4');
    this.assert(finalData !== null, 'Final video should be created');
    this.assert(finalData.length < inputData.length, 'Final video should be smaller than original');
    
    // Cleanup
    await this.ffmpeg.deleteFile('input.mp4');
    await this.ffmpeg.deleteFile('trimmed.mp4');
    await this.ffmpeg.deleteFile('final.mp4');
});

// Test 7: Error Handling - Invalid Time Format
runner.addTest('Error Handling - Invalid Time Format', async function() {
    const inputData = await this.createTestVideo();
    await this.ffmpeg.writeFile('input.mp4', inputData);
    
    let errorCaught = false;
    try {
        await this.ffmpeg.exec([
            '-i', 'input.mp4',
            '-ss', 'invalid_time',
            '-to', '00:00:03',
            '-c', 'copy',
            'output.mp4'
        ]);
    } catch (error) {
        errorCaught = true;
    }
    
    this.assert(errorCaught, 'Should catch error for invalid time format');
    
    // Cleanup
    await this.ffmpeg.deleteFile('input.mp4');
});

// Test 8: Memory Management
runner.addTest('Memory Management - File Cleanup', async function() {
    const inputData = await this.createTestVideo();
    await this.ffmpeg.writeFile('test1.mp4', inputData);
    await this.ffmpeg.writeFile('test2.mp4', inputData);
    
    // Delete files
    await this.ffmpeg.deleteFile('test1.mp4');
    await this.ffmpeg.deleteFile('test2.mp4');
    
    // Try to read deleted file - should fail
    let errorCaught = false;
    try {
        await this.ffmpeg.readFile('test1.mp4');
    } catch (error) {
        errorCaught = true;
    }
    
    this.assert(errorCaught, 'Should not be able to read deleted file');
});

// Set up test runner button
document.getElementById('runTests').addEventListener('click', () => {
    runner.runTests();
});