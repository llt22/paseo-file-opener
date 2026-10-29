import { execFile } from "node:child_process";
import { realpath, stat } from "node:fs/promises";
import { extname, isAbsolute } from "node:path";
import { promisify } from "node:util";
import type { RpcInput } from "@getpaseo/plugin";
import { documentExtensions, officeExtensions, openFileRpc } from "../shared/files";

const execute = promisify(execFile);
const supportedExtensions: readonly string[] = documentExtensions;

// Resolve the registered HTTP browser, since .html may be associated with an editor.
const defaultBrowserScript = `
ObjC.import("AppKit");
const app = $.NSWorkspace.sharedWorkspace.URLForApplicationToOpenURL($.NSURL.URLWithString("https://example.com"));
const path = ObjC.unwrap(app.path);
if (!path) throw new Error("找不到系统默认浏览器");
path;
`;

export async function openFile({ path, action }: RpcInput<typeof openFileRpc>) {
  try {
    if (process.platform !== "darwin") {
      throw new Error("此版本支持 macOS 主机，请在 Mac 上使用。");
    }
    if (!isAbsolute(path)) throw new Error("请使用文件的绝对路径。");
    const resolvedPath = await realpath(path);
    const info = await stat(resolvedPath);
    if (!info.isFile()) throw new Error("请选择文件，不能打开目录。");

    const extension = extname(resolvedPath).slice(1).toLowerCase();
    if (!supportedExtensions.includes(extension)) {
      throw new Error("此文件类型不受支持，请选择 HTML、办公文档或 PDF。");
    }

    let args: string[];
    let message: string;
    switch (action) {
      case "browser": {
        if (extension !== "html" && extension !== "htm") {
          throw new Error("浏览器打开仅支持 HTML 文件。");
        }
        const { stdout } = await execute("/usr/bin/osascript", ["-l", "JavaScript", "-e", defaultBrowserScript], {
          timeout: 10_000,
          maxBuffer: 16_384,
        });
        const browser = stdout.trim();
        if (!isAbsolute(browser) || !browser.endsWith(".app")) {
          throw new Error("无法确定系统默认浏览器，请检查 macOS 默认浏览器设置。");
        }
        args = ["-a", browser, "--", resolvedPath];
        message = "已请求系统默认浏览器打开文件。";
        break;
      }
      case "wps":
        if (!officeExtensions.includes(extension)) throw new Error("WPS 打开仅支持办公文档。");
        args = ["-b", "com.kingsoft.wpsoffice.mac", "--", resolvedPath];
        message = "已请求 WPS 打开文件。";
        break;
      case "default":
        args = ["--", resolvedPath];
        message = "已请求系统默认应用打开文件。";
        break;
      case "reveal":
        args = ["-R", "--", resolvedPath];
        message = "已请求 Finder 显示文件。";
        break;
    }
    // Pass paths as individual arguments; never interpolate them into shell code.
    await execute("/usr/bin/open", args, { timeout: 10_000, maxBuffer: 16_384 });
    return { message };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    let message: string;
    if (code === "ENOENT") message = "文件不存在或已被移动，请重新生成或确认路径。";
    else if (code === "EACCES" || code === "EPERM") message = "没有权限打开此文件。";
    else {
      const stderr = (error as { stderr?: string }).stderr?.trim();
      message = stderr || (error instanceof Error ? error.message : String(error));
    }
    console.error(`[files.open] ${action}: ${message}`);
    throw new Error(message);
  }
}
