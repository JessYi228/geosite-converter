// Describe the actual include graph and source contents used by each build.
export function sourceReport(database, files, selectors, revision, report) {
  const names = new Set();
  const tree = [];
  function visit(name, depth = 0, label = name) {
    tree.push(`${"  ".repeat(depth)}${label}${names.has(name) ? " (已列出)" : ""}`);
    if (names.has(name)) return;
    names.add(name);
    const list = database.lists.get(name);
    if (!list) throw new Error(`来源目录不存在：${name}`);
    for (const include of list.includes) {
      const attributes = include.filters.map(filter => `@${filter.negative ? "-" : ""}${filter.attribute}`);
      visit(include.name, depth + 1, [include.name, ...attributes].join(" "));
    }
    for (const donor of [...list.donors].sort()) visit(donor, depth + 1, `${donor} (&${name} 归属来源)`);
  }
  for (const selector of selectors) {
    database.select(selector);
    visit(selector.toLowerCase().replace(/^geosite:/, "").split("@")[0], 0, selector);
  }
  const base = `https://github.com/v2fly/domain-list-community/blob/${revision}/data/`;
  const link = name => Object.hasOwn(files, name) && name !== "local-ai-extra" && revision !== "unknown"
    ? `[\`data/${name}\`](${base}${name})` : `\`${name}\`（本地或虚拟目录）`;
  let markdown = `# AI 合集整合目录\n\n此文件由当前配置和上游快照自动生成，与订阅文件使用相同版本。\n\n`;
  markdown += `- 上游版本：\`${revision}\`\n- 入口：${selectors.map(name => `\`${name}\``).join("、")}\n`;
  markdown += `- Surge：${report.surge} 条；mihomo：${report.mihomo} 条。\n- 来源目录：${names.size} 个（含入口）。\n\n`;
  markdown += `## 递归 include 与归属来源目录\n\n\`\`\`text\n${tree.join("\n")}\n\`\`\`\n\n`;
  markdown += "## 目录与规则数\n\n统计为各来源目录自身的未筛选内容，不可简单相加；最终合并会筛选属性并去重。\n\n";
  markdown += "| 来源目录 | 直接规则 | 递归展开规则 |\n| --- | ---: | ---: |\n";
  for (const name of names) {
    markdown += `| ${link(name)} | ${database.lists.get(name).entries.size} | ${database.resolve(name).size} |\n`;
  }
  markdown += "\n## Surge 跳过的正则\n\n";
  markdown += report.surgeUnsupportedRegexp.length
    ? "```text\n" + report.surgeUnsupportedRegexp.join("\n") + "\n```\n"
    : "无。\n";
  markdown += "\n## 各目录完整原始内容\n\n保留上游注释、属性和 include，便于逐条核对。以下是来源内容，不是可直接导入客户端的规则文件。\n";
  for (const name of names) {
    markdown += `\n### ${name}\n\n${link(name)}\n\n`;
    markdown += Object.hasOwn(files, name)
      ? "```text\n" + files[name].trimEnd() + "\n```\n"
      : "此目录由 `&list` 归属生成，无独立源文件；解析后规则见下：\n\n```text\n" +
        [...database.lists.get(name).entries.values()].map(entry => `${entry.kind}:${entry.value} ${entry.attrs.map(attr => `@${attr}`).join(" ")}`.trim()).join("\n") + "\n```\n";
  }
  return { names: [...names], markdown };
}
