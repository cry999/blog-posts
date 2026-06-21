---
name: publish-article
description: 仕上げ済みの Zenn 記事を git で公開（main へ push）する。ユーザーが「記事を公開して」「リリースして」「push して公開して」「これを出して」などと言ったときに使う。対象記事と画像を add → commit（publish: タイトル）→ push origin main を実行する。push は外向きで取り消しにくい操作なので、実行前に必ずユーザーの明示的な許可を取る。
---

# Zenn ブログ記事の公開（git push）

仕上げ済みの記事を Zenn に公開する。実体は、対象記事（と画像）を commit して main へ push すること。GitHub 連携により、`published: true` の記事が push されると Zenn 側に反映される。

```
git add articles/<記事>.md images/<記事>/
git commit -m 'publish: <タイトル>'
git push origin main
```

**重要**: push は外部（公開 Web）に出る、実質取り消しにくい操作。工程 3 でユーザーの明示的な許可を得るまで commit / push を実行しない。

公開前の最終チェック（整合性・誤字・主題の一貫性など）は `finalize-article` の役割。本スキルは「仕上げ済み」が前提の公開実行に特化する。未仕上げなら先に `finalize-article` を案内する。

## 工程

### 1. 対象記事を特定し、公開可能かを確認する

- 対象記事を決める。ユーザー指定があればそれを使う。無ければ `articles/` を一覧して選んでもらう。
- 記事を読み、frontmatter から **title** と、ファイルの **slug**（`articles/<slug>.md` の `<slug>`）を把握する。
- **公開ゲート（ここを通らなければ push しない）**:
  - **`published: true` か確認する**。`false` のままだと push しても Zenn に公開されない。`false` なら、(a) `finalize-article` で仕上げる、(b) この場で `published: true` にする、のどちらにするかをユーザーに確認する。**許可なく勝手に `true` にしない**。
  - **やり残しの確認**: 本文に `TODO` / `要確認` / `（ここに〜）` などのプレースホルダが残っていないか軽く確認する。残っていれば「仕上げが未完かもしれない」と知らせ、`finalize-article` を勧める。公開を続けるかはユーザーが判断する。
  - **ブランチ確認**: `git rev-parse --abbrev-ref HEAD` が `main` か確認する。違う場合はその旨を伝え、どうするか確認する（このリポジトリは main 運用）。

### 2. コミット対象を確定する

- **add するパスを決める**:
  - 記事本体: `articles/<slug>.md`
  - 画像: `images/<slug>/` が存在すれば含める（無ければ記事のみ）。drawio 図がある場合、参照している PNG/SVG が `images/<slug>/` に揃っているかも確認する。
  - **対象記事に関係ないファイルは巻き込まない**。`git add -A` や `git add .` は使わず、上記の明示パスだけを add する。
- **コミットメッセージ**: `publish: <title>`（`<title>` は frontmatter の title）。title に `'` 等が含まれる場合はクオートを適切に処理する。
- **状況把握**: `git status` で、対象以外に未コミットの変更があるか確認し、あればユーザーに知らせる（今回の commit には含めない）。リモートに未取得の変更があり push が失敗しそうなら、それも見越しておく。

### 3. 最終確認を取る（必須）

実行前に、次をまとめて提示し、公開してよいかを明確に尋ねる（`AskUserQuestion` を使ってもよい）:

- 公開する記事（タイトルとファイルパス）
- add するパス（記事＋画像）
- コミットメッセージ（`publish: <title>`）
- push 先（`origin main`）と、**push すると Zenn に公開される**こと

ユーザーの明示的な「公開してよい」が出るまで工程 4 に進まない。

### 4. 公開を実行する

許可が出たら、順に実行する。各ステップの結果を確認し、失敗したら止めて報告する。

1. `git add articles/<slug>.md images/<slug>/`（画像ディレクトリが無ければ記事のみ）
2. `git commit -m 'publish: <title>'`
   - コミットメッセージ末尾に環境規約のトレーラーを付ける:
     `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
3. `git push origin main`

**失敗時の扱い**: push がリモート先行（non-fast-forward）等で失敗したら、無理に `--force` などで押し通さない。状況（`git status` / エラー内容）を伝え、pull／rebase するか等の判断をユーザーに仰ぐ。

### 5. 結果を報告する

- commit のハッシュと、push が成功した旨を伝える。
- GitHub 連携により Zenn 側に反映される旨を案内する（反映には少し時間がかかることがある）。記事の slug を伝え、Zenn 上の記事 URL は連携アカウント側で確認できることを補足する。
- もし `published_at` を未来日時にした予約公開なら、その日時に公開される旨を伝える。

## 注意

- push は外向き・取り消しにくい操作。工程 3 の明示的な許可なしに commit / push しない。
- `published: false` のまま公開しない（push しても公開されず無意味）。`true` への変更はユーザーの合意のうえで。
- add は対象記事と画像の明示パスのみ。`git add -A` / `git add .` で無関係な変更を巻き込まない。
- push が失敗したら force で押し通さず、状況を報告してユーザーの判断を仰ぐ。
- 仕上げが未完（プレースホルダ残り等）の兆候があれば公開を止めて知らせ、`finalize-article` を勧める。
