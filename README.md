# Geosite Converter

[![自动更新](https://github.com/JessYi228/geosite-converter/actions/workflows/update.yml/badge.svg)](https://github.com/JessYi228/geosite-converter/actions/workflows/update.yml)
![100% AI Built](https://img.shields.io/badge/Built_by_AI-100%25-8b5cf6)

> 🤖 **本项目 100% AI 打造。人类负责提需求、授权上线，以及发现「你又理解错了」。**
>
> 转换器、网页、测试、自动更新流程和这份 README，均由 AI 编写。
> 简单来说：**让 AI 写规则，给 AI 分流，再让 AI 写文档解释 AI 写的规则。**
>
> 100% AI 打造 ≠ 100% 没有 Bug。发现问题欢迎提 Issue，让 AI 接着改，人类接着监督。
> 此声明仅指本项目工程；上游域名数据由 **v2fly 社区**维护，功劳不抢，许可照留。

**只自动更新海外 AI 合集，其他分类在静态网站中按需转换。**

**[打开转换站](https://jessyi228.github.io/geosite-converter/)** · [Surge AI 订阅](https://jessyi228.github.io/geosite-converter/surge/ai.list) · [mihomo AI 订阅](https://jessyi228.github.io/geosite-converter/mihomo/ai.yaml) · [版本与转换报告](https://jessyi228.github.io/geosite-converter/manifest.json)

上游：[v2fly/domain-list-community](https://github.com/v2fly/domain-list-community)。

- **海外 AI 自动订阅**：仅整合上游 `category-ai-!cn` 及其递归来源，输出 Surge Rule Set 和 mihomo `classical` YAML；[详细整合目录见第 2 节](#2-海外-ai-合集详细整合目录)。
- **按需转换站**：浏览器选择一个或多个分类、合并去重、下载，无后端、无需登录。
- **低开销更新**：每天检查一次上游 commit；上游与工程版本均未变化时跳过测试、构建和部署。
- **无第三方运行依赖**：构建需要 Node.js 22+，但不需要 `npm install`；网页不依赖 CDN、第三方脚本或 Python 运行时。

## 如何使用

| 需求 | 使用方式 | 是否自动更新 |
| --- | --- | --- |
| 海外 AI 服务统一分流 | 在 Surge / mihomo 中订阅下方的 AI 合集地址 | 是，按定时检查结果更新 |
| 其他服务按需分流 | 打开转换站，选择分类、筛选属性、合并后下载 | 否，需要回到页面重新转换 |
| 修改 AI 收录范围 | 编辑 `ai.config.json` 并提交 | 是，提交会触发重新发布 |

**本订阅只使用海外 AI 分类，不合并国内 AI 分类。** 已列出每个来源文件、递归 include 以及入口直接收录的服务，便于核对实际整合范围。

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

## 2. 海外 AI 合集：详细整合目录

**唯一入口是 [`data/category-ai-!cn`](https://github.com/v2fly/domain-list-community/blob/c6adacf29cc4fb05e04651fcf03e00989ef9f797/data/category-ai-!cn)，不合并 `category-ai-cn`。** 国内分类中的 DeepSeek、豆包、通义、智谱等不通过该国内分类加入本订阅。其他分类仍可在转换站按需选择，与自动 AI 订阅无关。

默认配置在 [`ai.config.json`](ai.config.json)：

```json
{
  "name": "ai",
  "lists": ["category-ai-!cn"],
  "extraRules": []
}
```

“海外”沿用上游分类，不按厂商国籍自行判断。因此上游列入海外分类的 Coze / Trae、Dola / Cici、`kimi.ai`、`moonshot.ai`、`minimax.io` 等海外端点仍保留；不会因此加入它们的国内分类或国内端点。上游分类也含辅助资源，例如 Comfy 的绘世启动器、Envato 的资源域名，下面明确列出，不把它们隐藏成笼统的“AI 网站”。

### 2.1 完整递归目录

下面目录对应上游版本 [`c6adacf29cc4`](https://github.com/v2fly/domain-list-community/commit/c6adacf29cc4fb05e04651fcf03e00989ef9f797)：**20 个一级 include、2 个二级 include，加上入口，共 23 个来源文件**。入口还直接收录 **55 条**规则，不能只展开 include 而漏掉这些条目。

```text
data/category-ai-!cn
├── anthropic
├── bytedance-ai-!cn
│   └── dola
├── cerebras
├── comfy
│   └── comfy-ui-launcher
├── cursor
├── elevenlabs
├── envato
├── github-copilot
├── google-deepmind
├── groq
├── huggingface
├── jetbrains-ai
├── liveperson
├── manus
├── openai
├── perplexity
├── poe
├── windsurf
├── xai
└── youmind
```

**[查看随每次部署自动更新的完整来源目录与全部原始规则](https://github.com/JessYi228/geosite-converter/blob/rules/AI-SOURCES.md)**。该文档由实际配置和同版本上游源码生成，不是另维护一份可能漏项的厂商清单；同时发布在 [转换站 AI-SOURCES.md](https://jessyi228.github.io/geosite-converter/AI-SOURCES.md)。README 下面的目录与数量是上述版本的可核对快照，最新目录请以上述自动文档为准。

### 2.2 一级整合来源与覆盖范围

规则数按每个来源完整递归展开统计；最终结果仍会精确去重。

| 服务 / 项目 | 上游来源文件 | 展开规则数 | 覆盖说明 |
| --- | --- | ---: | --- |
| Anthropic / Claude | [`data/anthropic`](https://github.com/v2fly/domain-list-community/blob/c6adacf29cc4fb05e04651fcf03e00989ef9f797/data/anthropic) | 9 | Claude 主站、API、相关资源域名 |
| ByteDance 海外 AI | [`data/bytedance-ai-!cn`](https://github.com/v2fly/domain-list-community/blob/c6adacf29cc4fb05e04651fcf03e00989ef9f797/data/bytedance-ai-!cn) | 7 | Coze、Trae / MarsCode，以及递归包含的 Dola / Cici |
| Cerebras | [`data/cerebras`](https://github.com/v2fly/domain-list-community/blob/c6adacf29cc4fb05e04651fcf03e00989ef9f797/data/cerebras) | 1 | Cerebras |
| Comfy / ComfyUI | [`data/comfy`](https://github.com/v2fly/domain-list-community/blob/c6adacf29cc4fb05e04651fcf03e00989ef9f797/data/comfy) | 4 | Comfy 主站、开发与注册资源；递归包含绘世启动器 |
| Cursor | [`data/cursor`](https://github.com/v2fly/domain-list-community/blob/c6adacf29cc4fb05e04651fcf03e00989ef9f797/data/cursor) | 4 | Cursor |
| ElevenLabs | [`data/elevenlabs`](https://github.com/v2fly/domain-list-community/blob/c6adacf29cc4fb05e04651fcf03e00989ef9f797/data/elevenlabs) | 2 | ElevenLabs |
| Envato | [`data/envato`](https://github.com/v2fly/domain-list-community/blob/c6adacf29cc4fb05e04651fcf03e00989ef9f797/data/envato) | 4 | Envato 及其资源，按上游范围含 themeforest.net |
| GitHub Copilot | [`data/github-copilot`](https://github.com/v2fly/domain-list-community/blob/c6adacf29cc4fb05e04651fcf03e00989ef9f797/data/github-copilot) | 6 | Copilot 代理、Workspace、附件与遥测域名 |
| Google AI / DeepMind | [`data/google-deepmind`](https://github.com/v2fly/domain-list-community/blob/c6adacf29cc4fb05e04651fcf03e00989ef9f797/data/google-deepmind) | 46 | Gemini、AI Studio、NotebookLM、Jules、Code Assist、Labs / Flow、Opal、Antigravity、Stitch |
| Groq | [`data/groq`](https://github.com/v2fly/domain-list-community/blob/c6adacf29cc4fb05e04651fcf03e00989ef9f797/data/groq) | 1 | Groq |
| Hugging Face | [`data/huggingface`](https://github.com/v2fly/domain-list-community/blob/c6adacf29cc4fb05e04651fcf03e00989ef9f797/data/huggingface) | 3 | Hugging Face |
| JetBrains AI | [`data/jetbrains-ai`](https://github.com/v2fly/domain-list-community/blob/c6adacf29cc4fb05e04651fcf03e00989ef9f797/data/jetbrains-ai) | 3 | JetBrains AI / Grazie |
| LivePerson | [`data/liveperson`](https://github.com/v2fly/domain-list-community/blob/c6adacf29cc4fb05e04651fcf03e00989ef9f797/data/liveperson) | 2 | LivePerson |
| Manus | [`data/manus`](https://github.com/v2fly/domain-list-community/blob/c6adacf29cc4fb05e04651fcf03e00989ef9f797/data/manus) | 2 | Manus 及 CDN |
| OpenAI | [`data/openai`](https://github.com/v2fly/domain-list-community/blob/c6adacf29cc4fb05e04651fcf03e00989ef9f797/data/openai) | 23 | ChatGPT、API、Sora、静态资源、语音与上游标注的追踪域名；含 1 条正则 |
| Perplexity | [`data/perplexity`](https://github.com/v2fly/domain-list-community/blob/c6adacf29cc4fb05e04651fcf03e00989ef9f797/data/perplexity) | 5 | Perplexity |
| Poe | [`data/poe`](https://github.com/v2fly/domain-list-community/blob/c6adacf29cc4fb05e04651fcf03e00989ef9f797/data/poe) | 2 | Poe |
| Windsurf | [`data/windsurf`](https://github.com/v2fly/domain-list-community/blob/c6adacf29cc4fb05e04651fcf03e00989ef9f797/data/windsurf) | 4 | Windsurf |
| xAI / Grok | [`data/xai`](https://github.com/v2fly/domain-list-community/blob/c6adacf29cc4fb05e04651fcf03e00989ef9f797/data/xai) | 4 | Grok、xAI、Grokipedia |
| YouMind | [`data/youmind`](https://github.com/v2fly/domain-list-community/blob/c6adacf29cc4fb05e04651fcf03e00989ef9f797/data/youmind) | 3 | YouMind |

### 2.3 二级递归来源

| 被谁 include | 递归来源 | 规则数 | 内容 |
| --- | --- | ---: | --- |
| `bytedance-ai-!cn` | [`data/dola`](https://github.com/v2fly/domain-list-community/blob/c6adacf29cc4fb05e04651fcf03e00989ef9f797/data/dola) | 4 | `cici.com`、`ciciai.com`、`ciciaicdn.com`、`dola.com`，带 `@!cn` 属性 |
| `comfy` | [`data/comfy-ui-launcher`](https://github.com/v2fly/domain-list-community/blob/c6adacf29cc4fb05e04651fcf03e00989ef9f797/data/comfy-ui-launcher) | 1 | 上游备注为“绘世启动器”：`oystermercury.top` |

### 2.4 入口中直接收录的服务（全部 55 条）

这部分没有单独的 include 文件，直接写在 `category-ai-!cn`。包含 CodeRabbit、Cohere、Microsoft Copilot、DeepWiki、Jasper / Clipdrop、Kimi / Moonshot 海外端点、Meta AI，以及 Midjourney、Mistral、OpenRouter、Ollama、LM Studio、Devin、Kiro、Dify、LangChain 等。完整原始条目如下，不省略为“等”：

```text
# CodeRabbit
coderabbit.ai
coderabbit.gallery.vsassets.io

# Cohere
cohere.ai
cohere.com

# Copilot
copilot-stg.com
copilot.cloud.microsoft
copilot.com
copilot.microsoft.com

# DeepWiki
deepwiki.com
deepwiki.org

# Jasper
clipdrop.co
jasper.ai

# Kimi/Moonshot
kimi.ai
moonshot.ai

# Meta
meta.ai
metaaivm.com
muse.ai

agentclientprotocol.com
anythingllm.com
arena.ai
chutes.ai
clawhub.ai
crewai.com
devin.ai
diabrowser.com
diabrowser.engineering
dify.ai
dreamgen.com
duck.ai
gateway.ai.cloudflare.com
h2o.ai
kiro.dev
langchain.com
lmstudio.ai
lovart.ai
midjourney.com
minimax.io
mistral.ai
mozilla.ai
notegpt.io
novelai.net
ollama.com
openart.ai
openclaw.ai
opencode.ai
openrouter.ai
openspec.dev
plannotator.ai
qoder.com
sider.ai
spicywriter.com
syntx.ai
talkai.info
tapnow.ai
tripo3d.ai
```

### 2.5 输出数量与兼容差异

上述版本共整合 **190 条**规则：mihomo 保留全部 **190 条**，Surge 输出 **189 条**。Surge 唯一跳过的是来自 `openai` 的下面这条正则，不会擅自改写成宽泛后缀：

```text
^chatgpt-async-webps-prod-\S+-\d+\.webpubsub\.azure\.com$
```

动态数量与校验和见 [manifest.json](https://jessyi228.github.io/geosite-converter/manifest.json)。按上游原样保留标注的广告 / 遥测等属性规则，不默认额外过滤，以免隐性改变上游覆盖范围。

需要补充上游尚未收录的海外端点时，可在自己的 Fork 的 `extraRules` 中逐条添加，例如：

```json
"extraRules": ["example.ai", "full:api.example.ai"]
```

修改配置并提交后触发构建；后续上游分类变化会自动跟进。合并按规则类型和内容精确去重，不在属性筛选之前裁剪子域名。

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
├── AI-SOURCES.md      # 同版本自动生成的完整来源目录、递归 include 与原始规则
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
