import { MarkdownPostProcessorContext } from 'obsidian';
import { DataArray, DataviewApi, getAPI } from 'obsidian-dataview';
import { sb } from '../../common/loggingUtils';
import * as React from 'react';
import { DataViewPage } from '../../common/types';
import { IGraph, INode } from './react/graphTypes';
import {
  isComplete,
  isFocused,
  processField,
} from '../../common/dataviewUtils';
import { createRoot } from 'react-dom/client';
import { Graph } from './react/Graph';
import { ReactRenderChild } from '../../common/reactUtils';

const nodeComparator = (a: INode, b: INode) => a.order - b.order;

const getData = (api: DataviewApi, filePath: string): IGraph | null => {
  const noteFile = api.page(filePath) as DataViewPage;
  if (!noteFile) {
    console.error(sb(`Could not find note file with path ${filePath}`));
    return null;
  }
  const noteDay = noteFile.file.day;
  if (!noteDay) {
    console.log(sb(`File ${filePath} is not a day note.`));
    return null;
  }

  const currentQ = noteDay.toFormat("kkkk-'Q'q");
  const currentMonth = noteDay.toFormat('kkkk-LL');
  const currentWeek = noteDay.toFormat("kkkk-'W'W");

  const areas = (
    api.pages(
      '"💿 Databases/🏰 Areas Of Competence"'
    ) as DataArray<DataViewPage>
  ).filter((area) => isFocused(area, currentQ, api) && !isComplete(area));

  const goals = (
    api.pages('"💿 Databases/🚀 Goals"') as DataArray<DataViewPage>
  ).filter((goal) => isFocused(goal, currentMonth, api) && !isComplete(goal));

  console.log(goals);

  const keyResults = (
    api.pages('"💿 Databases/💎 Key Results"') as DataArray<DataViewPage>
  ).filter(
    (keyResult) =>
      isFocused(keyResult, currentWeek, api) && !isComplete(keyResult)
  );

  const data: IGraph = {
    areas: areas.array().map((area, index) => ({
      id: `a-${index}`,
      name: area.file.name,
      filePath: area.file.path,
      order: index,
      children: [],
    })),
    goals: [],
    keyResults: [],
  };

  goals.forEach((goal, index) => {
    const id = `g-${index}`;
    const order = processField(goal.area, data.areas, id, api);
    data.goals.push({
      id,
      name: goal.file.name,
      filePath: goal.file.path,
      order,
      children: [],
    });
  });

  keyResults.forEach((keyResult, index) => {
    const id = `k-${index}`;
    const order = processField(keyResult.goal, data.goals, id, api);
    data.keyResults.push({
      id,
      name: keyResult.file.name,
      filePath: keyResult.file.path,
      order,
      children: [],
    });
  });

  return {
    areas: data.areas.sort(nodeComparator),
    goals: data.goals.sort(nodeComparator),
    keyResults: data.keyResults.sort(nodeComparator),
  };
};

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

  const data = getData(api, ctx.sourcePath);
  if (!data) {
    console.error(sb('Could not load data from dataview'));
    return;
  }

  const root = createRoot(el);
  root.render(
    <React.StrictMode>
      <Graph graph={data} />
    </React.StrictMode>
  );

  ctx.addChild(new ReactRenderChild(el, root));
};
