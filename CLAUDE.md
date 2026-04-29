# CLAUDE.md

Claude Code がこのリポジトリで作業する際のガイド。

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

## よく使うコマンド

```bash
# 開発サーバー起動（全アプリ）
pnpm dev

# テスト実行
pnpm test                        # 全体
pnpm --filter api test           # API のみ（Vitest）

# 型チェック
pnpm type-check

# フォーマット・Lint
pnpm fmt:fix   # oxfmt
pnpm lint:fix  # oxlint

# Prisma
pnpm prisma:generate
pnpm prisma:migrate:dev

# API デプロイ（Cloudflare Workers）
pnpm --filter api deploy
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

---
