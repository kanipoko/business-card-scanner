/**
 * VisionAPI Client
 * クライアント側からVercel API Route (/api/analyze.js) を呼び出すラッパークラス
 * APIキーはサーバー側で管理され、クライアントには露出しません
 */
class VisionAPI {
    constructor() {
        // Vercel API Route endpoint (see: /api/analyze.js)
        this.endpoint = '/api/analyze';
    }

    /**
     * 名刺画像を解析してJSON形式で情報を抽出
     * @param {string} imageBase64 - Base64エンコードされた画像データ
     * @returns {Promise<Object>} 抽出された名刺情報
     */
    async analyzeImage(imageBase64) {
        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    imageBase64: imageBase64
                })
            });

            if (!response.ok) {
                let errorMessage = `API request failed: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    // Non-JSON response (e.g. Vercel timeout HTML page)
                    const text = await response.text().catch(() => '');
                    if (response.status === 504 || response.status === 503) {
                        errorMessage = 'サーバーがタイムアウトしました。もう一度お試しください。';
                    } else if (text) {
                        errorMessage = `API request failed: ${response.status}`;
                    }
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            
            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.error || 'Analysis failed');
            }
        } catch (error) {
            console.error('Vision API Error:', error);
            throw error;
        }
    }

}

// Export for use in other files
window.VisionAPI = VisionAPI;