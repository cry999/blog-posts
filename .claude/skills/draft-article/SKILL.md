---
name: draft-article
description: Zenn ブログ記事の叩き台（ドラフト）を作成する。ユーザーが「記事の下書きを作りたい」「ブログのネタを記事にしたい」「叩き台を作って」などと言ったときに使う。題材と要点をヒアリングし、frontmatter 付きの Markdown を articles/ に生成する。記事に図解が要る場合は drawio で図の叩き台（.drawio とエクスポート画像）も作る。
---

# Zenn ブログ記事の叩き台作成

このリポジトリの規約（CLAUDE.md 参照）に沿って、Zenn 記事の叩き台 Markdown を `articles/` に生成する。
あくまで「叩き台」であり、完璧な完成原稿ではない。ユーザーが後から加筆・修正しやすい骨組みを作ることが目的。

## 工程

以下を順に行う。ヒアリング（工程 1〜3）は可能なら `AskUserQuestion` ツールでまとめて尋ねると速い。ただし題材と要点は自由記述になりやすいので、対話で聞き出してもよい。

### 1. 題材について尋ねる（必須）

何についての記事かを尋ねる。例: 「AtCoder ABC458 E の解説」「Go の context の使い方」など。
題材が曖昧なら、対象読者や記事の狙い（何を伝えたいか）まで踏み込んで具体化する。

### 2. 盛り込みたい要点を 3 つ尋ねる（必須）

記事で必ず伝えたいポイントを 3 つ挙げてもらう。
ユーザーが 3 つ思いつかない場合は、題材から候補を提案して一緒に決める。この 3 点が記事の見出し（セクション）の骨格になる。

### 3. メタ情報を確認する

frontmatter を埋めるために以下を確認する。ユーザーが特にこだわらなければ、題材から妥当な値をこちらで提案して進める。

- **type**: `tech`（技術記事）か `idea`（アイデア・ポエム）か。技術解説なら `tech`。
- **topics**: タグ（複数）。題材から推測して提案する。例: 競プロ記事なら `["競技プログラミング", "atcoder", "アルゴリズム"]`。
- **emoji**: サムネ用の絵文字 1 文字。題材に合うものを提案する。
- **title**: 題材を踏まえたタイトル案を提案する。

### 4. アウトライン（見出し構成）を決める

`create-outline` スキルで既にアウトラインを作っている場合は、それをそのまま使う。
まだ無ければ、ここでアウトラインテンプレートを使って組み立てる。

`.claude/article-templates/` にテーマごとのテンプレート（1 テーマ 1 ファイル）があるので、まずそれを読んで候補とする。各ファイルの frontmatter の `theme` / `aliases` / `description` を見て、題材に合うものを選ぶ。ユーザーが特にこだわらなければ、題材から妥当なテンプレートをこちらで判断して進める。

選んだテンプレートの見出し構成をベースに、要点 3 つを軸にセクション構成を組み立て、ユーザーに提示して合意を取る。合うテンプレートが無ければその場で簡易に構成を組んでよい。よく使う系統なのにテンプレートが無い場合は、`manage-outline-templates` スキルで新規テンプレート化することを提案する。

参考として、初期テンプレートには以下がある（実体は `.claude/article-templates/` を参照）:

- **技術解説・競プロ系**（`tech-competitive`）: 問題概要 / 考察・アプローチ / 実装 / 計算量・補足 / まとめ
- **ノウハウ・チュートリアル系**（`howto-tutorial`）: 背景・課題 / 結論（先に要点） / 詳細解説 / 注意点 / まとめ
- **アイデア・考察系**（`idea-essay`）: 問題提起 / 主張 / 反論への応答 / まとめ

### 5. ドラフトを生成する

ファイルは手書きで新規作成せず、`npm run new`（`zenn new:article`）で生成してから中身を書き換える。リポジトリの作法に合わせるため。

