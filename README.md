# 📇 Business Card Scanner

A mobile-first business card scanner that uses AI to extract contact information and generates vCard files compatible with iPhone contacts.

## 🚀 Features

- 📱 **Mobile-first PWA** - Works on smartphones, installable as an app
- 🤖 **AI-powered extraction** - Uses Gemini 2.5 Flash for high-accuracy text recognition
- 🎯 **Drag & drop editing** - Easily correct and organize extracted information
- 📸 **Photo embedding** - Captured business card photos display in iPhone contacts
- 🌐 **Multi-language support** - Works with Japanese and English business cards
- 📲 **vCard export** - One-click download compatible with iPhone contacts
- 🎨 **Intuitive UI** - Clean, modern interface optimized for mobile use

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **AI Service**: Google Gemini 2.5 Flash API
- **Camera**: MediaDevices.getUserMedia() API
- **File Format**: vCard 3.0 (.vcf)
- **Drag & Drop**: HTML5 Drag and Drop API
- **PWA**: Service Worker, Web App Manifest

## 📱 Installation

### Option 1: Use Live Demo
Visit the deployed app: [Your Vercel URL]

### Option 2: Install as PWA
1. Open the app in your mobile browser
2. Tap "📱 アプリをインストール" button
3. Confirm installation
4. Access from your home screen

### Option 3: Local Development
```bash
# Clone repository
git clone https://github.com/kanipoko/business-card-scanner.git
cd business-card-scanner

# Start development server
python -m http.server 8000

# Open in browser
open http://localhost:8000
```

## 🔧 Setup

### Get Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/)
2. Click "Get API Key"
3. Create a new API key for Gemini 2.5 Flash

### Deploy to Vercel
1. Fork this repository
2. Connect to [Vercel](https://vercel.com)
3. Set environment variable:
   - `GEMINI_API_KEY`: Your Gemini API key
4. Deploy

## 🎯 How to Use

1. **📷 Capture** - Take a photo of a business card
2. **🔍 Analyze** - AI extracts contact information automatically
3. **✏️ Edit** - Drag & drop to correct any information
4. **📱 Download** - Export as vCard file for iPhone contacts
5. **📇 Import** - Open the .vcf file to add to your contacts

## 📂 Project Structure

```
/
├── index.html          # Main HTML file
├── style.css          # Stylesheet
├── script.js          # Main application logic
├── api.js             # Gemini API integration
├── vcard.js           # vCard generation utility
├── manifest.json      # PWA manifest
└── sw.js              # Service worker
```

## 🌟 Key Features Explained

### AI-Powered Extraction
- Uses Gemini 2.5 Flash for accurate text recognition
- Supports both Japanese and English business cards
- Extracts: Name, Company, Title, Phone, Email, Website, Address

### Drag & Drop Interface
- Extracted information appears as draggable items
- Drop items into appropriate form fields
- Smart conflict resolution for existing data

### Photo Integration
- Captured business card photos are embedded in vCard files
- Photos display in iPhone contacts app
- Automatic image optimization for file size

### PWA Capabilities
- Installable on mobile devices
- Offline functionality with Service Worker
- Native app-like experience

## 🔒 Privacy & Security

- No data is stored on servers
- All processing happens locally or via secure APIs
- Images and contact data are not retained after download
- API keys are handled securely via environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on mobile devices
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Google Gemini AI for powerful text recognition
- Modern web APIs for camera and file handling
- Progressive Web App standards for mobile experience

---

Made with ❤️ for seamless business card management