# Paseo 系统应用打开

HTML 交给外部浏览器，办公文档交给 WPS 或系统默认应用，支持 Finder 定位。

## 使用

1. 在 Paseo 聊天回复中点击生成文档的链接。
2. 在同一个“打开文件”弹窗里，直接点击浏览器、WPS、系统默认应用或 Finder 按钮。

按钮按文件类型显示：HTML 优先浏览器，办公文档优先 WPS，PDF 使用系统默认应用。提交成功后弹窗关闭并提示结果；失败时保留弹窗并显示错误，可以重试或选择其他动作。整个过程不跳转文件页面，也不需要先选查看器。

## 环境与边界

- Paseo Desktop、daemon、插件 SDK 均需 0.14.0 或更新版本。
- 首版支持同一台 Mac 上的客户端和文件。操作在 daemon 所在 Mac 执行；不会把远程文件下载到当前设备。
- iOS 和 Android 保留 Paseo 原有链接行为，不接管点击。
- 接管范围仅为聊天回复中的受支持本地文档链接。普通网页、其他文件、右键和带修饰键的点击保留原有行为；文件树和已有文件标签也使用原有查看器。
- 支持绝对路径、`file://` 本地链接，以及相对于当前会话工作区的路径。兼容中文、空格和 URL 编码路径。
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

插件通过公开的 timeline transformer/renderer 扩展包装含文档链接的回复，正文继续使用 Paseo 的 Markdown 组件。Web 点击监听只安装在该条回复的容器上，卸载时移除；不修改应用包或全局点击处理。

本地插件由 Paseo 编译和打包；安装成功且状态为 `running` 后才完成构建验证。后台失败可用 `paseo plugin logs paseo-file-opener` 查看。
