# Deployment

## 本地生产构建

```powershell
npm.cmd run build
```

构建输出目录为 `dist`。

## Cloudflare Pages 计划

暂不执行部署。后续流程：

1. 用户确认本地项目正常。
2. 创建 GitHub 仓库并推送代码。
3. 在 Cloudflare Pages 连接 GitHub 仓库。
4. 设置构建命令：`npm run build`。
5. 设置输出目录：`dist`。
6. 部署后使用 Cloudflare 提供的固定链接访问。

`public/_redirects` 已配置单页应用路由回退：`/* /index.html 200`。

## 凭据规则

不要把 Cloudflare、GitHub 或其他平台的账号、令牌、密码写入仓库。登录和授权由用户自己在浏览器中完成。
