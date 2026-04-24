// Vercel API Route for Claude Haiku (Anthropic)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('Anthropic API key not found in environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageBase64
              }
            },
            {
              type: 'text',
              text: `この名刺画像から以下の情報を抽出し、JSONのみを返してください。説明文は不要です。不明な場合は空文字列を使用してください。

{
  "name": "氏名（姓名）",
  "company": "会社名・組織名",
  "title": "役職・肩書き",
  "phone": "電話番号（最も一般的なもの）",
  "email": "メールアドレス",
  "address": "住所（完全な住所）",
  "website": "ウェブサイトURL",
  "extractedItems": [
    { "text": "上記以外の抽出テキスト", "type": "unknown" }
  ]
}

extractedItemsには上記フィールドに分類されなかった全テキスト要素を含めてください。日本語・英語両対応、法人格（株式会社、Corp、Incなど）も含めて正確に抽出してください。`
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      return res.status(response.status).json({
        error: `API request failed: ${response.status}`
      });
    }

    const data = await response.json();
    const responseText = data.content?.[0]?.text;

    if (!responseText) {
      return res.status(200).json({
        success: false,
        error: 'No content generated',
        data: { name: '', company: '', title: '', phone: '', email: '', address: '', website: '', extractedItems: [] }
      });
    }

    try {
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error(`No JSON found in response. Raw: ${responseText.slice(0, 300)}`);
        }
        parsedData = JSON.parse(jsonMatch[0]);
      }

      return res.status(200).json({
        success: true,
        data: {
          name: parsedData.name || '',
          company: parsedData.company || '',
          title: parsedData.title || '',
          phone: parsedData.phone || '',
          email: parsedData.email || '',
          address: parsedData.address || '',
          website: parsedData.website || '',
          extractedItems: parsedData.extractedItems || []
        }
      });
    } catch (parseError) {
      console.error('JSON parsing error:', parseError, 'Raw response:', responseText);
      return res.status(500).json({
        error: `Failed to parse model response: ${parseError.message}`
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