1. **`npm run new` を実行する**。`articles/` にランダム slug の Markdown が 1 つ作られる。出力に出る生成パス（`articles/xxxxxxxx.md`）を控える。
2. **規約のファイル名にリネームする**。`articles/YYYYMMDD-<slug>.md` 形式（例: `articles/20260618-atcoder-abc458-e-count-123.md`）。日付は今日（`YYYYMMDD`）、slug は題材を表す英小文字＋ハイフン。`git mv` ではなく通常の `mv` でよい（未追跡ファイルのため）。同名ファイルが既にあれば slug を調整する。
3. **生成ファイルの中身を書き換える**。`npm run new` が入れた雛形 frontmatter を、工程 3 で確定したメタ情報で置き換え、本文を骨子で埋める。
   - frontmatter は `published: false` にする（叩き台なので未公開）。`published_at` は確定するまで入れない。
   - 各セクションは見出し＋「ここに何を書くか」のガイドコメントや箇条書きの骨子で埋める。工程 4 で選んだテンプレートの各セクションの要点メモを骨子のたたき台として流用してよい。要点 3 つは確実に反映する。本文は書きすぎず、ユーザーが肉付けする余地を残す。
   - 全文日本語で書く。

frontmatter の例:

```yaml
---
title: "（提案したタイトル）"
emoji: "💡"
type: "tech"
topics:
  - "競技プログラミング"
  - "atcoder"
published: false
---
```

### 6. 図解が要る場合は drawio で図の叩き台を作る

記事に図があると分かりやすい箇所（アルゴリズムの流れ、データ構造、システム構成、状態遷移、比較表など）があれば、drawio 形式で図の叩き台を作る。図も本文と同じく「叩き台」なので、ユーザーが drawio で開いて自由に編集できる骨組みでよい。不要なら本工程はスキップする。

1. **図が要るか確認する**。題材・アウトラインから図が効きそうな箇所を提案し、ユーザーに作るか尋ねる。こだわりがなければ、図解が明確に有効な 1〜2 箇所に絞って提案する。
2. **`.drawio` ファイルを作る**。記事 slug ごとに `images/<記事 slug>/` ディレクトリを作り、その中に `<図名>.drawio` を置く（例: `images/20260618-atcoder-abc458-e-count-123/approach.drawio`）。Zenn は GitHub 連携で `/images` 配下を画像として扱うため、ここに置くと記事から参照できる。
   - `.drawio` は drawio（diagrams.net）の XML 形式。Claude が直接テキストとして生成できる。下の雛形をベースに、ノード・矢印・ラベルで叩き台の図を組む。凝りすぎず、要素の配置と関係が分かる最小限にとどめる。
   - 図の内容が不確か（具体的な数値・遷移など）な場合は、その旨をラベルに「要確認」と入れて断定しない。
3. **画像にエクスポートする**。`.drawio` のままでは記事に表示できないので PNG か SVG に書き出す。
   - drawio CLI（drawio desktop の `drawio` コマンド）が使えるなら実行する: `drawio --export --format png --output images/<slug>/approach.png images/<slug>/approach.drawio`。`drawio` が PATH に無ければ無理に探さない。
   - CLI が無い／失敗する場合は、ユーザーに「drawio（VS Code 拡張または desktop app）で `.drawio` を開き、PNG/SVG として同じディレクトリに書き出してほしい」と案内する。エクスポート画像のパス（例: `images/<slug>/approach.png`）を本文側で先に確定しておく。
4. **本文に画像参照を挿入する**。図を入れたいセクションに Markdown の画像記法を入れる: `![図の説明](/images/<記事 slug>/approach.png)`。Zenn 連携ではルートからの絶対パス（`/images/...`）で参照する。

drawio XML の最小雛形（2 ノードと矢印）:

```xml
<mxfile host="app.diagrams.net">
  <diagram name="figure" id="figure-1">
    <mxGraphModel dx="640" dy="480" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="n1" value="入力" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="120" y="120" width="120" height="60" as="geometry" />
        </mxCell>
        <mxCell id="n2" value="処理" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="320" y="120" width="120" height="60" as="geometry" />
        </mxCell>
        <mxCell id="e1" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" parent="1" source="n1" target="n2">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

### 7. 次のアクションを案内する

生成したファイルパス（記事 Markdown と、作った場合は `.drawio` / 画像）を伝える。`npm run preview` でローカル確認できること、図はまだエクスポートが必要なら drawio で書き出す手順、公開時は `published: true` にして `published_at` を設定することを案内する。

## 注意

- 既存記事を上書きしないこと。同名ファイルがあれば slug を調整する。
- 不確かな技術的事実（計算量・API 仕様など）は断定せず、「要確認」と明記して骨子に残す。叩き台の段階で誤った内容を書き込まない。
- 図も叩き台。作り込みすぎず、ユーザーが drawio で編集する前提の骨組みにとどめる。`.drawio` は必ず `images/<記事 slug>/` 配下に置き、本文からは `/images/...` の絶対パスで参照する。
