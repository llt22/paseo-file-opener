# Paseo 系统应用打开

HTML 交给外部浏览器，办公文档交给 WPS 或系统默认应用，支持 Finder 定位。

## 使用

1. 在 Paseo 中点击生成文件的链接。
2. 在文件标签菜单中选择“打开方式 / Open with…”→“系统应用打开”。首次选择提示也可以直接选择此面板。
3. 点击“在浏览器中打开”“用 WPS 打开”“用系统默认应用打开”或“在 Finder 中显示”。

HTML 可在选择面板时勾选“Don't ask me again”，或在标签菜单勾选“Always use”，记住此扩展名。Excel、Word 这类没有其他查看器的文件会直接显示本面板。

## 环境与边界

- Paseo Desktop、daemon、插件 SDK 均需 0.14.0 或更新版本。
- 首版支持同一台 Mac 上的客户端和文件。操作在 daemon 所在 Mac 执行；不会把远程文件下载到当前设备。
- iOS 和 Android 禁用打开按钮，以免意外启动主机应用。
- HTML 使用 macOS 为 HTTP/HTTPS 注册的默认浏览器，与 `.html` 的文件关联无关。
- WPS 使用应用 bundle ID 查找，未安装时明确显示系统错误。默认应用按钮仍可使用。
- 插件不会自动打开文件，不修改系统文件关联，不修改 Paseo 应用包。
- 插件不读取文件正文，不上传文件。只检查文件路径、真实路径、扩展名与文件类型。
- 支持 `.html`、`.htm`、`.xlsx`、`.xls`、`.docx`、`.doc`、`.pptx`、`.ppt`、`.pdf`、`.csv`、`.tsv`。拒绝其他类型和目录。

“已请求打开”表示 macOS 已接受打开请求，不能证明文档已被目标应用正确解析。

## 本地安装

在此项目目录执行：

```sh
npm ci
npm run typecheck
paseo plugin install "$PWD"
paseo plugin ls paseo-file-opener
```

在 Settings → Plugins 开启总开关后安装。修改源码后运行 `paseo plugin reload paseo-file-opener`，无需重启 daemon。可以在 Settings → Plugins 停用此插件，恢复原有查看方式。

本地插件由 Paseo 编译和打包；安装成功且状态为 `running` 后才完成构建验证。后台失败可用 `paseo plugin logs paseo-file-opener` 查看。
