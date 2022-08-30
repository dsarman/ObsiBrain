import { MarkdownRenderChild } from 'obsidian';
import { Root } from 'react-dom/client';

export class ReactRenderChild extends MarkdownRenderChild {
  private root: Root;

  constructor(containerEl: HTMLElement, root: Root) {
    super(containerEl);
    this.root = root;
  }

  unload() {
    super.unload();
    this.root.unmount();
  }
}
