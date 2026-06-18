# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
