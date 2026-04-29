# API クリーンアーキテクチャ ルール

対象: `apps/api/src/` 配下のすべてのコード

---

## レイヤー構成と責務

```
src/
├── domain/           # ドメイン層（最内層）
│   ├── model/        # エンティティ・値オブジェクト
│   └── repository/   # リポジトリインターフェース
├── application/      # アプリケーション層
│   └── usecase/      # ユースケース
├── infrastructure/   # インフラ層
│   ├── web/          # Hono ルーティング・アプリ設定
│   └── prisma/       # DB リポジトリ実装
├── handler/          # プレゼンター・コントローラ（インターフェースアダプタ層）
└── testing/          # テスト用インメモリ実装
```

---

## 依存関係のルール（依存関係逆転の原則）

```
handler → application → domain ← infrastructure
```

- **domain 層**は他のいかなる層にも依存しない
- **application 層**は domain 層のみに依存する（infrastructure・handler を import 禁止）
- **handler 層**は application 層と domain 層にのみ依存する
- **infrastructure 層**は domain 層のインターフェースを実装する（application を import 禁止）
- 違反例: `application/usecase/*.ts` が `infrastructure/prisma/*.ts` を import する → **禁止**

---

## domain 層のルール

### エンティティ・値オブジェクト (`domain/model/`)
- プリミティブな値を直接公開せず、値オブジェクトでラップする
- ビジネスバリデーションはコンストラクタ or ファクトリメソッド (`static create()`) で行う
- バリデーション失敗時はドメイン固有の Error クラスをスローする（例: `TodoValidationError`）
- 不変性を保つ（`private readonly` フィールド、状態変化は新インスタンスを返す）
- 外部への値公開は `snapshot()` メソッド（`xxxSnapshot` 型）を通じて行う

```ts
// Good
export class TodoTitle {
  private constructor(private readonly value: string) {}
  static create(value: string): TodoTitle { /* validation */ }
  toString(): string { return this.value; }
}

// Bad: バリデーションなしの公開フィールド
export class TodoTitle {
  constructor(public value: string) {}
}
```

### リポジトリインターフェース (`domain/repository/`)
- インターフェース（`interface`）として定義し、実装は持たない
- メソッドはドメイン用語で命名する（`findById`, `save`, `nextIdentity` など）
- 戻り値はドメインオブジェクトかプリミティブのみ（ORM エンティティを返さない）

---

## application 層のルール

### ユースケース (`application/usecase/`)
- クラス名は `XxxUseCase` とし、単一の `execute()` メソッドを持つ
- コンストラクタでリポジトリインターフェースを受け取る（DI）
- ビジネスロジックはドメイン層に委譲し、ユースケース自身は**オーケストレーション**のみ行う
- HTTP・DB などインフラ固有の概念を持ち込まない
- 戻り値はドメインオブジェクトを返し、HTTP レスポンス形式に変換しない

```ts
// Good
export class CreateTodoUseCase {
  constructor(private readonly todoRepository: TodoRepository) {}
  async execute(input: CreateTodoInput): Promise<Todo> { ... }
}

// Bad: HTTP 概念がユースケースに混入
async execute(input: CreateTodoInput): Promise<Response> { ... }
```

---

## handler 層のルール（インターフェースアダプタ）

### コントローラ (`handler/*-controller.ts`)
- HTTP リクエストをパースしてユースケースの入力型に変換する
- ユースケースを呼び出し、結果をプレゼンターに渡す
- 例外をキャッチして適切な HTTP ステータスコードにマッピングする
- ドメインロジックを直接実装しない

### プレゼンター (`handler/*-presenter.ts`)
- ドメインオブジェクト（`snapshot()`）を HTTP レスポンス用の形式に変換する
- 純粋な変換関数またはクラスとして実装する

---

## infrastructure 層のルール

### DB リポジトリ (`infrastructure/prisma/`)
- `domain/repository/` のインターフェースを実装する
- Prisma のレコード型をドメインオブジェクトに変換する責務を持つ（`restore()` を使う）
- Prisma 固有の型をドメイン層・アプリケーション層に漏らさない

### Hono ルーティング (`infrastructure/web/`)
- ルーティングのみを担当し、ビジネスロジックを持たない
- 依存性の注入は `dependenciesProvider` パターンを使う

---

## テストのルール

- ドメインモデルのユニットテストは `domain/model/*.test.ts` に配置する
- インテグレーションテストは `infrastructure/web/*.test.ts` に配置する
- テスト用のリポジトリ実装は `testing/in-memory-*-repository.ts` に配置する
- インメモリリポジトリはドメインの `repository/` インターフェースを実装する

---

## 命名規則

| 種別 | 命名パターン | 例 |
|------|------------|-----|
| エンティティ | `XxxName` | `Todo`, `User` |
| 値オブジェクト | `XxxProperty` | `TodoId`, `TodoTitle` |
| ドメインエラー | `XxxValidationError` | `TodoValidationError` |
| スナップショット型 | `XxxSnapshot` | `TodoSnapshot` |
| リポジトリIF | `XxxRepository` | `TodoRepository` |
| ユースケース | `XxxUseCase` | `CreateTodoUseCase` |
| コントローラ | `XxxController` | `TodoController` |
| プレゼンター | `XxxPresenter` | `TodoPresenter` |
| インフラリポジトリ | `PrismaXxxRepository` | `PrismaTodoRepository` |
| テスト用リポジトリ | `InMemoryXxxRepository` | `InMemoryTodoRepository` |
