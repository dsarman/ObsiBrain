export interface INode<T = string> {
  id: string;
  name: string;
  filePath: string;
  children: T[];
  order: number;
}

export interface ITask {
  scheduled: boolean;
  completed: boolean;
  isToday: boolean;
}

export interface IGraph {
  areas: INode[];
  goals: INode[];
  keyResults: INode<ITask>[];
}
