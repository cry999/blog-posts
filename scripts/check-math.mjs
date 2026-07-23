#!/usr/bin/env node
// 数式（KaTeX）まわりの機械チェック（finalize-article 工程6 チェックリスト）。
//   1. \text{…} 内の生アンダースコア: KaTeX では \text{} 内の `_` は下付き扱いで
//      崩れる/エラーになるため `\_` へのエスケープが必要。
//   2. ブロック数式 $$…$$ の前後空行: CLAUDE.md「数式の記法」の通り、$$ の前後には
//      空行が必要（無いとレンダリングされないことがある）。
//
// コードフェンス（``` / ~~~）内は数式ではないので対象外にする。
//
// 使い方: node scripts/check-math.mjs [file...]
//   引数なしなら articles/*.md を対象にする。エラーがあれば終了コード 1。

import fs from "node:fs";
import path from "node:path";

// \text, \textbf, \textrm... など text 系コマンドの { } 内を拾う
const TEXT_CMD_RE = /\\text[a-z]*\s*\{([^}]*)\}/gi;
// エスケープされていない（直前が \ でない）アンダースコア
const RAW_UNDERSCORE_RE = /(^|[^\\])_/;

function targets() {
  const args = process.argv.slice(2);
  if (args.length > 0) return args;
  const dir = "articles";
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(dir, f));
}

let errorCount = 0;

for (const file of targets()) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  const errors = [];

  let inFence = false; // ``` / ~~~ コードブロック内か
  let inBlockMath = false; // $$ … $$ の内側か
  let mathOpenLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // コードフェンスのトグル
    if (/^(```|~~~)/.test(trimmed)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    // ブロック数式デリミタ（$$ 単独行）のトグルと前後空行チェック
    if (trimmed === "$$") {
      if (!inBlockMath) {
        // 開き $$: 直前行が空行であること（先頭行の場合は免除）
        const prev = i > 0 ? lines[i - 1].trim() : "";
        if (i > 0 && prev !== "") {
          errors.push(`${i + 1}: ブロック数式 $$ の前に空行がありません`);
        }
        inBlockMath = true;
        mathOpenLine = i + 1;
      } else {
        // 閉じ $$: 直後行が空行であること（最終行の場合は免除）
        const next = i + 1 < lines.length ? lines[i + 1].trim() : "";
        if (i + 1 < lines.length && next !== "") {
          errors.push(`${i + 1}: ブロック数式 $$ の後に空行がありません`);
        }
        inBlockMath = false;
      }
      continue;
    }

    // \text{…} 内の生アンダースコア（インライン/ブロックどちらの数式でも）
    let m;
    TEXT_CMD_RE.lastIndex = 0;
    while ((m = TEXT_CMD_RE.exec(line)) !== null) {
      if (RAW_UNDERSCORE_RE.test(m[1])) {
        errors.push(`${i + 1}: \\text{…} 内の生アンダースコアは \\_ にエスケープしてください: "${m[0]}"`);
      }
    }
  }

  if (inBlockMath) {
    errors.push(`${mathOpenLine}: ブロック数式 $$ が閉じられていません`);
  }

  if (errors.length > 0) {
    console.log(file);
    for (const e of errors) console.log(`  ✗ ${e}`);
    console.log("");
  }
  errorCount += errors.length;
}

if (errorCount > 0) {
  console.error(`数式チェック: ${errorCount} 件のエラー`);
  process.exit(1);
}
