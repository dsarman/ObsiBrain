import { MarkdownPostProcessorContext } from 'obsidian';
import { DataArray, DataviewApi, getAPI } from 'obsidian-dataview';
import { sb } from '../../common/loggingUtils';
import { DataViewPage } from '../../common/types';
import { IGraph, INode, ITask } from './react/graphTypes';
import {
  isComplete,
  isFocused,
  processField,
} from '../../common/dataviewUtils';
import { createRoot } from 'react-dom/client';
import { Graph } from './react/Graph';
import { ReactRenderChild } from '../../common/reactUtils';

export const graphCodeBlockPostProcessor = (
  source: string,
  el: HTMLElement,
  ctx: MarkdownPostProcessorContext
): Promise<any> | void => {
  const api = getAPI(app);
  if (!api) {
    console.error(sb('Could not load dataview api'));
    return;
  }

  ctx.addChild(new ReactRenderChild(el, api, ctx.sourcePath));
};
