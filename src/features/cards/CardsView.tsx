import { ItemView, WorkspaceLeaf } from 'obsidian';
import { createRoot } from 'react-dom/client';
import { Cards } from './Cards';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

const VIEW_TYPE_CARDS = 'sb-cards-view';

class CardsView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getDisplayText(): string {
    return VIEW_TYPE_CARDS;
  }

  getViewType(): string {
    return 'Second Brain Cards View';
  }

  async onOpen() {
    const root = createRoot(this.containerEl.children[1]);
    root.render(
      <React.StrictMode>
        <Cards />
      </React.StrictMode>
    );
  }

  async onClose() {
    ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
  }
}
