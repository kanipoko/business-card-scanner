/**
 * BusinessCardScanner - メインアプリケーション
 * 各モジュールを統合してアプリケーション全体を制御
 */
class BusinessCardScanner {
    constructor() {
        // モジュール初期化
        this.camera = new CameraModule();
        this.dragDrop = new DragDropModule();
        this.form = new FormModule();
        this.pwa = new PWAModule();

        // API/ユーティリティ
        this.visionAPI = new VisionAPI();
        this.vCardGenerator = new VCardGenerator();

        // イベントリスナー設定
        this.setupEventListeners();
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // Camera controls
        document.getElementById('start-camera').addEventListener('click', () => this.startCamera());
        document.getElementById('capture').addEventListener('click', () => this.captureImage());
        document.getElementById('stop-camera').addEventListener('click', () => this.stopCamera());

        // Preview controls
        document.getElementById('analyze-btn').addEventListener('click', () => this.analyzeImage());
        document.getElementById('retake-btn').addEventListener('click', () => this.retakePhoto());

        // Result controls
        document.getElementById('download-vcard').addEventListener('click', () => this.downloadVCard());
        document.getElementById('new-scan').addEventListener('click', () => this.newScan());

        // Install button (PWA)
        document.getElementById('install-btn').addEventListener('click', () => this.pwa.install());
    }

    // ========== Camera Operations ==========

    async startCamera() {
        try {
            await this.camera.start();
            this.showSection('camera-section');
            this.hideError();
        } catch (error) {
            console.error('Camera error:', error);
            this.showError(error.message);
        }
    }

    captureImage() {
        this.camera.capture();
        this.camera.stop();
        this.showSection('preview-section');
    }

    stopCamera() {
        this.camera.stop();
    }

    // ========== Image Analysis ==========

    async analyzeImage() {
        try {
            this.showSection('loading-section');
            this.hideError();

            // Get base64 image data (remove data URL prefix)
            const imageDataUrl = this.camera.getCapturedImageData();
            const imageData = imageDataUrl.split(',')[1];

            // Call Vision API
            const extractedData = await this.visionAPI.analyzeImage(imageData);

            // Populate form with extracted data
            this.form.populate(extractedData);

            // Setup drag & drop for extracted items
            this.dragDrop.populateExtractedItems(extractedData.extractedItems || []);
            this.dragDrop.setup();

            // Show results
            this.showSection('result-section');

        } catch (error) {
            console.error('Analysis error:', error);
            this.showError(`名刺の解析に失敗しました: ${error.message}`);
            this.showSection('preview-section');
        }
    }

    // ========== vCard Generation ==========

    downloadVCard() {
        // Get contact data from form
        const contactData = this.form.getContactData();

        // Add photo if available
        const capturedImageData = this.camera.getCapturedImageData();
        if (capturedImageData) {
            const canvas = this.camera.getCanvas();
            const optimizedPhoto = VCardGenerator.resizeImageForVCard(canvas);
            contactData.photo = optimizedPhoto;
        }

        // Validate
        if (!this.vCardGenerator.isValid(contactData)) {
            this.showError('苗字・名前または会社名を入力してください。');
            return;
        }

        try {
            // Generate filename
            const fileName = contactData.name || contactData.company || 'contact';
            const sanitizedFileName = this.form.sanitizeFileName(fileName);

            // Download vCard
            this.vCardGenerator.download(contactData, `${sanitizedFileName}.vcf`);

            this.hideError();

            // Show success message
            this.showError('vCardをダウンロードしました！', 'success');
            setTimeout(() => this.hideError(), 3000);

        } catch (error) {
            console.error('Download error:', error);
            this.showError('vCardのダウンロードに失敗しました。');
        }
    }

    // ========== UI Flow Control ==========

    retakePhoto() {
        this.hideAllSections();
        this.startCamera();
    }

    newScan() {
        this.form.reset();
        this.camera.clearCapturedImageData();
        this.hideAllSections();
        this.hideError();

        // Reset camera UI
        document.getElementById('start-camera').style.display = 'inline-block';
        document.getElementById('capture').style.display = 'none';
        document.getElementById('stop-camera').style.display = 'none';

        this.showSection('camera-section');
    }

    // ========== UI Utilities ==========

    showSection(sectionClass) {
        this.hideAllSections();
        document.querySelector(`.${sectionClass}`).style.display = 'block';
    }

    hideAllSections() {
        const sections = ['camera-section', 'preview-section', 'loading-section', 'result-section'];
        sections.forEach(section => {
            const element = document.querySelector(`.${section}`);
            if (element) element.style.display = 'none';
        });
    }

    showError(message, type = 'error') {
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = message;
        errorElement.className = type === 'success' ? 'success-message' : 'error-message';
        errorElement.style.display = 'block';
    }

    hideError() {
        document.getElementById('error-message').style.display = 'none';
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BusinessCardScanner();
});

// Add success message styling
const style = document.createElement('style');
style.textContent = `
    .success-message {
        background: #28a745;
        color: white;
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
        text-align: center;
        font-weight: 500;
    }
`;
document.head.appendChild(style);
