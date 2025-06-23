// Vercel API Route for Gemini 2.5 Flash
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Get API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('Gemini API key not found in environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Call Gemini 2.5 Flash API
    const requestBody = {
      contents: [{
        parts: [{
          text: `この名刺画像から以下の情報を抽出し、JSON形式で返してください。不明な場合は空文字列を使用してください。

{
  "name": "氏名（姓名）",
  "company": "会社名・組織名",
  "title": "役職・肩書き",
  "phone": "電話番号（最も一般的なもの）",
  "email": "メールアドレス",
  "address": "住所（完全な住所）",
  "website": "ウェブサイトURL",
  "extractedItems": [
    {
      "text": "抽出されたテキスト1",
      "type": "unknown"
    },
    {
      "text": "抽出されたテキスト2", 
      "type": "unknown"
    }
  ]
}

extractedItemsには、上記の分類に当てはまらなかった全てのテキスト要素を含めてください。これにより、ユーザーが後でドラッグ&ドロップで正しい項目に割り当てることができます。

日本語と英語の両方に対応し、会社名の法人格（株式会社、Corp、Incなど）も含めて正確に抽出してください。`
        }, {
          inline_data: {
            mime_type: "image/jpeg",
            data: imageBase64
          }
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1000
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `Gemini API request failed: ${response.status}` 
      });
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const responseText = data.candidates[0].content.parts[0].text;
      
      try {
        // Extract JSON from response (remove any markdown formatting)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        
        const parsedData = JSON.parse(jsonMatch[0]);
        
        // Ensure all required fields exist
        const result = {
          name: parsedData.name || '',
          company: parsedData.company || '',
          title: parsedData.title || '',
          phone: parsedData.phone || '',
          email: parsedData.email || '',
          address: parsedData.address || '',
          website: parsedData.website || '',
          extractedItems: parsedData.extractedItems || []
        };
        
        return res.status(200).json({
          success: true,
          data: result,
          rawResponse: responseText
        });
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        // Fallback to empty data with raw response
        return res.status(200).json({
          success: true,
          data: {
            name: '',
            company: '',
            title: '',
            phone: '',
            email: '',
            address: '',
            website: '',
            extractedItems: []
          },
          rawResponse: responseText,
          parseError: parseError.message
        });
      }
    } else {
      return res.status(200).json({
        success: false,
        error: 'No content generated',
        data: {
          name: '',
          company: '',
          title: '',
          phone: '',
          email: '',
          address: '',
          website: '',
          extractedItems: []
        }
      });
    }

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

