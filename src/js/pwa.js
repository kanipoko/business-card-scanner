/**
 * PWAModule - PWA機能とService Worker管理
 */
class PWAModule {
    constructor() {
        this.deferredPrompt = null;
        this.setup();
    }

    /**
     * PWA機能の初期化
     */
    setup() {
        // Service Workerを登録
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        }

        // インストールプロンプトを処理
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            document.getElementById('install-btn').style.display = 'inline-block';
        });

        // インストール完了時の処理
        window.addEventListener('appinstalled', () => {
            console.log('PWA installed successfully');
            document.getElementById('install-btn').style.display = 'none';
            this.deferredPrompt = null;
        });
    }

    /**
     * アプリインストールプロンプトを表示
     */
    async install() {
        if (!this.deferredPrompt) {
            console.log('Install prompt not available');
            return;
        }

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);

        this.deferredPrompt = null;
        document.getElementById('install-btn').style.display = 'none';
    }
}

// Export for use in other files
window.PWAModule = PWAModule;
