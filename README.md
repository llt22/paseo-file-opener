# Paseo File Opener

在 Paseo 聊天里点击生成的文档，直接选择外部应用打开。HTML 交给浏览器，Excel、Word、PowerPoint 交给 WPS，也可以用系统默认应用打开，或在 Finder 中定位。

所有操作放在同一个弹窗里。选好就执行，无需先选查看器，也不用跳转文件页面。

## 让智能体帮你安装

把下面这段话复制给 Pencil、Paseo 或其他能执行本机终端命令的智能体。智能体需要能访问文件所在 Mac 的终端。

```text
请帮我在本机安装 Paseo File Opener 插件，项目地址是 https://github.com/llt22/paseo-file-opener 。先阅读项目 README，确认本机是 macOS，Paseo 客户端与 daemon 均为 0.14.0 或更新版本，并且 Paseo CLI 可用。检查插件总开关：已开启就继续；未开启时，先说明插件是能访问本机文件和进程的可信代码，再请我确认开启。执行 paseo plugin install git:llt22/paseo-file-opener，安装后用 paseo plugin ls paseo-file-opener --json 确认状态为 running。若同名插件已经安装，先核对来源，不要直接删除或覆盖我的本地开发版本。最后告诉我安装结果，并让我在 Paseo 聊天中点击一个 HTML 或办公文档链接验证。只操作本机，不连接远程服务器；遇到缺少前置软件或安装错误时，说明具体原因。
```

## 手动安装

需要 macOS，以及 0.14.0 或更新版本的 Paseo 客户端和 daemon。使用 WPS 按钮时，需要安装 WPS。

1. 在 Paseo 的 **Settings → Plugins** 中开启插件功能。Paseo 插件运行可信的本机代码，请先确认你信任项目源码。
2. 在文件所在 Mac 的终端执行安装命令。

   ```sh
   paseo plugin install git:llt22/paseo-file-opener
   ```

3. 检查插件状态。

   ```sh
   paseo plugin ls paseo-file-opener --json
   ```

   `status` 为 `running` 表示已加载。出现错误时运行 `paseo plugin logs paseo-file-opener` 查看原因。

## 使用

在 Paseo 聊天回复中点击文档链接，弹窗会按文件类型显示可用动作。

![文件打开弹窗](docs/open-file.png)

| 文件 | 打开选项 |
| --- | --- |
| HTML、HTM | 系统默认浏览器、默认应用、Finder |
| XLSX、XLS、DOCX、DOC、PPTX、PPT、CSV、TSV | WPS、默认应用、Finder |
| PDF | 默认应用、Finder |

打开请求成功后，弹窗关闭并提示结果。文件被移动、权限不足或应用未安装时，错误留在原弹窗里，可以重试或选择其他动作。

HTML 使用 macOS 为 HTTP/HTTPS 注册的默认浏览器，不受 `.html` 文件关联影响。“已请求打开”表示 macOS 接受了请求，不能证明目标应用已经正确解析文档。

## 适用范围

- 客户端和文件应在同一台 Mac 上。打开动作在 daemon 所在 Mac 执行，远程文件不会下载到当前设备。
- 只接管聊天回复中的本地文档链接。文件树、已有文件标签、网页链接、其他文件类型、右键和带修饰键的点击保留 Paseo 原有行为。
- 支持绝对路径、`file://` 本地链接和工作区相对路径，兼容中文、空格及 URL 编码。
- iOS 和 Android 保留原有链接行为。Windows 和 Linux 暂不支持系统打开动作。
- 插件只在点击动作按钮时调用系统应用，不读取文档正文、不上传文件，也不修改系统文件关联。

## 更新与停用

从本仓库安装的版本可以通过 CLI 更新。

```sh
paseo plugin update paseo-file-opener
```

停用后，聊天链接恢复 Paseo 原有行为。

```sh
paseo plugin disable paseo-file-opener
```

## 本地开发

```sh
git clone https://github.com/llt22/paseo-file-opener.git
cd paseo-file-opener
npm ci
npm run typecheck
npm run build
paseo plugin install "$PWD"
```

修改源码后运行 `paseo plugin reload paseo-file-opener`，无需重启 daemon。同名插件已安装时，先确认它的来源，再决定如何切换。

插件使用 Paseo 公开的 timeline transformer/renderer 扩展。正文继续由 Paseo 的 Markdown 组件渲染，点击监听仅安装在对应回复的容器内，卸载时移除。后台用参数数组调用 macOS 的 `open` 命令，并校验真实路径、扩展名和文件类型。

## 许可证

[MIT](LICENSE)
