import { defineRpc } from "@getpaseo/plugin";
import { z } from "zod";

export const documentExtensions = [
  "html", "htm", "xlsx", "xls", "docx", "doc", "pptx", "ppt", "pdf", "csv", "tsv",
] as const;

export const officeExtensions: readonly string[] = [
  "xlsx", "xls", "docx", "doc", "pptx", "ppt", "csv", "tsv",
];

export const openFileRpc = defineRpc({
  name: "files.open",
  input: z.object({
    path: z.string().min(1).max(4096).refine((value) => !value.includes("\0"), "文件路径无效"),
    action: z.enum(["browser", "wps", "default", "reveal"]),
  }),
  output: z.object({ message: z.string() }),
});
