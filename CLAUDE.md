# Business Card Scanner App

## Project Overview
スマホブラウザで使える名刺スキャンアプリ

## Requirements
- **抽出情報**: 名前、会社名、役職、電話番号、メールアドレス、ウェブサイト、会社住所
- **対応言語**: 日本語・英語
- **出力形式**: vCard形式（iPhone連絡先対応）
- **AI解析**: Gemini 2.5 Flash（高精度認識）
- **UI機能**: ドラッグ&ドロップによる情報修正
- **データ保存**: 毎回ダウンロード形式（永続化なし）
- **対象デバイス**: スマートフォンブラウザ

## Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **AI Service**: Gemini 2.5 Flash API
- **Camera API**: MediaDevices.getUserMedia()
- **File Format**: vCard (.vcf)
- **Drag & Drop**: HTML5 Drag and Drop API

## Development Commands
```bash
# Development server
python -m http.server 8000

# Open browser
open http://localhost:8000
```

## Project Structure
```
/
├── index.html          # メインHTML
├── style.css          # スタイルシート
├── script.js          # メインJavaScript
├── api.js             # Google Vision API連携
└── vcard.js           # vCard生成ユーティリティ
```

## Features
1. カメラ撮影機能
2. 画像プレビュー
3. AI解析（Gemini 2.5 Flash）
4. 抽出結果のドラッグ&ドロップ編集
5. 役職・ウェブサイト項目追加
6. vCard形式でダウンロード

## Setup Instructions

### 1. Google AI Studio設定（推奨）
1. [Google AI Studio](https://makersuite.google.com/)にアクセス
2. 「Get API Key」でAPIキーを作成
3. Gemini 2.0 Flash APIを使用（高精度な名刺認識）

### 1-2. Google Cloud Platform設定（従来版）
1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクト作成
2. Vision APIを有効化:
   - APIとサービス > ライブラリ > Cloud Vision API > 有効にする
3. APIキーを作成:
   - 認証情報 > 認証情報を作成 > APIキー

### 2. Vercelデプロイ（推奨）

#### GitHubリポジトリ作成
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/business-card-scanner.git
git push -u origin main
```

#### Vercelデプロイ
1. [vercel.com](https://vercel.com)でGitHubアカウント連携
2. 「New Project」でリポジトリを選択
3. 環境変数を設定:
   - Key: `GEMINI_API_KEY` (推奨)
   - Value: `あなたのGemini APIキー`
   - または従来版: Key: `GOOGLE_VISION_API_KEY` / Value: `あなたのVision APIキー`
4. 「Deploy」をクリック

#### 完了！
- 自動的にHTTPS URLが生成されます
- スマホからアクセス可能
- PWAとしてインストール可能

### 3. ローカル開発環境（開発用）
```bash
# HTTPサーバーを起動
python -m http.server 8000

# ブラウザでアクセス
open http://localhost:8000
```

## スマホに直接インストール（PWA）

### Android
1. Chromeでアプリにアクセス
2. 「📱 アプリをインストール」ボタンをタップ
3. 「インストール」を選択
4. ホーム画面にアイコンが追加される

### iPhone/iPad
1. Safariでアプリにアクセス
2. 共有ボタン（□↑）をタップ
3. 「ホーム画面に追加」を選択
4. 「追加」をタップ

## 使用方法
1. ブラウザでアプリにアクセス（またはインストール済みアプリを起動）
2. 「📷 カメラを開く」をクリック
3. 名刺を撮影
4. 「🔍 名刺を解析」でAI自動抽出
5. 抽出された情報をドラッグ&ドロップで各項目に割り当て
6. 結果を確認・編集
7. 「📱 vCardをダウンロード」でiPhoneに保存

## PWA機能
- オフライン対応（Service Worker）
- ホーム画面からの直接起動
- ネイティブアプリのような体験
- 自動アップデート対応