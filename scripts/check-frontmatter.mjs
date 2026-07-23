#!/usr/bin/env node
// frontmatter 検証（finalize-article 工程5）。
// CLAUDE.md の記事規約に沿って、公開に必要な frontmatter が揃っているかを機械チェックする。
//   title / emoji(1文字) / type(tech|idea) / topics(1〜5個) / published(bool) /
//   published_at(形式) と、ファイル名の YYYYMMDD-<slug> 規約。
//
// 使い方: node scripts/check-frontmatter.mjs [file...]
//   引数なしなら articles/*.md を対象にする。
// エラーがあれば終了コード 1。警告は表示のみ（終了コードに影響しない）。

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const TYPES = ["tech", "idea"];
const MAX_TOPICS = 5;
const PUBLISHED_AT_RE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
const FILENAME_RE = /^\d{8}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;

// grapheme（見た目 1 文字）単位で数える。絵文字は複数コードポイントのことがある（⚖️ など）。
const segmenter = new Intl.Segmenter("ja", { granularity: "grapheme" });
const graphemeLength = (s) => [...segmenter.segment(String(s))].length;

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
let warnCount = 0;

for (const file of targets()) {
  const errors = [];
  const warnings = [];

  const raw = fs.readFileSync(file, "utf8");
  let data;
  try {
    ({ data } = matter(raw));
  } catch (e) {
    errors.push(`frontmatter の YAML を解析できません: ${e.message}`);
    data = null;
  }

  if (data) {
    if (Object.keys(data).length === 0) {
      errors.push("frontmatter がありません（--- で囲まれた YAML が必要）");
    }

    // title
    if (typeof data.title !== "string" || data.title.trim() === "") {
      errors.push("title が未設定、または空です");
    }

    // emoji: 見た目 1 文字
    if (data.emoji === undefined || data.emoji === null || data.emoji === "") {
      errors.push("emoji が未設定です");
    } else if (graphemeLength(data.emoji) !== 1) {
      errors.push(`emoji は 1 文字にしてください（現在: "${data.emoji}"）`);
    }

    // type
    if (!TYPES.includes(data.type)) {
      errors.push(`type は ${TYPES.join(" / ")} のいずれかにしてください（現在: ${JSON.stringify(data.type)}）`);
    }

    // topics
    if (!Array.isArray(data.topics)) {
      errors.push("topics が配列ではありません");
    } else {
      if (data.topics.length === 0) errors.push("topics が空です（1 個以上つけてください）");
      if (data.topics.length > MAX_TOPICS) {
        errors.push(`topics は ${MAX_TOPICS} 個までです（現在: ${data.topics.length} 個）`);
      }
      const bad = data.topics.filter((t) => typeof t !== "string" || t.trim() === "");
      if (bad.length > 0) errors.push("topics に空文字または文字列でない要素があります");
    }

    // published
    if (typeof data.published !== "boolean") {
      errors.push(`published は true / false で指定してください（現在: ${JSON.stringify(data.published)}）`);
    }

    // published_at（任意）
    if (data.published_at !== undefined && data.published_at !== null) {
      const v = String(data.published_at);
      if (!PUBLISHED_AT_RE.test(v)) {
        errors.push(`published_at の形式は "YYYY-MM-DD HH:MM" です（現在: "${v}"）`);
      }
    }
  }

  // ファイル名規約（警告）
  const base = path.basename(file);
  if (!FILENAME_RE.test(base)) {
    warnings.push(`ファイル名が YYYYMMDD-<slug>.md 規約と一致しません（現在: ${base}）`);
  }

  if (errors.length > 0 || warnings.length > 0) {
    console.log(file);
    for (const e of errors) console.log(`  ✗ error   ${e}`);
    for (const w of warnings) console.log(`  ⚠ warning ${w}`);
    console.log("");
  }
  errorCount += errors.length;
  warnCount += warnings.length;
}

if (errorCount > 0) {
  console.error(`frontmatter 検証: ${errorCount} 件のエラー（警告 ${warnCount} 件）`);
  process.exit(1);
} else if (warnCount > 0) {
  console.log(`frontmatter 検証: エラーなし（警告 ${warnCount} 件）`);
}
