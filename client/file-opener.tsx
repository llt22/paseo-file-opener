import { useEffect, useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { useRpc, type PluginFilePanelProps } from "@getpaseo/plugin/client";
import { officeExtensions, openFileRpc } from "../shared/files";

function openingError(error: Error) {
  // Paseo adds transport diagnostics to RPC errors; keep the actionable message in the UI.
  return error.message.replace(/^Request failed:\s*/, "").split(/\s+requestType=/, 1)[0];
}

export function FileOpenerPanel({ file, host, theme, layout }: PluginFilePanelProps) {
  const openFile = useRpc(openFileRpc);
  const mutation = useMutation({ mutationFn: openFile });
  const { reset } = mutation;
  useEffect(() => reset(), [file.path, reset]);

  const styles = useMemo(() => ({
    page: { flex: 1, backgroundColor: theme.colors.surface0 },
    content: { padding: layout.compact ? 20 : 40, gap: 20, width: "100%" as const, maxWidth: 760 },
    type: { color: theme.colors.foregroundMuted, fontSize: 12, fontWeight: "600" as const, letterSpacing: 1 },
    title: { color: theme.colors.foreground, fontSize: layout.compact ? 22 : 28, fontWeight: "600" as const },
    path: { color: theme.colors.foregroundMuted, fontSize: 13, lineHeight: 21 },
    description: { color: theme.colors.foregroundMuted, fontSize: 14, lineHeight: 23 },
    actions: { gap: 10, alignItems: "stretch" as const },
    button: { borderRadius: 10, padding: 16, backgroundColor: theme.colors.surface1, borderWidth: 1, borderColor: theme.colors.border },
    primary: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
    label: { color: theme.colors.foreground, fontSize: 15, fontWeight: "600" as const },
    primaryLabel: { color: theme.colors.accentForeground },
    status: { color: mutation.isError ? theme.colors.statusDanger : theme.colors.statusSuccess, fontSize: 14, lineHeight: 22 },
  }), [theme, layout.compact, mutation.isError]);

  const isHtml = file.extension === "html" || file.extension === "htm";
  const isOffice = officeExtensions.includes(file.extension);
  const mobile = layout.platform !== "web";
  const actions = [
    ...(isHtml ? [{ action: "browser" as const, title: "在浏览器中打开", primary: true }] : []),
    ...(isOffice ? [{ action: "wps" as const, title: "用 WPS 打开", primary: true }] : []),
    { action: "default" as const, title: "用系统默认应用打开", primary: !isHtml && !isOffice },
    { action: "reveal" as const, title: "在 Finder 中显示", primary: false },
  ];

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={{ gap: 10 }}>
        <Text style={styles.type}>{file.extension.toUpperCase()} · 系统应用打开</Text>
        <Text style={styles.title} selectable>{file.name}</Text>
        <Text style={styles.path} selectable>{file.path}</Text>
      </View>
      <Text style={styles.description}>
        {isHtml ? "使用 macOS 默认浏览器查看完整页面。" : "把文件交给熟悉的应用，继续查看或编辑。"}
      </Text>
      <View style={styles.actions}>
        {actions.map(({ action, title, primary }) => (
          <Pressable
            key={action}
            accessibilityRole="button"
            accessibilityLabel={title}
            accessibilityState={{ disabled: mutation.isPending || mobile }}
            disabled={mutation.isPending || mobile}
            style={[styles.button, primary && styles.primary, (mutation.isPending || mobile) && { opacity: 0.5 }]}
            onPress={() => mutation.mutate({ path: file.path, action })}
          >
            <Text style={[styles.label, primary && styles.primaryLabel]}>
              {mutation.isPending && mutation.variables?.action === action ? "正在打开…" : title}
            </Text>
          </Pressable>
        ))}
      </View>
      {mutation.isPending || mutation.isError || mutation.isSuccess ? (
        <Text accessibilityRole="alert" style={styles.status}>
          {mutation.isPending ? "正在提交打开请求…" : mutation.isError ? openingError(mutation.error) : mutation.data?.message}
        </Text>
      ) : null}
      <Text style={styles.description}>
        {mobile ? "请在文件所在 Mac 的 Paseo 桌面端使用这些操作。" : `打开操作在「${host.label}」上执行。请在同一台 Mac 的桌面端使用。`}
      </Text>
    </ScrollView>
  );
}
