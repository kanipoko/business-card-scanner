# 名刺スキャナーアプリ アーキテクチャ図

## システム全体図

```mermaid
graph TB
    subgraph "Frontend (PWA)"
        A[index.html] --> B[script.js]
        A --> C[style.css]
        B --> D[api.js]
        B --> E[vcard.js]
        F[sw.js] --> A
        G[manifest.json] --> A
    end
    
    subgraph "Vercel API Routes"
        H[/api/analyze.js]
    end
    
    subgraph "External Services"
        I[Gemini 2.5 Flash API]
        J[Camera API]
    end
    
    subgraph "User Devices"
        K[スマートフォン]
        L[vCard File]
    end
    
    D --> H
    H --> I
    J --> B
    E --> L
    K --> A
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style H fill:#fff3e0
    style I fill:#e8f5e8
```

## データフロー図

```mermaid
flowchart LR
    A[📷 カメラ撮影] --> B[🖼️ 画像プレビュー]
    B --> C[🧠 Gemini API解析]
    C --> D[📝 抽出データ表示]
    D --> E[🎯 ドラッグ&ドロップ編集]
    E --> F[📱 vCard生成・ダウンロード]
    
    subgraph "AI処理"
        C --> G[JSON構造化データ]
        G --> H[extractedItems配列]
    end
    
    subgraph "UI操作"
        H --> I[ドラッグ可能アイテム]
        I --> J[ドロップゾーン]
        J --> K[フォーム更新]
    end
    
    style C fill:#e8f5e8
    style E fill:#fff3e0
    style F fill:#e1f5fe
```

## ファイル構成と責任

```mermaid
graph TD
    subgraph "Frontend Files"
        A[index.html<br/>📄 UI構造定義]
        B[script.js<br/>🎮 メインロジック]
        C[style.css<br/>🎨 スタイル・アニメーション]
        D[api.js<br/>🔗 API通信]
        E[vcard.js<br/>📇 vCard生成]
        F[sw.js<br/>⚙️ Service Worker]
        G[manifest.json<br/>📱 PWA設定]
    end
    
    subgraph "Backend API"
        H[/api/analyze.js<br/>🧠 Gemini API統合]
    end
    
    subgraph "Configuration"
        I[vercel.json<br/>⚙️ デプロイ設定]
        J[CLAUDE.md<br/>📚 プロジェクト仕様]
    end
    
    A --> B
    B --> D
    B --> E
    D --> H
    F --> A
    G --> A
```

## クラス・関数関係図

```mermaid
classDiagram
    class BusinessCardScanner {
        +camera: HTMLVideoElement
        +canvas: HTMLCanvasElement
        +visionAPI: VisionAPI
        +vCardGenerator: VCardGenerator
        +startCamera()
        +captureImage()
        +analyzeImage()
        +populateForm()
        +populateExtractedItems()
        +setupDragAndDrop()
        +downloadVCard()
    }
    
    class VisionAPI {
        +endpoint: string
        +analyzeImage(imageBase64)
    }
    
    class VCardGenerator {
        +version: string
        +generate(contactData)
        +download(contactData, filename)
        +isValid(contactData)
    }
    
    class DragDropHandler {
        +handleDragStart(e)
        +handleDragEnd(e)
        +handleDragOver(e)
        +handleDrop(e)
    }
    
    BusinessCardScanner --> VisionAPI
    BusinessCardScanner --> VCardGenerator
    BusinessCardScanner --> DragDropHandler
```

## API通信フロー

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as /api/analyze
    participant G as Gemini API
    
    U->>F: 名刺撮影
    F->>F: Canvas描画
    F->>A: POST /api/analyze<br/>{imageBase64}
    A->>G: Gemini 2.5 Flash<br/>構造化プロンプト
    G->>A: JSON Response<br/>{name, company, extractedItems...}
    A->>F: 解析結果
    F->>F: フォーム自動入力
    F->>F: ドラッグアイテム生成
    U->>F: ドラッグ&ドロップ編集
    F->>F: vCard生成
    F->>U: vCardダウンロード
```

## ドラッグ&ドロップ仕組み

```mermaid
graph LR
    subgraph "Extracted Items"
        A[draggable-item<br/>data-text="山田太郎"]
        B[draggable-item<br/>data-text="部長"]
        C[draggable-item<br/>data-text="03-1234-5678"]
    end
    
    subgraph "Drop Zones"
        D[drop-zone[data-field="name"]<br/>👤 名前フィールド]
        E[drop-zone[data-field="title"]<br/>💼 役職フィールド]
        F[drop-zone[data-field="phone"]<br/>📞 電話フィールド]
    end
    
    A -.->|drag & drop| D
    B -.->|drag & drop| E
    C -.->|drag & drop| F
    
    style A fill:#e3f2fd
    style B fill:#e8f5e8
    style C fill:#fff3e0
```

## PWA機能構成

```mermaid
graph TB
    subgraph "PWA Features"
        A[manifest.json<br/>📱 アプリ情報]
        B[sw.js<br/>🔄 キャッシュ管理]
        C[Icons<br/>🎨 アプリアイコン]
    end
    
    subgraph "Device Integration"
        D[ホーム画面追加]
        E[オフライン対応]
        F[プッシュ通知対応]
    end
    
    A --> D
    B --> E
    B --> F
    C --> D
```

## 環境変数・設定

```mermaid
graph TD
    subgraph "Development"
        A[ローカル開発<br/>python -m http.server]
    end
    
    subgraph "Production (Vercel)"
        B[GEMINI_API_KEY<br/>🔑 環境変数]
        C[vercel.json<br/>⚙️ ルーティング設定]
        D[自動HTTPS<br/>🔒 セキュア通信]
    end
    
    subgraph "External APIs"
        E[Google AI Studio<br/>🧠 Gemini 2.5 Flash]
    end
    
    B --> E
    C --> B
```

この関係図により、アプリの全体構造とコンポーネント間の関係が明確になります。