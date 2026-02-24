# TASKS-01 可执行步骤

## 一、Supabase 邮箱登录/注册
1. 在项目根目录创建 `.env` 与 `.env.example`，定义 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY` 等变量，并在文档中标注需要从 Supabase 控制台获取的值。
2. 安装 Supabase JavaScript SDK，并在 `lib/supabase.ts`（若不存在则新建）中封装客户端初始化逻辑。
3. 新建登录/注册页面组件（或使用现有页），实现邮箱登录与注册表单，调用 Supabase 的 `signUp`、`signInWithPassword` 方法及基础错误处理。
4. 将首页 `HeroSection` 中的 “Try for free” 与 “Sign up for free” 按钮改为打开/跳转到登录注册页面或触发对应逻辑。

## 二、价格面板后端 & 数据加载
1. 在 `/sqls` 目录中新建数据库结构与初始化数据脚本，包含价格表创建语句及示例数据。
2. 确定数据库访问方式（例如 Supabase Postgres 或其他后端服务），并在 `/app/api/pricing/route.ts` 中实现从数据库读取价格列表的 API。
3. 在 `PricingSection` 组件中使用 `fetch`（或 React Query 等）调用 `/api/pricing`，在加载时展示 Skeleton/Spinner，成功后渲染真实价格数据，失败时给出兜底文案。

## 三、落地页微动效
1. 安装 `framer-motion`（若未安装）并审查现有的 `AnimatedSection` 组件，确保可以复用基础动画。
2. 在 Hero、Pricing 等关键区块中引入微交互动效（例如进入视窗时淡入/轻微位移、按钮悬停缩放等），保证动画轻量不影响性能。
3. 检查移动端表现，确保动画流畅且不会与现有布局冲突。

## 四、验证与交付
1. 本地运行 `pnpm lint` / `pnpm build`（或项目约定命令）确保无编译与 ESLint 错误。
2. 对登录注册、价格加载与动效进行手动回归测试，确认用户流畅体验。
