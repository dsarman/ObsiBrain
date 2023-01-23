import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ITask } from 'features/graph/graphTypes';
import { ITaskGroup } from 'features/dashboards/DailyDashboard';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { TaskContainer } from 'features/dashboards/components/TaskContainer';
import { TaskGroup } from 'features/dashboards/components/TaskGroup';
import { SortableContext } from '@dnd-kit/sortable';
import { useAtomValue } from 'jotai';
import { dvApiAtom } from 'common/state';
import { TAbstractFile, TFile } from 'obsidian';

export interface TaskListProps {
  tasks: ITaskGroup[];
}

const move = <T,>(array: T[], from: number, to: number) => {
  return array.splice(to, 0, array.splice(from, 1)[0]);
};

export const TaskList = ({ tasks }: TaskListProps) => {
  const dvApi = useAtomValue(dvApiAtom);
  const groupedTasksData = useMemo(() => {
    const result: Map<string, ITask[]> = new Map();

    for (const taskData of tasks) {
      const alreadyGrouped = result.get(taskData.parent.file.path) ?? [];
      alreadyGrouped.push(taskData.task);
      result.set(taskData.parent.file.path, alreadyGrouped);
    }

    return Array.from(result).map(([key, value]) => ({
      id: key,
      value,
    }));
  }, [tasks]);

  const [groupedTasks, setGroupedTasks] = useState(groupedTasksData);

  useEffect(() => {
    setGroupedTasks(groupedTasksData);
  }, [groupedTasksData]);

  const onDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const activeTaskIndex = groupedTasks.findIndex(
        (task) => task.id === active.id
      );
      const overTaskIndex = groupedTasks.findIndex(
        (task) => task.id === over?.id
      );
      const reorderedGroupedTasks = [...groupedTasks];
      move(reorderedGroupedTasks, activeTaskIndex, overTaskIndex);
      setGroupedTasks(reorderedGroupedTasks);

      reorderedGroupedTasks.forEach((groupedTask, index) => {
        if (!dvApi) return;
        const file = dvApi.app.vault.getAbstractFileByPath(groupedTask.id);
        if (file instanceof TFile) {
          dvApi.app.fileManager.processFrontMatter(file, (frontMatter) => {
            frontMatter['order'] = index;
          });
        } else {
          console.error(`Could not file task file ${groupedTask.id}`);
        }
      });
    },
    [dvApi, groupedTasks]
  );

  return (
    <DndContext onDragEnd={onDragEnd}>
      <TaskContainer>
        <SortableContext items={groupedTasks}>
          {groupedTasks.map(
            ({ id: parentTaskFilePath, value: taskList }, index) => {
              const parentTask = tasks.find(
                (task) => task.parent.file.path === parentTaskFilePath
              )?.parent;
              if (!parentTask) return null;

              return (
                <TaskGroup
                  key={parentTask.file.path}
                  parentTask={parentTask}
                  tasks={taskList}
                />
              );
            }
          )}
        </SortableContext>
      </TaskContainer>
    </DndContext>
  );
};
