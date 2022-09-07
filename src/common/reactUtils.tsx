import { MarkdownRenderChild, MarkdownView } from 'obsidian';
import { createRoot, Root } from 'react-dom/client';
import { DataArray, DataviewApi } from 'obsidian-dataview';
import { IGraph, INode, ITask } from '../features/graph/react/graphTypes';
import { isComplete, isFocused, processField } from './dataviewUtils';
import { DataViewPage } from './types';
import { sb } from './loggingUtils';
import * as React from 'react';
import { Graph } from '../features/graph/react/Graph';

const nodeComparator = (a: INode<any>, b: INode<any>) => b.order - a.order;

const getData = (api: DataviewApi, filePath: string): IGraph | null => {
  const noteFile = api.page(filePath) as DataViewPage;
  if (!noteFile) {
    console.error(sb(`Could not find note file with path ${filePath}`));
    return null;
  }
  const noteDay = noteFile.file.day;
  if (!noteDay) {
    console.error(sb(`File ${filePath} is not a day note.`));
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

  const keyResults = (
    api.pages('"💿 Databases/💎 Key Results"') as DataArray<DataViewPage>
  ).filter(
    (keyResult) =>
      isFocused(keyResult, currentWeek, api) && !isComplete(keyResult)
  );

  // Create initial graph data with filled in areas
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

  // Add goals to the graph while computing order from a parent area
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

  // Compute if given key result is scheduled today
  keyResults.forEach((keyResult, index) => {
    const id = `k-${index}`;
    const order = processField(keyResult.goal, data.goals, id, api);
    let isKeyResultToday = false;
    const tasks: ITask[] = keyResult.file.tasks
      .filter((task) => !task.completed)
      .map((task) => {
        const scheduled = task['🗓'];
        if (api.value.isLink(scheduled)) {
          const scheduledPage = api.page(scheduled.path) as DataViewPage;
          const scheduledOn = scheduledPage?.file?.day;
          const isToday = scheduledOn && scheduledOn <= noteFile.file.day;
          isKeyResultToday = isToday || isKeyResultToday;
          return {
            completed: task.completed,
            scheduled,
            isToday,
          };
        }
        return null;
      })
      .filter((value: unknown) => !!value);

    data.keyResults.push({
      id,
      name: keyResult.file.name,
      filePath: keyResult.file.path,
      order: isKeyResultToday ? order * 1000 : order,
      children: tasks,
    });
  });

  // "Backpropagate" the correct order from key results to goals, taking into account if a key result is scheduled today (= ordered on top)
  data.keyResults.forEach((keyResult) => {
    const goal = data.goals.find((goal) =>
      goal.children.includes(keyResult.id)
    );
    if (!goal) return;

    const order = Math.max(goal.order, keyResult.order);
    goal.order = order;
    keyResult.order = order;
  });

  // "Backpropagate" correct order from goals to areas
  data.goals.forEach((goal) => {
    const area = data.areas.find((area) => area.children.includes(goal.id));
    if (!area) return;

    const order = Math.max(goal.order, area.order);
    goal.order = order;
    area.order = order;
  });

  return {
    areas: data.areas.sort(nodeComparator),
    goals: data.goals.sort(nodeComparator),
    keyResults: data.keyResults.sort(nodeComparator),
  };
};

export class ReactRenderChild extends MarkdownRenderChild {
  private root: Root | null = null;
  private readonly api: DataviewApi;
  private readonly sourcePath: string;
  private graph: IGraph | null = null;

  constructor(containerEl: HTMLElement, api: DataviewApi, sourcePath: string) {
    super(containerEl);
    this.api = api;
    this.sourcePath = sourcePath;
  }

  render(refreshData = true) {
    if (refreshData || !this.graph) {
      this.graph = getData(this.api, this.sourcePath);
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
        <Graph graph={this.graph} />
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
