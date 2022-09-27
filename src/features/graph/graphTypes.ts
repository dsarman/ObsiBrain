import { DateTime } from 'luxon';
import { STask } from 'obsidian-dataview';

export interface INode<T = string> {
  id: string;
  name: string;
  filePath: string;
  children: T[];
  order: number;
  // Used in weekly view to avoid rendering duplicate goals & key results
  displayParentId?: string;
}

export interface ITask {
  scheduled?: DateTime;
  completed: boolean;
  isToday: boolean;
  data: STask;
}

export type IKeyResultNode = INode<ITask>;
export type IGoalNode = INode<IKeyResultNode>;
export type IAreaNode = INode<IGoalNode>;

export interface IGraph {
  areas: IAreaNode[];
  goals: IGoalNode[];
  keyResults: IKeyResultNode[];
  date: DateTime;
  type: NoteDateKind;
}

export type NoteDateKind = 'daily' | 'weekly' | 'monthly';
export type WithGraph<T = unknown> = T & { graph: IGraph };
