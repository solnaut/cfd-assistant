# Deployment

## 本地生产构建

```powershell
npm.cmd run build
```

构建输出目录为 `dist`。

## 临时公网链接

在 Windows 上双击 [公开分享 CFD Assistant.cmd](../公开分享%20CFD%20Assistant.cmd)。窗口会构建当前版本，并通过 Cloudflare Quick Tunnel 显示一个临时的 `https://…trycloudflare.com` 地址。第一次运行会下载并校验 Cloudflare 工具。访客用浏览器打开该地址即可。

分享期间保持本机联网、开机和窗口运行。按 `Ctrl+C` 结束分享，下次启动会生成新的地址。当前链接也会写到项目内的 `.share-runtime/public-url.txt`。持有链接的人可以访问分享的网页。 [Cloudflare Quick Tunnel 文档](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/)

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
