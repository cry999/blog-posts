# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## 概要

[Zenn](https://zenn.dev) の記事・本を管理する GitHub 連携リポジトリ。コンテンツは `zenn-cli` で作成・プレビューする。実態は Markdown コンテンツの集まりで、ビルドやテストは存在しない。

## コマンド

- `npm run new` — 新しい記事を生成（`zenn new:article`）。`articles/` にランダムな slug の Markdown が作られる
- `npm run preview` — ローカルでプレビューサーバを起動（`zenn preview`、http://localhost:8000）
- `npx zenn new:book` — 新しい本を生成
- `npm test` は未設定（プレースホルダで exit 1 する）

## 構成

- `articles/` — 記事 Markdown。1 ファイル 1 記事
- `books/` — 本（チャプター単位の長文コンテンツ）

## 記事の規約

ファイル名は `npm run new` が生成するランダム slug だが、本リポジトリでは `YYYYMMDD-<slug>` 形式（例: `20260517-atcoder-abc458-e-count-123.md`）にリネームして使う。

各記事は frontmatter で始まる:

```yaml
---
title: "記事タイトル"
emoji: "💡"          # サムネに使う絵文字 1 文字
type: "tech"         # "tech" または "idea"
topics:              # タグ
  - "競技プログラミング"
  - "atcoder"
published: true      # 公開するか
published_at: "2026-05-17 03:04"  # 公開日時
---
```

これまでの記事は AtCoder の問題解説（競技プログラミング）が中心で、日本語で書かれている。

## 叩き台と完成品の書き分け

記事の制作段階によって本文の書き方を変える。これは執筆フロー全体（`draft-article` → `refine-article` → `finalize-article`）を貫く方針。

- **叩き台（ドラフト）は箇条書きで書く**。議論・推敲をしやすくするため、各セクションは要点を並べた箇条書き（骨子）で表す。1 項目 1 論点にして、過不足・順序・抜けをユーザーと相談しやすい形にする。この段階では文章として磨き込まない。
- **完成品（公開原稿）は文章にする**。仕上げ段階で、箇条書きの骨子を地の文（流れのある文章）へ書き起こす。ただし並列・列挙・手順など、箇条書きの一覧性が読者にとって有利な箇所は箇条書きのまま残してよい。箇条書きと文章のどちらが適切か判断がつかない箇所は、勝手に書き換えずユーザーに確認する。

つまり「箇条書き＝議論用の叩き台」「文章＝読者に届ける完成品」が基本。仕上げ（`finalize-article`）では、叩き台の箇条書きが文章化されないまま残っていないかを点検する。

## Markdown の記法

Zenn 独自の Markdown 記法（メッセージボックス、アコーディオン、コードブロックのファイル名、図表の埋め込みなど）を使う前に、必ず [Zenn の Markdown 記法ガイド](https://zenn.dev/zenn/articles/markdown-guide) を参照して記法を確認する。記憶や一般的な Markdown の知識だけで書かず、ガイドで実際にサポートされている記法・書式を確かめてから記述すること。

## 数式の記法

数式は [KaTeX 記法](https://zenn.dev/ykyki/articles/math-formulae-in-zenn) で記す。Zenn は markdown-it-texmath パーサで TeX 記法を抽出し、KaTeX でレンダリングする。

- **インライン数式**: `$ ... $`（シングルドル）で囲む。`$` の直後・直前に空白を入れない（例: `$f(x)$` は OK、`$ f(x) $` は NG）
- **ブロック数式**: `$$ ... $$`（ダブルドル）で囲み、前後に**空行**を必ず入れる。`aligned` などの複数行環境も使える
- 使える記号・環境・書体は [KaTeX 公式ドキュメント](https://katex.org/docs/supported.html) のサポート範囲にほぼ準拠する
- **マクロ**: `\def` / `\newcommand` は同一数式内のみ有効。記事全体で使える `\gdef` によるグローバルマクロは Zenn では無効化されているため使わない
