export interface Page {
  name: string;
  filePath: string;
  status?: 'specified' | 'scheduled' | 'empty';
}

export interface AreaPage extends Page {
  subPages: GoalPage[];
}

export interface GoalPage extends Page {
  subPages: Page[];
}
