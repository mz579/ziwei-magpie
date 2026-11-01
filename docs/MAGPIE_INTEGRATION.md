# 用 magpie 给「紫微斗数开源排盘」接上 AI 解读

本项目在 [Renhuai123/ziwei-doushu](https://github.com/Renhuai123/ziwei-doushu)（MIT）基础之上二次开发：

- 补齐了开源版缺失的 **AI 后端接口**，接入 [magpie](https://github.com/yetone/magpie)（本地模型网关）；
- 新增 **应用内切换模型**（下拉选择，无需改代码/重启）；
- 优化起盘表单（统一自定义下拉、日期按年月/闰年动态天数）与解读面板（话题独立、内部滚动）。

> 仅用于个人学习与命理文化研究；命理解读仅供参考，不构成医疗、投资、婚姻等决策依据。

---

## 1. 先装并运行 magpie（本地网关）

magpie 是一个本地模型路由网关，跑起来后在 `http://127.0.0.1:3425` 提供 **OpenAI 兼容**接口。

1. 安装：见 <https://usemagpie.ai>（macOS / Windows / Linux 均可，也有 CLI / Docker）。
2. 打开 magpie，在 **Providers → Add provider** 添加一个模型提供商（如 DeepSeek / Kimi / 智谱 GLM，填你自己的 API Key），或登录订阅账号。
3. 验证网关可用：
   ```bash
   curl http://127.0.0.1:3425/v1/models -H "Authorization: Bearer magpie"
   ```
   返回一串 `provider/model` 即成功。

## 2. 配置本项目

```bash
git clone https://github.com/mz579/ziwei-magpie.git
cd ziwei-magpie
npm install            # 若在受限沙箱里报 spawn/EPERM，可加 --ignore-scripts
cp .env.example .env.local
```

编辑 `.env.local`：

```env
MAGPIE_BASE_URL=http://127.0.0.1:3425/v1
MAGPIE_API_KEY=magpie
MAGPIE_MODEL=auto/deepseek-v4.1-flash   # 换成你在 magpie 里看到的任一 provider/model
MAGPIE_MOCK=0
```

> `MAGPIE_API_KEY` 只是本地网关口令，固定填 `magpie` 即可；真正的厂商密钥在 magpie 内部，本项目不保存、不下发。

## 3. 运行

```bash
npm run dev -- -H 127.0.0.1
# 打开 http://127.0.0.1:3000
```

- `/chart`：输入出生信息排盘 → 右侧「命理解读」面板是**对话式**：像问先生一样直接提问即可（**不会自动生成长篇**）；六个话题按钮只是把示例问题填进输入框，按发送才请求。想一次看全可点「⚡ 生成完整报告」。
- `/heming`：输入两人信息做合盘分析。

## 4. 换模型（两种方式）

- **应用内（推荐）**：`/chart` 右侧面板顶部、`/heming` 顶栏有「模型」下拉，选完自动保存到 `data/ai-model.json`，全局生效、无需重启。
- **改环境变量**：修改 `.env.local` 的 `MAGPIE_MODEL` 后重启；若已存在 `data/ai-model.json`，以应用内选择为准。

## 4.5 保存常用命盘（无需重复输入）

起盘后点「💾 保存此盘」，起个名字即可存到**本地浏览器**（localStorage，不上传服务器、不涉及密钥）。之后在 `/chart` 顶部点「📂 已保存 (n)」一键载入，无需重复输入；可删除；同一组出生信息会更新而非重复堆积。载入时用本地引擎按保存的出生信息重新排盘，结果与当时一致。

## 5. 接口说明（二次开发用）

| 接口 | 说明 |
|---|---|
| `POST /api/interpret` | 单盘解读。请求 `{ chart, messages }`，返回 SSE：`data:{"delta":{"text":…}}` … `data:[DONE]` |
| `POST /api/heming` | 合盘分析。请求 `{ chartA, chartB, question? }`，返回同款 SSE |
| `GET /api/models` | 代理 magpie 的模型列表，返回 `{ models, current }` |
| `GET/POST /api/ai-config` | 读取 / 切换当前模型（持久化到 `data/ai-model.json`） |

## 6. 相对上游的改动

- 新增 `lib/ai/*`：magpie 流式适配、命盘→文本、提示词、SSE 封装、模型配置；
- 新增 `app/api/interpret|heming|models|ai-config/route.ts`；
- 新增 `components/ModelPicker.tsx`、`components/SelectMenu.tsx`；
- 改 `components/InsightPanel.tsx`：话题/宫位/四化各自独立会话 + 面板内部滚动；
- 改 `app/chart/page.tsx`：固定高度布局（左侧命盘常驻）；
- 改 `components/BirthForm.tsx`：自定义下拉、日期按年月/闰年动态天数；
- 改 `app/heming/page.tsx`、`components/ChatPanel.tsx`：嵌入模型选择器；
- 改 `.env.example`、`.gitignore`。

## 7. 许可与署名

- 代码沿用上游 **MIT License**（见 `LICENSE`），保留原著作权声明；
- 上游排盘引擎：[Renhuai123/ziwei-doushu](https://github.com/Renhuai123/ziwei-doushu)；
- 模型网关：[yetone/magpie](https://github.com/yetone/magpie)（MIT）；
- 数据集：CC BY 4.0（见 `DATASET-LICENSE`）；`docs/tianji-ziwei/` 的倪师原话为 **CC BY-NC-SA 4.0，禁止商用**；
- **未包含**上游未开源的断语库 / AI prompt；AI 能力取决于你自己在 magpie 里配置的模型。

## 8. 已知事项

- 开发模式（`next dev`）下，浏览器左下角可能出现 Next.js 的 dev 指示器与少量开发期告警（主题脚本 / 水合不一致），**生产构建不显示**；
- 若某个模型只输出推理过程、正文为空，换一个模型即可（本项目只显示正式回答 `delta.content`）。
