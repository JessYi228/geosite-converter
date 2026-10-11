# Geosite Converter

[![自动更新](https://github.com/JessYi228/geosite-converter/actions/workflows/update.yml/badge.svg)](https://github.com/JessYi228/geosite-converter/actions/workflows/update.yml)

**只自动更新 AI 合集，其他分类在静态网站中按需转换。**

**[打开转换站](https://jessyi228.github.io/geosite-converter/)** · [Surge AI 订阅](https://jessyi228.github.io/geosite-converter/surge/ai.list) · [mihomo AI 订阅](https://jessyi228.github.io/geosite-converter/mihomo/ai.yaml) · [版本与转换报告](https://jessyi228.github.io/geosite-converter/manifest.json)

上游：[v2fly/domain-list-community](https://github.com/v2fly/domain-list-community)。

- **AI 自动订阅**：合并上游国内、海外 AI 分类，输出 Surge Rule Set 和 mihomo `classical` YAML。
- **按需转换站**：浏览器选择一个或多个分类、合并去重、下载，无后端、无需登录。
- **低开销更新**：每天检查一次上游 commit；上游与工程版本均未变化时跳过测试、构建和部署。
- **无第三方运行依赖**：构建需要 Node.js 22+，但不需要 `npm install`；网页不依赖 CDN、第三方脚本或 Python 运行时。

## 如何使用

| 需求 | 使用方式 | 是否自动更新 |
| --- | --- | --- |
| AI 服务统一分流 | 在 Surge / mihomo 中订阅下方的 AI 合集地址 | 是，按定时检查结果更新 |
| 其他服务按需分流 | 打开转换站，选择分类、筛选属性、合并后下载 | 否，需要回到页面重新转换 |
| 修改 AI 收录范围 | 编辑 `ai.config.json` 并提交 | 是，提交会触发重新发布 |

**AI 合集默认包含国内和海外服务，不代表全部服务都应该走代理。** 仅代理海外 AI 时，将配置中的 `lists` 改为 `["category-ai-!cn"]`。

> 兼容性：Surge 无法等价表达任意域名正则，转换时会明确跳过并报告；mihomo 输出使用 `classical`，保留 `DOMAIN-REGEX`。两种格式均不绑定策略组。

## 1. 本仓库与 Fork 部署

本仓库：[JessYi228/geosite-converter](https://github.com/JessYi228/geosite-converter)。转换站：[https://jessyi228.github.io/geosite-converter/](https://jessyi228.github.io/geosite-converter/)。本仓库由 GitHub Actions 自动更新，使用者可以直接使用下方订阅地址，无需自行部署。

如需自行维护 AI 收录范围，建议 Fork 到自己的**公开仓库**，再按以下步骤启用部署：

1. 将本工程推送到仓库的 `main`（或 `master`）分支。
2. 打开 **Settings → Pages → Build and deployment → Source → GitHub Actions**。
3. 确认仓库允许运行 Actions，且仓库/组织策略允许工作流的 `contents: write`、Pages 部署权限。
4. 打开 **Actions → Update AI rules and converter site → Run workflow**，手动运行一次。
5. 成功后，通过 Settings → Pages 中显示的地址访问站点。Fork 后须使用自己站点的订阅地址；页面会自动生成正确链接。自定义域名请按 GitHub Pages 的标准配置方式设置。

工程自身不包含 GitHub 账号或令牌；常规部署使用内置 `GITHUB_TOKEN`，不需要配置 PAT。初次上传工程时，需要在本机完成 GitHub CLI 登录或配置 Git 推送权限；不要将密码、PAT 或登录凭据写入工程或提交到仓库。

### AI 订阅地址

| 客户端 | Pages 地址 |
| --- | --- |
| Surge | `https://jessyi228.github.io/geosite-converter/surge/ai.list` |
| mihomo | `https://jessyi228.github.io/geosite-converter/mihomo/ai.yaml` |

工作流同时维护 `rules` 分支，提供 Raw 备用地址：

```text
https://raw.githubusercontent.com/JessYi228/geosite-converter/rules/surge/ai.list
https://raw.githubusercontent.com/JessYi228/geosite-converter/rules/mihomo/ai.yaml
```

`main` 保存工程源码，`rules` 只保存 AI 成品、静态页面和原始规则快照。提交由机器人完成，不会反过来触发构建。使用官方 Pages 部署，而不是依赖机器人推送分支触发 Pages 自动构建。

## 2. AI 合集范围

默认配置在 [`ai.config.json`](ai.config.json)：

```json
{
  "name": "ai",
  "lists": ["category-ai-!cn", "category-ai-cn"],
  "extraRules": []
}
```

这两个分类由上游维护，覆盖 OpenAI、Anthropic、Gemini/DeepMind、Copilot、Cursor、Perplexity、DeepSeek、通义、豆包等相关服务。具体内容以记录的上游版本为准，工程不另行维护一份厂商清单，也不强行加入整个 Google、Microsoft 等大类。

**国内、海外服务默认在同一个 AI 合集中；这并不意味着它们都应该走代理。** 如果主要用于海外 AI 代理，只保留：

```json
"lists": ["category-ai-!cn"]
```

也可添加其他分类或筛选项，如 `openai`、`google@cn@-ads`。需要补充上游尚未收录的域名时，使用 `extraRules`，每个字符串是一条规则：

```json
"extraRules": ["example.ai", "full:api.example.ai"]
```

修改配置并提交后即触发构建；分类变更随上游跟进。合并按规则类型和内容精确去重，不在属性筛选之前裁剪子域名。

## 3. 客户端配置

页面会根据自身地址生成可直接复制的示例。将 `Proxy` 替换为你的已有策略组，AI 规则放在通用分流规则前。

### Surge

```ini
[Rule]
RULE-SET,https://jessyi228.github.io/geosite-converter/surge/ai.list,Proxy
```

订阅更新周期按 Surge 的规则集更新机制或手动更新操作生效；不在规则文件中绑定策略。

### mihomo

```yaml
rule-providers:
  ai:
    type: http
    behavior: classical
    format: yaml
    url: "https://jessyi228.github.io/geosite-converter/mihomo/ai.yaml"
    path: ./rules/ai.yaml
    interval: 86400

rules:
  - RULE-SET,ai,Proxy
```

使用支持 `DOMAIN-REGEX` 的 mihomo 版本。不要将该文件配置为 `behavior: domain`，也不要作为完整客户端配置导入。

## 4. 按需转换站

1. 打开页面，点击“载入分类目录”或直接输入分类名。
2. 多个分类按行输入，或使用逗号分隔；可通过查找框添加分类。
3. 点击“转换并生成下载”，分别下载 Surge `.list`、mihomo `.yaml` 和转换报告。

示例：

```text
openai
anthropic
github-copilot
```

支持属性筛选：

- `google@cn`：有 `@cn` 属性。
- `google@-cn`：没有 `@cn` 属性。
- `google@cn@-ads`：有 `@cn` 且没有 `@ads`。
- `google@!cn`：匹配上游名为 `!cn` 的属性，**不是** `@cn` 的逻辑取反。
- 接受 `geosite:google@cn` 形式。

页面第一次需要转换时才加载约 1 MB 的原始规则快照，不预生成其他分类成品。快照保留原始 `include`、属性和归属信息，由与 AI 合集相同的上游版本产生。浏览器不调用 GitHub API、不上传用户选择，不消耗 Actions runner 时间。

**按需下载的是本地文件，不是持久化的自动更新订阅**；要更新，回到页面重新转换。只有 AI 合集默认提供自动更新链接。页面版本通常在每日检查后更新，不是上游每次提交立即同步。

## 5. GitHub 免费额度与更新策略

- GitHub **公开仓库的标准托管 runner** 通常不计入私有仓库的月度 Actions 分钟配额；私有仓库、特殊/大规格 runner 按账号方案和 GitHub 当前计费政策执行。
- 默认 UTC `02:17`（北京时间 `10:17`）每日检查一次，而不是高频轮询。调度可能被 GitHub 延迟。
- 未变化：只运行轻量版本检查，不拉取上游源码、不构建、不部署。
- 有变化：测试后仅转换 AI，生成页面和原始规则快照，再部署 Pages；不发布全量 Surge/mihomo 文件。
- 官方 Pages 部署需要上传一个小型部署包，显式保留 **1 天**；不额外上传规则制品，不创建每日 Release，也不安装依赖。
- 页面转换次数不触发工作流。站点访问仍受 GitHub Pages 自身带宽/使用限制约束；不是无限额承诺。
- Pages 失败时不记录发布成功，下一次检查会重试。Raw 分支发布失败时也会重试。

更省额度可将 `.github/workflows/update.yml` 的 schedule 改为每周：

```yaml
schedule:
  - cron: '17 2 * * 1'
```

或删除 `schedule`，只在手动运行与工程变更时更新。Fork 后需要确认 Actions/定时任务已启用；公开仓库长期无活动时，GitHub 可能禁用 schedule，需要手动重新启用。私有仓库能否使用 Pages 取决于账号方案。

## 6. 本地运行

```bash
git clone https://github.com/JessYi228/geosite-converter.git
cd geosite-converter
npm test
npm run build                         # 临时克隆上游 master，完成后删除临时源码
# 或使用已有的上游源码，无须联网
npm run build -- --source /path/to/domain-list-community/data

# 预览静态站；需 HTTP 服务，不要直接以 file:// 打开 HTML
python3 -m http.server 8000 --directory dist
```

访问 `http://localhost:8000/`。Python 仅用于示例静态服务，不是工程或部署依赖。也可以使用任何其他静态文件服务器。

产物：

```text
dist/
├── index.html / app.js / rules.js / style.css
├── surge/ai.list
├── mihomo/ai.yaml
├── source.json        # 未展开的原始规则快照
├── manifest.json      # 上游 commit、工程版本、AI 统计、跳过正则、SHA-256
├── LICENSE / NOTICE
└── .nojekyll
```

已有输出目录只有包含本工程标记时才会被替换，避免误删普通目录；构建验证失败保留之前的结果。

## 7. 语法与兼容边界

| 上游语法 | Surge | mihomo |
| --- | --- | --- |
| 裸域名 / `domain:` | `DOMAIN-SUFFIX` | `DOMAIN-SUFFIX` |
| `full:` | `DOMAIN` | `DOMAIN` |
| `keyword:` | `DOMAIN-KEYWORD` | `DOMAIN-KEYWORD` |
| `regexp:` | **跳过并报告** | `DOMAIN-REGEX` |
| `include:`、`@attr` / `@-attr` | 转换前递归展开、筛选 | 相同 |
| `&list` 归属 | 转换前加入目标列表（包括虚拟列表） | 相同 |

Surge 不能等价表达任意域名正则，本工程不会将正则粗暴改成关键词、后缀或 URL 正则。AI 跳过的表达式见 `manifest.json`；按需转换会在页面警告并提供报告下载。

上游正则按 Go 语法维护，mihomo 的正则引擎与 Go 不完全相同。工程保留表达式，不使用 JavaScript 正则引擎冒充兼容性验证；自定义复杂正则仍应在客户端确认兼容性。关键词与正则也可能有性能开销。

上游域名规则表达的是主机名，不是 IP 列表、DNS 配置、解锁保障或完整代理配置。策略优先级、DNS 和连接模式仍需在客户端合理设置。

## 许可

工程代码使用 MIT；上游规则许可与版权声明见 [`NOTICE`](NOTICE)，并随生成产物一起发布。
