import { MarkdownPostProcessorContext } from 'obsidian';
import { getAPI } from 'obsidian-dataview';
import { sb } from '../../common/loggingUtils';
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
