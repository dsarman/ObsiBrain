import * as React from 'react';
import { useMemo } from 'react';
import { ITask } from 'features/graph/graphTypes';
import { ITaskGroup } from 'features/dashboards/DailyDashboard';
import { DndContext } from '@dnd-kit/core';
import { TaskContainer } from 'features/dashboards/components/TaskContainer';
import { TaskGroup } from 'features/dashboards/components/TaskGroup';
import { SortableContext } from '@dnd-kit/sortable';

export interface TaskListProps {
  tasks: ITaskGroup[];
}

export const TaskList = ({ tasks }: TaskListProps) => {
  const groupedTasks = useMemo(() => {
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

  return (
    <DndContext>
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
