# Business Card Scanner App

## Project Overview
スマホブラウザで使える名刺スキャンアプリ

## Requirements
- **抽出情報**: 苗字、名前、会社名、役職、電話番号、メールアドレス、ウェブサイト、会社住所
- **対応言語**: 日本語・英語
- **出力形式**: vCard形式（iPhone連絡先対応）
- **AI解析**: Gemini 2.5 Flash（高精度認識）
- **UI機能**: ドラッグ&ドロップによる情報修正（抽出アイテム間・フィールド間）
- **データ保存**: 毎回ダウンロード形式（永続化なし）
- **対象デバイス**: スマートフォンブラウザ（レスポンシブ対応）

## Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **AI Service**: Gemini 2.5 Flash API
- **Camera API**: MediaDevices.getUserMedia() (高解像度対応)
- **File Format**: vCard (.vcf) with Photo embedding
- **Drag & Drop**: HTML5 Drag and Drop API (拡張版)
- **Responsive**: CSS Media Queries (768px, 480px ブレークポイント)

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
1. **高解像度カメラ撮影機能** (1920x1080, 最小1280x720)
2. **画像プレビュー** (高画質JPEG 95%品質)
3. **AI解析** (Gemini 2.5 Flash - 高精度日本語対応)
4. **拡張ドラッグ&ドロップ編集**
   - 抽出アイテム → フィールド
   - フィールド間での値移動・コピー・スワップ
5. **姓名分離機能** (苗字・名前の個別管理)
6. **写真付きvCard** (名刺画像埋め込み)
7. **レスポンシブデザイン** (スマホ最適化)
8. **PWA対応** (オフライン起動・ホーム画面インストール)

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
2. 「📷 カメラを開く」をクリック（高解像度カメラが起動）
3. 名刺を撮影（1920x1080の高画質で撮影）
4. 「🔍 名刺を解析」でAI自動抽出（Gemini 2.5 Flash）
5. 抽出された情報をドラッグ&ドロップで各項目に割り当て
   - 抽出アイテム → フィールド
   - フィールド間での値移動・入れ替え
6. 苗字・名前の個別編集と確認
7. 「📱 vCardをダウンロード」で写真付きvCardを保存

## PWA機能
- オフライン対応（Service Worker）
- ホーム画面からの直接起動
- ネイティブアプリのような体験
- 自動アップデート対応
- レスポンシブデザイン（スマホ最適化）

## 最新アップデート情報

### v2.0 (2024年12月) - ユーザビリティ大幅改善
- **高解像度対応**: 1920x1080解像度＋95%画質で小さな文字も読み取り可能
- **姓名分離**: 苗字・名前の個別管理でvCard精度向上
- **フィールド間D&D**: 入力済みフィールド間での値移動・スワップ機能
- **スマホ最適化**: 768px/480px対応でスクロール不要の快適UI
- **Gemini 2.5 Flash**: 日本語名刺認識精度95%達成

### 改善された操作性
- **ドラッグ&ドロップ**: 抽出アイテム・フィールド間での直感的な値移動
- **スワップ機能**: 苗字・名前の入れ替えがワンタップで可能
- **視覚的フィードバック**: ドラッグ中のハイライト表示
- **レスポンシブ**: 全画面サイズでの最適化済みレイアウト