import type { PluginClientContext } from "@getpaseo/plugin/client";
import { FileOpenerPanel } from "./client/file-opener";
import { documentExtensions } from "./shared/files";

export default function contribute(client: PluginClientContext) {
  return client.addFilePanel({
    id: "external-open",
    title: "系统应用打开",
    icon: "ExternalLink",
    files: { extensions: documentExtensions },
    Component: FileOpenerPanel,
  });
}
