import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { Database, convert, validateName } from "../web/rules.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const repository = "https://github.com/v2fly/domain-list-community.git";
const { values } = parseArgs({ options: {
  source: { type: "string" }, output: { type: "string", default: "dist" },
  config: { type: "string", default: join(root, "ai.config.json") }
} });
const output = resolve(values.output);
const temporary = mkdtempSync(join(tmpdir(), "geosite-upstream-"));
let staging;
try {
  let source = values.source;
  if (!source) {
    execFileSync("git", ["clone", "--depth", "1", "--branch", "master", repository, join(temporary, "upstream")], { stdio: "inherit" });
    source = join(temporary, "upstream/data");
  }
  source = resolve(source);
  const files = Object.create(null);
  for (const entry of readdirSync(source, { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : 1)) {
    if (!entry.isFile()) throw new Error(`规则源必须是普通文件：${entry.name}`);
    validateName(entry.name);
    files[entry.name] = readFileSync(join(source, entry.name), "utf8");
  }
  const config = JSON.parse(readFileSync(values.config, "utf8"));
  validateName(config.name);
  if (!Array.isArray(config.lists) || !config.lists.length || config.lists.some(value => typeof value !== "string")) {
    throw new Error("ai.config.json 的 lists 必须是非空字符串数组");
  }
  if (!Array.isArray(config.extraRules) || config.extraRules.some(value => typeof value !== "string" || /[\r\n]/.test(value))) {
    throw new Error("extraRules 必须是逐行规则字符串数组");
  }
  const selectors = [...config.lists];
  if (config.extraRules.length) {
    if (Object.hasOwn(files, "local-ai-extra")) throw new Error("上游与本地补充列表重名");
    files["local-ai-extra"] = config.extraRules.join("\n");
    selectors.push("local-ai-extra");
  }
  const database = new Database(files);
  // Check the complete snapshot once, but do not generate rule sets for other lists.
  for (const name of database.lists.keys()) database.resolve(name);
  const result = convert(database, selectors, config.name);
  let revision = "unknown";
  if (existsSync(join(dirname(source), ".git"))) {
    revision = execFileSync("git", ["-C", dirname(source), "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  }
  if (process.env.UPSTREAM_REVISION && revision !== process.env.UPSTREAM_REVISION) {
    throw new Error("上游版本与检查版本不同，拒绝发布；请重新运行工作流");
  }
  if (existsSync(output)) {
    const marker = join(output, "manifest.json");
    if (!existsSync(marker) || JSON.parse(readFileSync(marker, "utf8")).converter !== "geosite-converter/v1") {
      throw new Error(`拒绝覆盖非本工程的输出目录：${output}`);
    }
  }
  mkdirSync(dirname(output), { recursive: true });
  staging = mkdtempSync(join(dirname(output), ".geosite-build-"));
  const stage = join(staging, "site");
  cpSync(join(root, "web"), stage, { recursive: true });
  const generated = {
    [`surge/${config.name}.list`]: result.surge,
    [`mihomo/${config.name}.yaml`]: result.mihomo,
    "source.json": JSON.stringify({ revision, files }) + "\n"
  };
  const hashes = {};
  for (const [filename, content] of Object.entries(generated)) {
    mkdirSync(dirname(join(stage, filename)), { recursive: true });
    writeFileSync(join(stage, filename), content);
    hashes[filename] = createHash("sha256").update(content).digest("hex");
  }
  const manifest = {
    converter: "geosite-converter/v1", projectRevision: process.env.GITHUB_SHA || "local",
    upstream: { repository, revision },
    ai: { name: config.name, ...result.report }, sourceLists: database.lists.size, sha256: hashes
  };
  writeFileSync(join(stage, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  writeFileSync(join(stage, ".nojekyll"), "");
  for (const name of ["LICENSE", "NOTICE"]) cpSync(join(root, name), join(stage, name));
  const backup = join(staging, "previous");
  if (existsSync(output)) renameSync(output, backup);
  try {
    renameSync(stage, output);
  } catch (error) {
    if (existsSync(backup)) renameSync(backup, output);
    throw error;
  }
  console.log(`AI: Surge ${result.report.surge} 条 / mihomo ${result.report.mihomo} 条；原始分类 ${database.lists.size} 个`);
  if (result.report.surgeUnsupportedRegexp.length) console.warn(`Surge 跳过 ${result.report.surgeUnsupportedRegexp.length} 条正则，详见 manifest.json`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    const { appendFileSync } = await import("node:fs");
    appendFileSync(process.env.GITHUB_STEP_SUMMARY,
      `Upstream: \`${revision}\`\n\nAI: Surge **${result.report.surge}** / mihomo **${result.report.mihomo}** rules.\n\nSurge omits **${result.report.surgeUnsupportedRegexp.length}** regexp rules; see manifest.json.\n`);
  }
} finally {
  rmSync(temporary, { recursive: true, force: true });
  if (staging) rmSync(staging, { recursive: true, force: true });
}
