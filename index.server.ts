import type { PluginServerContext } from "@getpaseo/plugin/server";
import { openFile } from "./server/open-file";
import { openFileRpc } from "./shared/files";

export default function contribute(server: PluginServerContext) {
  server.handle(openFileRpc, openFile);
  return () => {};
}
