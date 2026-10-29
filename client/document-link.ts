import { documentExtensions } from "../shared/files";

export interface DocumentFile {
  path: string;
  name: string;
  extension: string;
}

const extensionPattern = `(?:${documentExtensions.join("|")})`;
const documentSuffix = new RegExp(`\\.(${extensionPattern})$`, "i");
const documentLocation = new RegExp(`(\\.${extensionPattern})(?:[?#].*|:\\d+(?::\\d+)?)$`, "i");

// A cheap transformer filter; the actual clicked destination is validated below.
export function mayContainDocumentLink(text: string) {
  const lower = text.toLowerCase();
  return documentExtensions.some((extension) => lower.includes(`.${extension}`));
}

export function resolveDocumentLink(href: string, directory: string | null): DocumentFile | null {
  // Remove link locations before decoding, so %23 remains part of a file name.
  let path = href.trim().replace(documentLocation, "$1");
  if (/^file:/i.test(path)) {
    path = path.replace(/^file:(?:\/\/(?:localhost)?)?/i, "");
    // Remote file authorities cannot be opened as local files.
    if (!path.startsWith("/") || path.startsWith("//")) return null;
  } else if (/^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith("//")) {
    return null;
  }
  try {
    path = decodeURIComponent(path);
  } catch {
    // Raw local names may contain a literal %, rather than URI encoding.
  }
  const extension = documentSuffix.exec(path)?.[1].toLowerCase();
  if (!extension || path.includes("\0") || path.includes("\\")) return null;
  if (!path.startsWith("/")) {
    if (!directory?.startsWith("/")) return null;
    path = `${directory}/${path}`;
  }
  const parts: string[] = [];
  for (const part of path.split("/")) {
    if (part === "..") parts.pop();
    else if (part && part !== ".") parts.push(part);
  }
  path = `/${parts.join("/")}`;
  return { path, name: parts[parts.length - 1], extension };
}
