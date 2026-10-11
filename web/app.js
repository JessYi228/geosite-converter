import { Database, convert } from "./rules.js";

const $ = id => document.getElementById(id);
let manifest;
let databasePromise;
let result;
let filename;
let generation = 0;

async function fetchJSON(path) {
  const response = await fetch(path, { cache: "no-cache" });
  if (!response.ok) throw new Error(`读取 ${path} 失败（HTTP ${response.status}）`);
  return response.json();
}

const manifestPromise = fetchJSON("manifest.json").then(value => {
  manifest = value;
  const revision = manifest.upstream.revision;
  $("version").textContent = `上游版本 ${revision.slice(0, 12)} · ${manifest.sourceLists} 个原始分类 · 转换在浏览器完成`;
  $("ai-sources").textContent = `合并来源：${manifest.ai.selectors.join(" + ")}。本仓库默认只订阅海外 AI 分类，不合并 category-ai-cn；具体域名以来源目录和当前版本为准。`;
  const surgeURL = new URL(`surge/${manifest.ai.name}.list`, location.href).href;
  const mihomoURL = new URL(`mihomo/${manifest.ai.name}.yaml`, location.href).href;
  $("surge-url").value = surgeURL;
  $("mihomo-url").value = mihomoURL;
  $("surge-link").href = surgeURL;
  $("mihomo-link").href = mihomoURL;
  $("surge-example").textContent = `[Rule]\nRULE-SET,${surgeURL},Proxy`;
  $("mihomo-example").textContent = `rule-providers:\n  ai:\n    type: http\n    behavior: classical\n    format: yaml\n    url: ${JSON.stringify(mihomoURL)}\n    path: ./rules/ai.yaml\n    interval: 86400\n\nrules:\n  - RULE-SET,ai,Proxy`;
  const skipped = manifest.ai.surgeUnsupportedRegexp;
  $("ai-warning").textContent = skipped.length ? `AI 合集：Surge 已跳过 ${skipped.length} 条不支持的正则；mihomo 保留。详见转换报告。` : "";
  return manifest;
});
manifestPromise.catch(error => { $("version").textContent = error.message; });

async function database() {
  if (!databasePromise) {
    databasePromise = (async () => {
      await manifestPromise;
      const snapshot = await fetchJSON(`source.json?revision=${encodeURIComponent(manifest.upstream.revision)}`);
      if (snapshot.revision !== manifest.upstream.revision) throw new Error("站点正在更新，请刷新后重试");
      const value = new Database(snapshot.files);
      for (const name of [...value.lists.keys()].sort()) {
        const option = document.createElement("option");
        option.value = name;
        $("catalog").append(option);
      }
      return value;
    })().catch(error => {
      databasePromise = undefined;
      throw error;
    });
  }
  return databasePromise;
}

function resetResult() {
  generation++;
  result = undefined;
  $("result").hidden = true;
}
$("selectors").addEventListener("input", resetResult);
$("filename").addEventListener("input", resetResult);

$("load-catalog").addEventListener("click", async () => {
  const button = $("load-catalog");
  button.disabled = true;
  $("status").textContent = "正在载入原始规则快照…";
  try {
    const value = await database();
    $("status").textContent = `已载入 ${value.lists.size} 个分类，可在查找框输入关键词。`;
    button.textContent = "目录已载入";
  } catch (error) {
    $("status").textContent = error.message;
    button.disabled = false;
  }
});

$("add-category").addEventListener("click", () => {
  const value = $("category").value.trim();
  if (!value) return;
  $("selectors").value = [$("selectors").value.trim(), value].filter(Boolean).join("\n");
  $("category").value = "";
  resetResult();
});

$("convert-form").addEventListener("submit", async event => {
  event.preventDefault();
  resetResult();
  const currentGeneration = generation;
  const selectors = $("selectors").value.split(/[\s,，]+/).filter(Boolean);
  const outputName = $("filename").value.trim();
  $("convert-button").disabled = true;
  $("status").textContent = "正在载入并转换规则…";
  try {
    const value = await database();
    if (currentGeneration !== generation) {
      $("status").textContent = "输入已修改，请重新转换。";
      return;
    }
    result = convert(value, selectors, outputName);
    filename = outputName;
    $("surge-preview").value = result.surge;
    $("mihomo-preview").value = result.mihomo;
    $("warning").textContent = result.report.surgeUnsupportedRegexp.length
      ? `Surge 跳过 ${result.report.surgeUnsupportedRegexp.length} 条正则，无法做到完全等价。具体表达式在下载的转换报告中；mihomo 已保留。` : "";
    $("status").textContent = `转换完成：Surge ${result.report.surge} 条，mihomo ${result.report.mihomo} 条。`;
    $("result").hidden = false;
  } catch (error) {
    $("status").textContent = `转换失败：${error.message}`;
  } finally {
    $("convert-button").disabled = false;
  }
});

function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
$("download-surge").addEventListener("click", () => {
  if (result) download(`${filename}.list`, result.surge, "text/plain;charset=utf-8");
});
$("download-mihomo").addEventListener("click", () => {
  if (result) download(`${filename}.yaml`, result.mihomo, "text/yaml;charset=utf-8");
});
$("download-report").addEventListener("click", () => {
  if (result) download(`${filename}.report.json`, JSON.stringify({ upstream: manifest.upstream, ...result.report }, null, 2) + "\n", "application/json");
});
for (const button of document.querySelectorAll("[data-copy]")) {
  button.addEventListener("click", async () => {
    const input = $(button.dataset.copy);
    try {
      await navigator.clipboard.writeText(input.value);
      $("status").textContent = "链接已复制。";
    } catch {
      input.focus();
      input.select();
      $("status").textContent = "请手动复制选中的链接。";
    }
  });
}
