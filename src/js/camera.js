/**
 * CameraModule - カメラ操作とキャプチャ機能
 */
class CameraModule {
    constructor() {
        this.camera = document.getElementById('camera');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.previewImage = document.getElementById('preview-image');
        this.currentStream = null;
        this.capturedImageData = null;
    }

    /**
     * カメラを起動（背面カメラ優先、高解像度）
     */
    async start() {
        try {
            this.currentStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // 背面カメラ
                    width: { ideal: 1920, min: 1280 },
                    height: { ideal: 1080, min: 720 }
                }
            });

            this.camera.srcObject = this.currentStream;

            // Update UI
            document.getElementById('start-camera').style.display = 'none';
            document.getElementById('capture').style.display = 'inline-block';
            document.getElementById('stop-camera').style.display = 'inline-block';

            return true;
        } catch (error) {
            console.error('Camera access error:', error);
            throw new Error('カメラにアクセスできません。ブラウザの設定を確認してください。');
        }
    }

    /**
     * 現在のカメラ画面をキャプチャ
     * @returns {string} Base64エンコードされた画像データ
     */
    capture() {
        // Set canvas dimensions to match video
        this.canvas.width = this.camera.videoWidth;
        this.canvas.height = this.camera.videoHeight;

        // Draw current video frame to canvas
        this.ctx.drawImage(this.camera, 0, 0);

        // Convert to high-quality JPEG
        const imageDataUrl = this.canvas.toDataURL('image/jpeg', 0.95);
        this.previewImage.src = imageDataUrl;

        // Store for later use (vCard photo)
        this.capturedImageData = imageDataUrl;

        return imageDataUrl;
    }

    /**
     * カメラストリームを停止
     */
    stop() {
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;
        }

        // Reset UI
        document.getElementById('start-camera').style.display = 'inline-block';
        document.getElementById('capture').style.display = 'none';
        document.getElementById('stop-camera').style.display = 'none';
    }

    /**
     * 現在のキャプチャ画像データを取得
     * @returns {string|null} Base64エンコードされた画像データ
     */
    getCapturedImageData() {
        return this.capturedImageData;
    }

    /**
     * キャプチャ画像データをクリア
     */
    clearCapturedImageData() {
        this.capturedImageData = null;
    }

    /**
     * Canvasオブジェクトを取得（vCard画像最適化用）
     * @returns {HTMLCanvasElement} Canvas要素
     */
    getCanvas() {
        return this.canvas;
    }
}

// Export for use in other files
window.CameraModule = CameraModule;
