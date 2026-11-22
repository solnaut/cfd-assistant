# Deployment

## 本地生产构建

```powershell
npm.cmd run build
```

默认构建根路径为 `/`，输出目录为 `dist`。

## GitHub Pages 在线发布（当前已启用）

线上访问地址：`https://solnaut.github.io/cfd-assistant/`

### 一键命令发布

运行以下命令会自动设置 `VITE_BASE_PATH=/cfd-assistant/` 构建独立产物，生成 `.nojekyll` 与 SPA 深链接跳转页 `404.html`，并推送到 `gh-pages` 分支（不会污染本地 `dist/` 根目录构建）：

```powershell
npm.cmd run deploy:pages
```

### 推送到 `main` 自动部署（GitHub Actions）

仓库已提供开箱即用的工作流模板 [docs/github-actions-pages.yml.example](github-actions-pages.yml.example)。

由于普通 `gh` CLI 登录默认不包含 `workflow` OAuth 权限，若要启用“每次 `git push` 自动测试并更新 GitHub Pages”：

1. 在本机执行 `gh auth refresh -h github.com -s workflow`（或在 GitHub 网页端创建 `.github/workflows/deploy-pages.yml`）。
2. 将 [docs/github-actions-pages.yml.example](github-actions-pages.yml.example) 复制为 `.github/workflows/deploy-pages.yml` 并提交推送。
3. 在仓库 **Settings → Pages → Source** 中选择 **GitHub Actions**（若改用 Actions 部署）。

## 临时公网链接

在 Windows 上双击 [公开分享 CFD Assistant.cmd](../公开分享%20CFD%20Assistant.cmd)。窗口会构建当前版本，并通过 Cloudflare Quick Tunnel 显示一个临时的 `https://…trycloudflare.com` 地址。第一次运行会下载并校验 Cloudflare 工具。访客用浏览器打开该地址即可。

分享期间保持本机联网、开机和窗口运行。按 `Ctrl+C` 结束分享，下次启动会生成新的地址。当前链接也会写到项目内的 `.share-runtime/public-url.txt`。持有链接的人可以访问分享的网页。 [Cloudflare Quick Tunnel 文档](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/)

## Cloudflare Pages 备选方案

如需部署到自定义域名或 Cloudflare Pages：

1. 在 Cloudflare Pages 连接 GitHub 仓库 `solnaut/cfd-assistant`。
2. 设置构建命令：`npm run build`（使用默认 `/` 根路径）。
3. 设置输出目录：`dist`。
4. `public/_redirects` 已配置单页应用路由回退：`/* /index.html 200`。

## 凭据规则

不要把 Cloudflare、GitHub 或其他平台的账号、令牌、密码写入仓库。登录和授权由用户自己在浏览器或系统凭据管理器中完成。
