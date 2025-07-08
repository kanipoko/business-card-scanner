# スマホで使える名刺スキャンPWAを作った話 - Google Vision API + Vercel編

## はじめに

名刺交換って面倒ですよね。もらった名刺をiPhoneの連絡先に手入力するのが地味に時間かかる...

そんな悩みを解決するために、**スマホのブラウザから直接使える名刺スキャンアプリ**を作ってみました！

## 完成品

- 📱 PWA対応でアプリのようにホーム画面から起動
- 📷 カメラで名刺を撮影
- 🤖 Google Vision APIで自動文字認識（日本語・英語対応）
- 📇 vCard形式でダウンロード→iPhoneの連絡先に自動追加
- 🔒 VercelのAPI Routesでセキュアに実装

**デモ**: https://business-card-scanner-xxx.vercel.app

## 技術スタック

### フロントエンド
- **HTML5/CSS3/JavaScript**: バニラJSで軽量実装
- **PWA**: Service Worker + Web App Manifestでネイティブアプリ風
- **MediaDevices API**: カメラアクセス
- **Canvas API**: 画像キャプチャ

### バックエンド
- **Vercel API Routes**: サーバーレス関数でAPI実装
- **Google Vision API**: OCR（文字認識）
- **Environment Variables**: APIキー保護

## 実装のポイント

### 1. PWA（Progressive Web App）対応

まずはスマホから直接起動できるよう、PWA対応しました。

```json
// manifest.json
{
  "name": "名刺スキャナー",
  "short_name": "名刺スキャナー",
  "display": "standalone",
  "start_url": "/",
  "theme_color": "#667eea",
  "icons": [
    {
      "src": "icon-192.svg",
      "sizes": "192x192",
      "type": "image/svg+xml"
    }
  ]
}
```

Service Workerでオフライン対応も実装。一度アクセスすれば、ネット接続なしでもアプリが起動します。

```javascript
// sw.js
const CACHE_NAME = 'business-card-scanner-v1';
const urlsToCache = ['/', '/index.html', '/style.css', '/script.js'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});
```

### 2. カメラ機能の実装

スマホのカメラアクセスには `getUserMedia` を使用。背面カメラを優先的に使用するよう設定しました。

```javascript
async startCamera() {
  this.currentStream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'environment', // 背面カメラ
      width: { ideal: 1280 },
      height: { ideal: 720 }
    }
  });
  this.camera.srcObject = this.currentStream;
}
```

### 3. セキュアなAPI実装

最初はフロントエンドから直接Google Vision APIを呼んでいましたが、**APIキーが丸見え**という致命的な問題が...

そこでVercelのAPI Routesを使ってサーバーサイドに移行しました。

```javascript
// api/analyze.js (Vercel API Route)
export default async function handler(req, res) {
  const { imageBase64 } = req.body;
  const apiKey = process.env.GOOGLE_VISION_API_KEY; // 環境変数から取得
  
  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [{
        image: { content: imageBase64 },
        features: [{ type: 'TEXT_DETECTION', maxResults: 1 }]
      }]
    })
  });
  
  const data = await response.json();
  const parsedData = parseBusinessCardText(data.responses[0].textAnnotations[0].description);
  
  return res.json({ success: true, data: parsedData });
}
```

フロントエンドは内部APIを呼ぶだけの形に変更：

```javascript
// api.js (フロントエンド)
async analyzeImage(imageBase64) {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64 })
  });
  
  const data = await response.json();
  return data.data;
}
```

### 4. 名刺テキスト解析ロジック

Google Vision APIで取得した生テキストから、名刺の構造化データを抽出するロジックが重要でした。

```javascript
function parseBusinessCardText(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  const result = { name: '', company: '', phone: '', email: '', address: '' };

  // 正規表現パターン
  const patterns = {
    email: /[\w\.-]+@[\w\.-]+\.\w+/,
    phone: /(?:\+?\d{1,3}[-.\s]?)?\(?[0-9]{2,4}\)?[-.\s]?[0-9]{2,4}[-.\s]?[0-9]{2,4}/
  };

  // 会社名の指標
  const companyIndicators = [
    '株式会社', '有限会社', '合同会社',
    'Corporation', 'Corp', 'Inc', 'Ltd', 'Co.'
  ];

  // 住所の指標
  const addressIndicators = [
    '東京都', '大阪府', '市', '区', '町', '丁目',
    'Tokyo', 'Osaka', 'Street', 'Ave', 'Road'
  ];

  // 各行を解析して適切なフィールドに振り分け
  lines.forEach((line, index) => {
    if (patterns.email.test(line) && !result.email) {
      result.email = line.match(patterns.email)[0];
    } else if (patterns.phone.test(line) && !result.phone) {
      result.phone = line.match(patterns.phone)[0];
    } else if (companyIndicators.some(indicator => line.includes(indicator))) {
      result.company = line;
    } else if (addressIndicators.some(indicator => line.includes(indicator))) {
      result.address += line + ' ';
    }
  });

  return result;
}
```

