/** @jsxImportSource @emotion/react */
import React from 'react';
import { SMarkdownPage } from 'obsidian-dataview';
import { ObsidianLink } from 'common/components/ObsidianLink';
import { Task } from 'features/dashboards/components/Task';
import { css } from '@emotion/react';
import { ITask } from 'features/graph/graphTypes';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { HiMenu } from 'react-icons/all';

interface TaskGroupProps {
  parentTask: SMarkdownPage;
  tasks: ITask[];
}

const taskGroup = css({
  flexDirection: 'column',
  display: 'flex',
  paddingBlockEnd: 20,
});

const headerLink = css({
  fontFamily: 'var(--h4-font)',
  fontVariant: 'var(--h4-variant)',
  fontStyle: 'var(--h4-style)',
  fontSize: 'var(--h4-size)',
});

const header = css({
  flexDirection: 'row',
});

export const TaskGroup = ({ parentTask, tasks }: TaskGroupProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transition,
    transform,
  } = useSortable({ id: parentTask.file.path });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      key={parentTask.file.path}
      css={taskGroup}
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <div css={header}>
        <span ref={setActivatorNodeRef} {...listeners}>
          <HiMenu />
        </span>
        <ObsidianLink
          label={parentTask.file.name}
          filePath={parentTask.file.path}
          css={headerLink}
        />
      </div>

      {tasks.map((task) => (
        <Task
          task={task}
          key={`${task.data.blockId}-${task.data.path}-${task.data.line}`}
        />
      ))}
    </div>
  );
};
