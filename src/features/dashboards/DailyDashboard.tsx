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
import { useMemo } from 'react';
import { Platform } from 'obsidian';
import {
  Accordion,
  AccordionItem,
  AccordionItemButton,
  AccordionItemHeading,
  AccordionItemPanel,
  AccordionItemState,
} from 'react-accessible-accordion';
import { HiChevronDown, HiChevronRight } from 'react-icons/all';

type DailyDashboardProps = DailyGraphProps;

export interface ITaskGroup {
  task: ITask;
  parent: DataViewPage;
}

const graphId = 'graphAccordion';
const tasksId = 'tasksAccordion';
const preExpanded = Platform.isMobile ? [tasksId] : [graphId, tasksId];

const useTodayTasks = (): ITaskGroup[] => {
  const dvApi = useAtomValue(dvApiAtom);
  const markdownContext = useAtomValue(markdownContextAtom);

  if (!dvApi || !markdownContext || !markdownContext.filename) return [];
  const tasks = dvApi.pages('"💿 Databases" or "Reviews"').file.tasks;
  const dueTasks = tasks.where((p) => {
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
    return isDue;
  }) as DataArray<STask>;

  return dueTasks
    .map((task) => ({
      task: { data: task, completed: task.completed, isToday: true },
      parent: dvApi.page(task.link.path) as DataViewPage,
    }))
    .sort((groupedTask) => groupedTask.parent?.order ?? 0)
    .array();
};

const graphContainer = css({
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
});

const ToggleHeading = ({ title = null }: { title?: string | null }) => (
  <AccordionItemHeading>
    <AccordionItemButton>
      {title}
      <AccordionItemState>
        {({ expanded }) => (expanded ? <HiChevronDown /> : <HiChevronRight />)}
      </AccordionItemState>
    </AccordionItemButton>
  </AccordionItemHeading>
);

export const DailyDashboard = ({ graph, onUpdate }: DailyDashboardProps) => {
  const tasks = useTodayTasks();
  const incompleteTasks = useMemo(() => {
    return tasks.filter((taskGroup) => !taskGroup.task.data.checked);
  }, [tasks]);

  return (
    <Accordion
      allowMultipleExpanded
      allowZeroExpanded
      preExpanded={preExpanded}
    >
      <AccordionItem uuid={graphId}>
        <ToggleHeading title="Focus Graph" />
        <AccordionItemPanel>
          <div css={graphContainer}>
            <DailyGraph onUpdate={onUpdate} graph={graph} />
          </div>
        </AccordionItemPanel>
      </AccordionItem>
      <AccordionItem uuid={tasksId}>
        <ToggleHeading title="Task list" />
        <AccordionItemPanel>
          <TaskList tasks={incompleteTasks} />
        </AccordionItemPanel>
      </AccordionItem>
    </Accordion>
  );
};
