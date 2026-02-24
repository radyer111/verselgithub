# V0 教程项目

该仓库用于演示如何将 V0 生成的应用落地并部署。通过最小化的示例，引导你完成本地开发、环境配置以及部署前的准备工作。

## 快速上手

1. **准备环境**  
   - Node.js ≥ 18  
   - pnpm ≥ 9（可通过 `corepack enable` 启用）

2. **拉取依赖**  
   ```bash
   pnpm install
   ```

3. **配置环境变量**  
   按照 `.env.example` 模板在根目录创建 `.env` 文件，并补全以下变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

4. **本地开发**  
   ```bash
   pnpm run dev
   ```
   启动后访问 <http://localhost:3000> 查看应用。

5. **构建与部署**  
   ```bash
   pnpm run build
   pnpm run start
   ```
   构建产物可直接用于部署到 Vercel 等支持 Next.js 的平台，配套环境变量与本地保持一致即可。

欢迎在此基础上扩展更多 V0 生成的页面或组件，并与团队共享部署流程。
