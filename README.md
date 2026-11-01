# 紫微斗数 · magpie AI 解读（个人自用二次开发）

> 本项目是 [Renhuai123/ziwei-doushu](https://github.com/Renhuai123/ziwei-doushu)（MIT）的**个人学习 / 自用**二次开发版，**非官方、非商业**，与原作者及 [yetone/magpie](https://github.com/yetone/magpie) 作者均无隶属或背书关系。
>
> **原项目的一切说明（排盘引擎、数据集、古籍、协议等）请看上游仓库：**
> 👉 https://github.com/Renhuai123/ziwei-doushu
>
> 本 README **只描述我们新增和修改的部分**。

---

## 本 Fork 做了什么

### 一、新增：AI 能力（接入 magpie 本地模型网关）

- 补齐开源版缺失的后端接口（SSE 流式）：
  - `POST /api/interpret` —— 单盘解读
  - `POST /api/heming` —— 合盘分析
  - `GET /api/models` —— 代理 magpie 模型列表
  - `GET/POST /api/ai-config` —— 读取 / 切换当前模型
- 新增 `lib/ai/*`：magpie（OpenAI 兼容）流式适配、`ZiweiChart → 文本`、提示词、SSE 封装、模型配置。
- 新增 `components/ModelPicker.tsx`：**应用内切换模型**（保存到 `data/ai-model.json`，无需改 `.env`、无需重启）。

### 二、新增：保存常用命盘

- `lib/ziwei/saved-charts.ts` + `components/SavedChartMenu.tsx`：起盘后「💾 保存此盘 / 📂 已保存」，存到**本地浏览器** localStorage，一键载入，免重复输入；可删除；同一出生信息覆盖更新（不涉及密钥、不上传服务器）。

### 三、修改：解读交互与体验

- `components/InsightPanel.tsx`
  - **对话优先**：打开不自动生成长篇；六个话题 = 快捷提问（只把示例问题填进输入框）；宫位 / 四化点击也只填问题；新增「⚡ 生成完整报告」手动触发。
  - 解读提示词改为**精简对话式**：先给结论、只答所问、结尾给 1–2 个追问方向。
  - 面板**固定高度内部滚动**，左侧命盘常驻可见。
- `app/chart/page.tsx`：固定高度网格布局；接入保存盘菜单。
- `components/BirthForm.tsx`：原生下拉 → **自定义可滚动下拉**（`SelectMenu`）；日期按**年月 / 闰年动态天数**（闰年 2 月 29、30 天月等）。
- `app/heming/page.tsx`、`components/ChatPanel.tsx`：嵌入模型选择器。

### 四、文档与工程

- 新增 `docs/MAGPIE_INTEGRATION.md`（magpie 安装、配置、换模型、接口、许可）。
- `.env.example` 增加 `MAGPIE_*`；`.gitignore` 忽略 `data/`、`.env*`、`CLAUDE.md`。

---

## 快速开始

```bash
# 0) 先安装并运行 magpie（https://usemagpie.ai），默认网关 http://127.0.0.1:3425
git clone https://github.com/mz579/ziwei-doushu-magpie.git
cd ziwei-doushu-magpie
npm install
cp .env.example .env.local
# 编辑 .env.local，填入：
#   MAGPIE_BASE_URL=http://127.0.0.1:3425/v1
#   MAGPIE_API_KEY=magpie
#   MAGPIE_MODEL=auto/deepseek-v4.1-flash
npm run dev -- -H 127.0.0.1
# 打开 http://127.0.0.1:3000
```

更多细节见 **[docs/MAGPIE_INTEGRATION.md](./docs/MAGPIE_INTEGRATION.md)**。

---

## 许可与署名

- 代码沿用上游 **MIT**（见 `LICENSE`，保留原著作权）；
- 数据 **CC BY 4.0**；`docs/tianji-ziwei/` 的倪师原话 **CC BY-NC-SA 4.0（禁止商用）**；
- 上游：[Renhuai123/ziwei-doushu](https://github.com/Renhuai123/ziwei-doushu)；模型网关：[yetone/magpie](https://github.com/yetone/magpie)；
- **免责**：个人学习 / 自用、非官方、非商业；命理内容仅供参考，不构成任何专业建议。如有侵权或不妥，请通过 Issue 联系，我会及时修改或删除。
- 上游原始 README 存档：`docs/UPSTREAM_README.md`。
