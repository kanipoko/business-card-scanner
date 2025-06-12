// Vercel API integration (secure)
class VisionAPI {
    constructor() {
        // Use Vercel API Route instead of direct API calls
        this.endpoint = '/api/analyze';
    }

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
                const errorData = await response.json();
                throw new Error(errorData.error || `API request failed: ${response.status}`);
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