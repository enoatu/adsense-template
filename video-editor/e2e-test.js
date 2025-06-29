// E2E Test for Video Editor
// This script simulates real user interactions with the video editor

class E2ETestRunner {
    constructor() {
        this.testResults = [];
    }

    async init() {
        // Wait for the main app to load
        await this.waitForElement('dropZone');
        console.log('E2E Test: App loaded successfully');
    }

    async waitForElement(id, timeout = 5000) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            const element = document.getElementById(id);
            if (element) return element;
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        throw new Error(`Element ${id} not found within ${timeout}ms`);
    }

    async waitForCondition(conditionFn, timeout = 10000) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            if (await conditionFn()) return true;
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        throw new Error(`Condition not met within ${timeout}ms`);
    }

    createTestVideoFile() {
        // Create a mock video file
        const videoContent = new Uint8Array(1024 * 1024); // 1MB dummy data
        const blob = new Blob([videoContent], { type: 'video/mp4' });
        return new File([blob], 'test-video.mp4', { type: 'video/mp4' });
    }

    async runTest(testName, testFn) {
        console.log(`Running E2E Test: ${testName}`);
        const startTime = performance.now();
        let success = false;
        let error = null;

        try {
            await testFn();
            success = true;
            console.log(`✓ ${testName} passed`);
        } catch (e) {
            error = e.message || e.toString();
            console.error(`✗ ${testName} failed:`, error);
        }

        const duration = performance.now() - startTime;
        this.testResults.push({
            name: testName,
            success,
            error,
            duration
        });

        return success;
    }

    async runAllTests() {
        console.log('Starting E2E Tests...');
        
        await this.runTest('File Upload via Drag and Drop', async () => {
            const dropZone = document.getElementById('dropZone');
            const file = this.createTestVideoFile();

            // Simulate drag and drop
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);

            const dropEvent = new DragEvent('drop', {
                dataTransfer: dataTransfer,
                bubbles: true,
                cancelable: true
            });

            dropZone.dispatchEvent(dropEvent);

            // Wait for video info to appear
            await this.waitForCondition(() => {
                const videoInfo = document.getElementById('videoInfo');
                return videoInfo && !videoInfo.classList.contains('hidden');
            });
        });

        await this.runTest('File Upload via File Input', async () => {
            const fileInput = document.getElementById('fileInput');
            const file = this.createTestVideoFile();

            // Create a FileList-like object
            Object.defineProperty(fileInput, 'files', {
                value: [file],
                writable: false
            });

            // Trigger change event
            const event = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(event);

            // Wait for editing tools to appear
            await this.waitForCondition(() => {
                const editingTools = document.getElementById('editingTools');
                return editingTools && !editingTools.classList.contains('hidden');
            });
        });

        await this.runTest('Trim Video Function', async () => {
            const startTimeInput = document.getElementById('startTime');
            const endTimeInput = document.getElementById('endTime');
            const trimButton = document.getElementById('trimButton');

            // Set trim times
            startTimeInput.value = '00:00:01';
            endTimeInput.value = '00:00:03';

            // Click trim button
            trimButton.click();

            // Wait for loading to appear and disappear
            await this.waitForCondition(() => {
                const loading = document.getElementById('loading');
                return loading && !loading.classList.contains('hidden');
            }, 2000);

            await this.waitForCondition(() => {
                const loading = document.getElementById('loading');
                return loading && loading.classList.contains('hidden');
            }, 30000);
        });

        await this.runTest('Format Conversion', async () => {
            const webmButton = document.querySelector('.convertButton[data-format="webm"]');
            
            // Click convert button
            webmButton.click();

            // Wait for processing
            await this.waitForCondition(() => {
                const loading = document.getElementById('loading');
                return loading && !loading.classList.contains('hidden');
            }, 2000);

            await this.waitForCondition(() => {
                const loading = document.getElementById('loading');
                return loading && loading.classList.contains('hidden');
            }, 30000);
        });

        await this.runTest('Video Compression', async () => {
            const qualitySelect = document.getElementById('quality');
            const compressButton = document.getElementById('compressButton');

            // Select low quality
            qualitySelect.value = 'low';

            // Click compress button
            compressButton.click();

            // Wait for processing
            await this.waitForCondition(() => {
                const loading = document.getElementById('loading');
                return loading && !loading.classList.contains('hidden');
            }, 2000);

            await this.waitForCondition(() => {
                const loading = document.getElementById('loading');
                return loading && loading.classList.contains('hidden');
            }, 30000);
        });

        await this.runTest('Export Video', async () => {
            const exportButton = document.getElementById('exportButton');

            // Mock download function to capture the download
            let downloadTriggered = false;
            const originalCreateElement = document.createElement;
            document.createElement = function(tagName) {
                const element = originalCreateElement.call(document, tagName);
                if (tagName === 'a') {
                    element.click = function() {
                        if (this.download && this.href) {
                            downloadTriggered = true;
                        }
                    };
                }
                return element;
            };

            // Click export button
            exportButton.click();

            // Wait for download to trigger
            await this.waitForCondition(() => downloadTriggered, 2000);

            // Restore original function
            document.createElement = originalCreateElement;

            if (!downloadTriggered) {
                throw new Error('Download was not triggered');
            }
        });

        // Display results
        this.displayResults();
    }

    displayResults() {
        console.log('\n=== E2E Test Results ===');
        const passed = this.testResults.filter(r => r.success).length;
        const failed = this.testResults.filter(r => !r.success).length;
        const total = this.testResults.length;

        console.log(`Total: ${total}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);
        console.log(`Success Rate: ${((passed / total) * 100).toFixed(2)}%`);

        // Create results summary in DOM
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'fixed top-4 right-4 bg-white p-6 rounded-lg shadow-lg z-50';
        summaryDiv.innerHTML = `
            <h3 class="text-xl font-bold mb-4">E2E Test Results</h3>
            <div class="space-y-2">
                ${this.testResults.map(result => `
                    <div class="flex items-center justify-between">
                        <span class="${result.success ? 'text-green-600' : 'text-red-600'}">
                            ${result.success ? '✓' : '✗'} ${result.name}
                        </span>
                        <span class="text-gray-500 text-sm">${result.duration.toFixed(0)}ms</span>
                    </div>
                `).join('')}
            </div>
            <div class="mt-4 pt-4 border-t">
                <p class="font-semibold">Success Rate: ${((passed / total) * 100).toFixed(2)}%</p>
            </div>
        `;
        document.body.appendChild(summaryDiv);
    }
}

// Auto-run E2E tests when this script is loaded
if (typeof module === 'undefined') {
    window.addEventListener('load', async () => {
        // Wait a bit for the app to fully initialize
        setTimeout(async () => {
            const e2eRunner = new E2ETestRunner();
            await e2eRunner.init();
            await e2eRunner.runAllTests();
        }, 2000);
    });
}