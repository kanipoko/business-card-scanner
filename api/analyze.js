// Vercel API Route for Google Vision API
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
    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    
    if (!apiKey) {
      console.error('Google Vision API key not found in environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Call Google Vision API
    const requestBody = {
      requests: [{
        image: {
          content: imageBase64
        },
        features: [{
          type: 'TEXT_DETECTION',
          maxResults: 1
        }]
      }]
    };

    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vision API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `Vision API request failed: ${response.status}` 
      });
    }

    const data = await response.json();
    
    if (data.responses && data.responses[0] && data.responses[0].textAnnotations) {
      const detectedText = data.responses[0].textAnnotations[0].description;
      const parsedData = parseBusinessCardText(detectedText);
      
      return res.status(200).json({
        success: true,
        data: parsedData,
        rawText: detectedText
      });
    } else {
      return res.status(200).json({
        success: false,
        error: 'No text detected in the image',
        data: {
          name: '',
          company: '',
          phone: '',
          email: '',
          address: ''
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

// Business card text parsing function
function parseBusinessCardText(text) {
  console.log('Detected text:', text);
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  const result = {
    name: '',
    company: '',
    phone: '',
    email: '',
    address: ''
  };

  // Patterns for different information types
  const patterns = {
    email: /[\w\.-]+@[\w\.-]+\.\w+/,
    phone: /(?:\+?\d{1,3}[-.\s]?)?\(?[0-9]{2,4}\)?[-.\s]?[0-9]{2,4}[-.\s]?[0-9]{2,4}/,
    url: /https?:\/\/[^\s]+|www\.[^\s]+/i
  };

  let addressLines = [];
  let possibleNames = [];
  let possibleCompanies = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Email detection
    if (patterns.email.test(line) && !result.email) {
      result.email = line.match(patterns.email)[0];
      continue;
    }

    // Phone detection
    if (patterns.phone.test(line) && !result.phone) {
      result.phone = line.match(patterns.phone)[0];
      continue;
    }

    // Skip URLs
    if (patterns.url.test(line)) {
      continue;
    }

    // Company indicators (Japanese and English)
    const companyIndicators = [
      '株式会社', '有限会社', '合同会社', '一般社団法人', '財団法人',
      'Corporation', 'Corp', 'Inc', 'Ltd', 'Co.', 'Company', 'LLC',
      '会社', '企業', '法人'
    ];

    const hasCompanyIndicator = companyIndicators.some(indicator => 
      line.includes(indicator)
    );

    if (hasCompanyIndicator && !result.company) {
      result.company = line;
      continue;
    }

    // Address indicators (Japanese and English)
    const addressIndicators = [
      '東京都', '大阪府', '京都府', '神奈川県', '埼玉県', '千葉県',
      '市', '区', '町', '村', '番地', '丁目',
      'Tokyo', 'Osaka', 'Kyoto', 'Japan', 'Prefecture',
      'Street', 'Ave', 'Avenue', 'Road', 'Blvd'
    ];

    const hasAddressIndicator = addressIndicators.some(indicator => 
      line.includes(indicator)
    );

    if (hasAddressIndicator) {
      addressLines.push(line);
      continue;
    }

    // Collect potential names and companies
    if (line.length > 1 && line.length < 50) {
      if (i === 0 || i === 1) {
        // First two lines are often name or company
        possibleNames.push(line);
      }
      possibleCompanies.push(line);
    }
  }

  // Assign name (prefer shorter lines that look like names)
  if (!result.name && possibleNames.length > 0) {
    result.name = possibleNames.find(name => 
      name.length < 20 && !patterns.phone.test(name) && !patterns.email.test(name)
    ) || possibleNames[0];
  }

  // Assign company if not already found
  if (!result.company && possibleCompanies.length > 0) {
    result.company = possibleCompanies.find(company => 
      company !== result.name && company.length < 100
    ) || '';
  }

  // Combine address lines
  if (addressLines.length > 0) {
    result.address = addressLines.join(' ');
  }

  return result;
}