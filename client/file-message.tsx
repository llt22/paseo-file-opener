import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useAgent, useWorkspace, type PluginTimelineItemProps } from "@getpaseo/plugin/client";
import { Markdown, Modal } from "@getpaseo/plugin/client/ui";
import { z } from "zod";
import type { DocumentFile } from "./document-link";
import { FileOpener } from "./file-opener";
import { captureDocumentLinks } from "./web";

export const fileMessageSchema = z.object({ text: z.string() });

export function FileMessage({ agentId, item, theme, layout }: PluginTimelineItemProps<z.output<typeof fileMessageSchema>>) {
  const workspaceId = useAgent(agentId, (agent) => agent.workspaceId);
  const directory = useWorkspace(workspaceId ?? "", (workspace) => workspace.directory);
  const message = useRef<View>(null);
  const [file, setFile] = useState<DocumentFile | null>(null);

  useEffect(() => captureDocumentLinks(message.current, directory, setFile), [directory]);

  return (
    <>
      <View ref={message}>
        <Markdown>{item.data.text}</Markdown>
      </View>
      <Modal title="打开文件" open={file !== null} onOpenChange={(open) => { if (!open) setFile(null); }}>
        <Modal.Content>
          {file ? (
            <FileOpener
              key={file.path}
              file={file}
              theme={theme}
              layout={layout}
              onOpened={() => setFile((current) => current === file ? null : current)}
            />
          ) : null}
        </Modal.Content>
      </Modal>
    </>
  );
}
