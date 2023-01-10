import {
  DailyGraph,
  DailyGraphProps,
} from 'features/graph/ui/graphs/DailyGraph';
import * as React from 'react';
import { TaskList } from 'features/dashboards/components/TaskList';
import { useAtomValue } from 'jotai';
import { dvApiAtom, markdownContextAtom } from 'common/state';
import { css } from '@emotion/react';
import { ITask } from 'features/graph/graphTypes';
import { DataViewPage } from 'common/types';
import { DataArray, STask } from 'obsidian-dataview';

type DailyDashboardProps = DailyGraphProps;

export interface ITaskGroup {
  task: ITask;
  parent: DataViewPage;
}

const useTodayTasks = (): ITaskGroup[] => {
  const dvApi = useAtomValue(dvApiAtom);
  const markdownContext = useAtomValue(markdownContextAtom);

  if (!dvApi || !markdownContext || !markdownContext.filename) return [];
  const tasks = dvApi.pages('"💿 Databases" or "Reviews"').file.tasks;
  const dueTasks = tasks.where((p) => {
    //if (p.link.path.contains('🔁')) return false;
    const dueDateFromField = dvApi.date(p['🗓'] || p['📅'] || p.due);
    let dueDate;
    if (!dueDateFromField) {
      const page = dvApi.page(p.path);
      if (page) {
        dueDate = page.file.day;
      }
    }
    if (!dueDateFromField && !dueDate) return false;

    const nowDate = dvApi.date(markdownContext.filename);
    let isDue;
    if (dueDate) {
      isDue = dueDate < nowDate;
    } else {
      isDue = dueDateFromField <= nowDate;
    }
    return !p.completed && isDue;
  }) as DataArray<STask>;

  return dueTasks
    .map((task) => ({
      task: { data: task, completed: task.completed, isToday: true },
      parent: dvApi.page(task.link.path) as DataViewPage,
    }))
    .array();
};

const graphContainer = css({
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
});

export const DailyDashboard = ({ graph, onUpdate }: DailyDashboardProps) => {
  const tasks = useTodayTasks();

  return (
    <div>
      <div css={graphContainer}>
        <DailyGraph onUpdate={onUpdate} graph={graph} />
      </div>
      <TaskList tasks={tasks} />
    </div>
  );
};
