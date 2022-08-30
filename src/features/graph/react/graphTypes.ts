export interface INode {
  id: string;
  name: string;
  filePath: string;
  children: string[];
  order: number;
}

export interface IGraph {
  areas: INode[];
  goals: INode[];
  keyResults: INode[];
}