### 5. vCard生成とダウンロード

抽出したデータをvCard形式に変換して、iPhoneの連絡先に直接インポートできるようにしました。

```javascript
class VCardGenerator {
  generate(contactData) {
    const {name, company, phone, email, address} = contactData;
    
    const vCardLines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${name}`,
      `N:${name.split(' ').reverse().join(';')};`,
      `ORG:${company}`,
      `TEL;TYPE=WORK,VOICE:${phone}`,
      `EMAIL;TYPE=WORK:${email}`,
      `ADR;TYPE=WORK:;;${address};;;;`,
      'END:VCARD'
    ];

    return vCardLines.join('\r\n');
  }

  download(contactData, filename) {
    const vCardContent = this.generate(contactData);
    const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.vcf`;
    link.click();
    
    URL.revokeObjectURL(url);
  }
}
```

## デプロイとCI/CD

Vercelを使うことで、GitHubプッシュだけで自動デプロイできます。

```bash
# GitHubリポジトリ作成
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/business-card-scanner.git
git push -u origin main
```

Vercelでの設定：
1. GitHubリポジトリをインポート
2. 環境変数 `GOOGLE_VISION_API_KEY` を設定
3. 自動デプロイ完了

## 苦労した点と学び

### 1. CORS問題
最初はGitHub Pagesを検討しましたが、Google Vision APIのCORS制限で断念。Vercelの独自ドメインでHTTPS対応することで解決しました。

### 2. カメラ権限
iOSのSafariでは、HTTPSでないとカメラアクセスできません。ローカル開発時は `https://localhost` を使う必要がありました。

### 3. 日本語名刺の解析精度
日本語の名刺は英語と比べて構造が複雑。会社名の位置や敬語表現など、パターンマッチングのロジックを何度も調整しました。

### 4. レスポンシブデザイン
スマホでの使いやすさを重視して、ボタンサイズやフォームの入力体験を細かく調整。特にiOSでのinput要素のズーム対策が重要でした。

```css
/* iOSでのズーム防止 */
input, textarea {
  font-size: 16px; /* 16px以上でズームしない */
}
```

## 今後の改善案

- **精度向上**: 機械学習で名刺レイアウトの学習
- **多言語対応**: 中国語、韓国語の名刺対応
- **クラウド同期**: Firebase連携でデータ同期
- **バッチ処理**: 複数名刺の一括処理
- **名刺管理**: CRM的な機能追加

## まとめ

モダンな技術スタックを使うことで、**アプリストア不要**で高機能な名刺スキャンアプリを作ることができました。

特にPWA + Vercel API Routesの組み合わせは、セキュアで高性能なWebアプリ開発に最適だと感じました。

ソースコード: https://github.com/kanipoko/business-card-scanner

## 技術的詳細

### 使用技術まとめ
- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript
- **PWA**: Service Worker, Web App Manifest
- **API**: Google Vision API (OCR)
- **バックエンド**: Vercel API Routes (Node.js)
- **デプロイ**: Vercel + GitHub
- **その他**: MediaDevices API, Canvas API, File API

### パフォーマンス
- **初回読み込み**: 1.2秒以下
- **画像解析**: 2-3秒（Google API依存）
- **オフライン起動**: 0.5秒以下

名刺スキャンアプリ、ぜひ試してみてください！

---

## 【アップデート】ユーザビリティを大幅改善（2024年12月）

リリース後、実際に使ってみて気づいた課題を解決するため、大幅なアップデートを実施しました。

### 改善点1: 画像解像度の向上

**問題**: 撮影画像の解像度が低く、小さな文字が読み取れない

**解決策**:
- カメラ解像度を1280x720から**1920x1080**に向上
- 画像圧縮品質を0.8から**0.95**に改善
- 最小解像度も1280x720に設定してフォールバック対応

```javascript
// 解像度向上
this.currentStream = await navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: 'environment',
    width: { ideal: 1920, min: 1280 },  // 解像度向上
    height: { ideal: 1080, min: 720 }
  }
});

// 画質向上
const imageDataUrl = this.canvas.toDataURL('image/jpeg', 0.95);  // 0.8 → 0.95
```

### 改善点2: 姓名の分離対応

**問題**: 氏名が一つのフィールドで管理されており、vCardでの姓名分離が不正確

**解決策**:
- UIを「名前」→「苗字」「名前」の2フィールドに分離
- 自動的に氏名を分割する`splitName`関数を実装
- vCard生成時に姓名を適切に処理

```javascript
// 氏名分割ロジック
splitName(fullName) {
  if (!fullName) return { lastName: '', firstName: '' };
  
  const nameParts = fullName.trim().split(/\s+/);
  
  if (nameParts.length === 1) {
    return { lastName: nameParts[0], firstName: '' };
  } else if (nameParts.length === 2) {
    return { lastName: nameParts[0], firstName: nameParts[1] };
  } else {
    return { lastName: nameParts[0], firstName: nameParts.slice(1).join(' ') };
  }
}
```

### 改善点3: スマホ最適化

**問題**: スマホ画面でUIが収まらず、スクロールが必要

**解決策**:
- 全体的なパディング・マージンを最適化
- 768px以下と480px以下の2段階レスポンシブ対応
- フォントサイズ、ボタンサイズを画面サイズに応じて調整

```css
/* スマホ最適化 */
@media (max-width: 768px) {
  .container { padding: 8px; }
  section { padding: 15px; margin-bottom: 12px; }
  .btn { min-width: 100px; padding: 8px 16px; font-size: 14px; }
}

@media (max-width: 480px) {
  .container { padding: 5px; }
  section { padding: 12px; margin-bottom: 10px; }
  .btn { min-width: 90px; padding: 6px 12px; font-size: 13px; }
}
```

### 改善点4: フィールド間ドラッグ&ドロップ

**問題**: 抽出結果が間違った項目に入った場合、手動で修正するのが面倒

**解決策**:
- 入力済みフィールド間でのドラッグ&ドロップ機能を実装
- 値の移動（スワップ）またはコピーを選択可能
- 視覚的フィードバックで操作を直感的に

```javascript
// フィールド間ドラッグ&ドロップ
handleFieldToFieldDrop(sourceField, targetField, text) {
  const sourceValue = sourceField.value.trim();
  const targetValue = targetField.value.trim();
  
  if (targetValue === '') {
    // 空の場合は移動
    targetField.value = sourceValue;
    sourceField.value = '';
  } else {
    // 両方に値がある場合は選択肢を提示
    const action = confirm('値を移動しますか？\n\nOK = 移動（入れ替え）\nキャンセル = コピー');
    
    if (action) {
      // スワップ
      targetField.value = sourceValue;
      sourceField.value = targetValue;
    } else {
      // コピー
      targetField.value = sourceValue;
    }
  }
}
```

### 改善点5: Gemini 2.5 Flash対応

**問題**: Google Vision APIの精度に限界があり、日本語名刺の認識が不正確

**解決策**:
- Google Vision APIから**Gemini 2.5 Flash**に移行
- 構造化プロンプトで名刺情報を正確に抽出
- 分類できない情報は`extractedItems`として保持し、後でドラッグ&ドロップで割り当て可能

```javascript
// Gemini 2.5 Flash用プロンプト
const prompt = `この名刺画像から以下の情報を抽出し、JSON形式で返してください。

{
  "name": "氏名（姓名）",
  "company": "会社名・組織名",
  "title": "役職・肩書き",
  "phone": "電話番号",
  "email": "メールアドレス",
  "address": "住所",
  "website": "ウェブサイトURL",
  "extractedItems": [
    { "text": "抽出されたテキスト1", "type": "unknown" },
    { "text": "抽出されたテキスト2", "type": "unknown" }
  ]
}

extractedItemsには、上記の分類に当てはまらなかった全てのテキスト要素を含めてください。`;
```

### 結果と効果

これらの改善により、**実用性が大幅に向上**しました：

- **認識精度**: 日本語名刺の認識率が約80%→95%に向上
- **操作性**: 苗字・名前の入れ替えが1タップで可能
- **レスポンス**: スマホでのスクロールが不要に
- **柔軟性**: 誤認識した項目を直感的に修正可能

### 今後の展開

ユーザーからの要望を受けて、さらなる機能追加を検討中：

- **写真付きvCard**: 名刺の写真をvCardに埋め込み
- **履歴機能**: 過去にスキャンした名刺の管理
- **CSVエクスポート**: 一括でのデータ出力
- **テンプレート機能**: 業界別の名刺フォーマット対応

継続的な改善により、より使いやすい名刺スキャンアプリを目指していきます！