# Vercel環境変数の設定手順

Vercelにデプロイする際、Anthropic APIキーを環境変数として設定する必要があります。

## 📋 設定手順

### 1. Vercelダッシュボードにアクセス

https://vercel.com/dashboard にアクセスして、プロジェクトを選択します。

### 2. 環境変数を設定

1. プロジェクトページで **Settings** タブをクリック
2. 左サイドバーから **Environment Variables** を選択
3. 以下の環境変数を追加：

   **環境変数名:** `ANTHROPIC_API_KEY`

   **値:** あなたのAnthropic APIキー

   **環境:** Production, Preview, Development すべて選択

4. **Save** をクリック

### 3. 再デプロイ

環境変数を設定後、以下のいずれかの方法で再デプロイします：

#### 方法A: Vercelダッシュボードから
1. **Deployments** タブに移動
2. 最新のデプロイメントの右側の「...」メニューをクリック
3. **Redeploy** を選択
4. **Redeploy** ボタンをクリック

#### 方法B: GitHubから
```bash
# 空コミットをプッシュして再デプロイをトリガー
git commit --allow-empty -m "Trigger redeploy with env vars"
git push origin main
```

#### 方法C: Vercel CLIから（ログイン済みの場合）
```bash
vercel --prod
```

## 🔑 Anthropic APIキーの取得方法

まだAPIキーを持っていない場合：

1. [console.anthropic.com](https://console.anthropic.com) にアクセス
2. 「API Keys」をクリック
3. 新しいAPIキーを作成
4. キーをコピーして上記の環境変数に設定

## ✅ 動作確認

環境変数が正しく設定されているか確認：

1. Vercelダッシュボードの **Settings > Environment Variables** で設定を確認
2. デプロイログで環境変数のエラーがないことを確認
3. デプロイされたアプリで名刺スキャン機能をテスト

## 🔒 セキュリティのベストプラクティス

- ✅ 環境変数はVercelダッシュボードから設定（コードにハードコードしない）
- ✅ APIキーは `.env` ファイルに保存し、`.gitignore` で除外
- ✅ 本番環境とプレビュー環境で異なるキーを使用することも可能
- ✅ 定期的にAPIキーをローテーション

## 📝 トラブルシューティング

### エラー: "Server configuration error"

**原因:** 環境変数 `ANTHROPIC_API_KEY` が設定されていない

**解決策:**
1. Vercelダッシュボードで環境変数を確認
2. すべての環境（Production, Preview, Development）にチェックが入っているか確認
3. 再デプロイ

### エラー: "API request failed: 401"

**原因:** APIキーが無効または期限切れ

**解決策:**
1. [console.anthropic.com](https://console.anthropic.com) で新しいAPIキーを生成
2. Vercelの環境変数を更新
3. 再デプロイ

### エラー: "API request failed: 429"

**原因:** APIの使用制限に達した

**解決策:**
1. [console.anthropic.com](https://console.anthropic.com) でUsageを確認
2. 必要に応じてクレジットを追加

## 🔗 参考リンク

- [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)
- [Anthropic Console](https://console.anthropic.com)
- [Anthropic API Documentation](https://docs.anthropic.com)
