import type { PluginClientContext } from "@getpaseo/plugin/client";
import { Platform } from "react-native";
import { mayContainDocumentLink } from "./client/document-link";
import { FileMessage, fileMessageSchema } from "./client/file-message";

export default function contribute(client: PluginClientContext) {
  if (Platform.OS !== "web") return () => {};
  const removeRenderer = client.addTimelineRenderer({
    kind: "file-message",
    version: 1,
    schema: fileMessageSchema,
    Component: FileMessage,
  });
  const removeTransformer = client.addTimelineTransformer({
    id: "document-links",
    query: { itemType: "assistant_message" },
    transform({ item }) {
      if (!mayContainDocumentLink(item.text)) return;
      return { items: [{ type: "plugin", kind: "file-message", version: 1, data: { text: item.text } }] };
    },
  });
  return () => {
    removeTransformer();
    removeRenderer();
  };
}
