import { Platform } from "react-native";
import { resolveDocumentLink, type DocumentFile } from "./document-link";

// Keep the web-only DOM boundary here; native clients retain Paseo's link behavior.
interface LinkElement {
  closest(selector: string): LinkElement | null;
  getAttribute(name: string): string | null;
}
interface LinkClick {
  target: LinkElement | null;
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  defaultPrevented: boolean;
  preventDefault(): void;
  stopPropagation(): void;
}
interface MessageElement {
  contains(element: LinkElement): boolean;
  addEventListener(type: "click", listener: (event: LinkClick) => void, capture: boolean): void;
  removeEventListener(type: "click", listener: (event: LinkClick) => void, capture: boolean): void;
}

export function captureDocumentLinks(
  view: unknown,
  directory: string | null,
  onOpen: (file: DocumentFile) => void,
) {
  if (Platform.OS !== "web" || !view) return () => {};
  const element = view as MessageElement;
  const listener = (event: LinkClick) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target?.closest?.("a[href]");
    if (!anchor || !element.contains(anchor)) return;
    const href = anchor.getAttribute("href");
    const file = href ? resolveDocumentLink(href, directory) : null;
    if (!file) return;
    event.preventDefault();
    event.stopPropagation();
    onOpen(file);
  };
  element.addEventListener("click", listener, true);
  return () => element.removeEventListener("click", listener, true);
}
