import { MarkdownPostProcessorContext, MarkdownRenderChild } from 'obsidian';
import { createRoot, Root } from 'react-dom/client';
import { DataviewApi } from 'obsidian-dataview';
import * as React from 'react';
import { IGraph } from 'features/graph/graphTypes';
import { sb } from 'common/loggingUtils';
import { getData } from 'features/graph/graphData';
import { GraphContainer } from 'features/graph/ui/GraphContainer';

export class ReactRenderChild extends MarkdownRenderChild {
  private root: Root | null = null;
  private readonly api: DataviewApi;
  private readonly context: MarkdownPostProcessorContext;
  private graph: IGraph | null = null;

  constructor(
    containerEl: HTMLElement,
    api: DataviewApi,
    context: MarkdownPostProcessorContext
  ) {
    super(containerEl);
    this.api = api;
    this.context = context;
  }

  render(refreshData = true) {
    if (refreshData || !this.graph) {
      this.graph = getData(this.api, this.context.sourcePath);
      console.log(this.graph);
    }
    if (!this.graph) {
      console.error(sb('Could not load data from dataview'));
      return;
    }
    if (!this.root) {
      this.root = createRoot(this.containerEl);
    }

    this.root.render(
      <React.StrictMode>
        <GraphContainer
          graph={this.graph}
          dvApi={this.api}
          markdownContext={this.context}
        />
      </React.StrictMode>
    );
  }

  onload() {
    this.render();
    this.registerEvent(
      this.api.app.workspace.on('resize', () => {
        this.render(false);
      })
    );
    this.registerEvent(
      // @ts-ignore
      this.api.app.workspace.on('dataview:refresh-views', () => this.render())
    );
  }

  unload() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}
