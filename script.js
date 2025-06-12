// Main application logic
class BusinessCardScanner {
    constructor() {
        this.camera = document.getElementById('camera');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.previewImage = document.getElementById('preview-image');
        
        this.visionAPI = new VisionAPI();
        this.vCardGenerator = new VCardGenerator();
        
        this.currentStream = null;
        this.deferredPrompt = null;
        
        this.setupEventListeners();
        this.setupPWA();
    }

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

        // Install button
        document.getElementById('install-btn').addEventListener('click', () => this.installApp());
    }

    setupPWA() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered:', registration);
                })
                .catch(error => {
                    console.log('SW registration failed:', error);
                });
        }

        // Handle install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            document.getElementById('install-btn').style.display = 'inline-block';
        });

        // Handle app installed
        window.addEventListener('appinstalled', () => {
            console.log('PWA installed');
            document.getElementById('install-btn').style.display = 'none';
            this.deferredPrompt = null;
        });
    }

    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log(`User response: ${outcome}`);
            this.deferredPrompt = null;
            document.getElementById('install-btn').style.display = 'none';
        }
    }

    async startCamera() {
        try {
            // Request camera access
            this.currentStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use back camera on mobile
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            this.camera.srcObject = this.currentStream;
            
            // Update UI
            this.showSection('camera-section');
            document.getElementById('start-camera').style.display = 'none';
            document.getElementById('capture').style.display = 'inline-block';
            document.getElementById('stop-camera').style.display = 'inline-block';
            
            this.hideError();
        } catch (error) {
            console.error('Camera access error:', error);
            this.showError('カメラにアクセスできません。ブラウザの設定を確認してください。');
        }
    }

    captureImage() {
        // Set canvas dimensions to match video
        this.canvas.width = this.camera.videoWidth;
        this.canvas.height = this.camera.videoHeight;
        
        // Draw current video frame to canvas
        this.ctx.drawImage(this.camera, 0, 0);
        
        // Convert to image and show preview
        const imageDataUrl = this.canvas.toDataURL('image/jpeg', 0.8);
        this.previewImage.src = imageDataUrl;
        
        // Update UI
        this.stopCamera();
        this.showSection('preview-section');
    }

    stopCamera() {
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;
        }
        
        // Reset camera UI
        document.getElementById('start-camera').style.display = 'inline-block';
        document.getElementById('capture').style.display = 'none';
        document.getElementById('stop-camera').style.display = 'none';
    }

    async analyzeImage() {
        try {
            // Show loading
            this.showSection('loading-section');
            this.hideError();

            // Get image data as base64
            const imageData = this.previewImage.src.split(',')[1]; // Remove data:image/jpeg;base64, prefix
            
            // Call Vision API
            const extractedData = await this.visionAPI.analyzeImage(imageData);
            
            // Populate form with extracted data
            this.populateForm(extractedData);
            
            // Show results
            this.showSection('result-section');
            
        } catch (error) {
            console.error('Analysis error:', error);
            this.showError(`名刺の解析に失敗しました: ${error.message}`);
            this.showSection('preview-section');
        }
    }

    populateForm(data) {
        document.getElementById('name').value = data.name || '';
        document.getElementById('company').value = data.company || '';
        document.getElementById('phone').value = data.phone || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('address').value = data.address || '';
    }

    retakePhoto() {
        this.hideAllSections();
        this.startCamera();
    }

    downloadVCard() {
        // Get form data
        const contactData = {
            name: document.getElementById('name').value.trim(),
            company: document.getElementById('company').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            address: document.getElementById('address').value.trim()
        };

        // Validate data
        if (!this.vCardGenerator.isValid(contactData)) {
            this.showError('名前または会社名を入力してください。');
            return;
        }

        try {
            // Generate filename
            const fileName = contactData.name || contactData.company || 'contact';
            const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '_');
            
            // Download vCard
            this.vCardGenerator.download(contactData, `${sanitizedFileName}.vcf`);
            
            this.hideError();
            
            // Show success message briefly
            this.showError('vCardをダウンロードしました！', 'success');
            setTimeout(() => this.hideError(), 3000);
            
        } catch (error) {
            console.error('Download error:', error);
            this.showError('vCardのダウンロードに失敗しました。');
        }
    }

    newScan() {
        // Reset form
        document.getElementById('contact-form').reset();
        
        // Reset UI
        this.hideAllSections();
        this.hideError();
        
        // Show camera section
        document.getElementById('start-camera').style.display = 'inline-block';
        document.getElementById('capture').style.display = 'none';
        document.getElementById('stop-camera').style.display = 'none';
        this.showSection('camera-section');
    }

    // Utility methods
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