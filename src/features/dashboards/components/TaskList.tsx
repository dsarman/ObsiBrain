import * as React from 'react';
import { useMemo } from 'react';
import { ITask } from 'features/graph/graphTypes';
import { Task } from 'features/dashboards/components/Task';
import { ObsidianLink } from 'common/components/ObsidianLink';
import { css } from '@emotion/react';
import { ITaskGroup } from 'features/dashboards/DailyDashboard';

export interface TaskListProps {
  tasks: ITaskGroup[];
}

const taskGroup = css({
  flexDirection: 'column',
  display: 'flex',
  paddingBlockEnd: 20,
});

const tasksContainer = css({
  backgroundColor: 'rgba(0,0,0,0.2)',
  padding: 20,
  borderRadius: 4,
});

const headerLink = css({
  fontFamily: 'var(--h4-font)',
  fontVariant: 'var(--h4-variant)',
  fontStyle: 'var(--h4-style)',
  fontSize: 'var(--h4-size)',
});

export const TaskList = ({ tasks }: TaskListProps) => {
  const groupedTasks = useMemo(() => {
    const result: Map<string, ITask[]> = new Map();

    for (const taskData of tasks) {
      const alreadyGrouped = result.get(taskData.parent.file.path) ?? [];
      alreadyGrouped.push(taskData.task);
      result.set(taskData.parent.file.path, alreadyGrouped);
    }

    return result;
  }, [tasks]);

  return (
    <div css={tasksContainer}>
      {Array.from(groupedTasks).map(([parentTaskFilePath, taskList]) => {
        const parentTask = tasks.find(
          (task) => task.parent.file.path === parentTaskFilePath,
        )?.parent;
        if (!parentTask) return null;

        return (
          <div key={parentTask.file.path} css={taskGroup}>
            <ObsidianLink
              label={parentTask.file.name}
              filePath={parentTask.file.path}
              css={headerLink}
            />
            {taskList.map((task) => (
              <Task task={task} key={task.data.blockId} />
            ))}
          </div>
        );
      })}
    </div>
  );
};
