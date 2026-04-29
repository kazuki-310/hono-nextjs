# AGENTS.md

Codex（および他の AI エージェント）がこのリポジトリで作業する際のガイド。

---

## リポジトリ概要

Turborepo モノレポ。pnpm ワークスペースで管理。

```
hono-nextjs/
├── apps/
│   ├── api/   # Hono + Cloudflare Workers（クリーンアーキテクチャ）
│   └── web/   # Next.js 16 フロントエンド
└── packages/
    ├── database/          # Prisma スキーマ・クライアント
    └── typescript-config/ # 共有 tsconfig
```

---

## セットアップ

```bash
# 依存インストール
pnpm install

# Prisma クライアント生成
pnpm prisma:generate
```

---

## コマンドリファレンス

```bash
# テスト（必ず変更後に実行）
pnpm test                  # 全体
pnpm --filter api test     # API のみ（Vitest）

# 型チェック（必ず変更後に実行）
pnpm type-check

# フォーマット
pnpm fmt:fix   # oxfmt

# Lint
pnpm lint:fix  # oxlint

# 開発サーバー
pnpm dev
```

---

## 技術スタック

| 領域                 | 技術                           |
| -------------------- | ------------------------------ |
| API フレームワーク   | Hono                           |
| API ランタイム       | Cloudflare Workers（wrangler） |
| フロントエンド       | Next.js 16 / React 19          |
| DB ORM               | Prisma（PostgreSQL）           |
| テスト               | Vitest                         |
| Lint                 | oxlint                         |
| フォーマット         | oxfmt                          |
| ビルドシステム       | Turborepo                      |
| パッケージマネージャ | pnpm                           |
| Node.js              | 24.14.0                        |
