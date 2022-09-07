/** @jsxImportSource @emotion/react */
import * as React from 'react';
import { css } from '@emotion/react';
import { ObsidianLink } from '../../cards/ObsidianLink';
import { INode, ITask } from './graphTypes';
import { HiOutlineStar, HiStar } from 'react-icons/hi';

interface Props<T = string | ITask> {
  node: INode<T>;
  className?: string;
  children?: JSX.Element;
  style?: React.CSSProperties;
}

const container = css({
  position: 'relative',
  width: 'fit-content',
  height: 'fit-content',
  padding: 12,
  margin: 6,
  borderRadius: 4,
});

const wrapper = css({
  width: 'fit-content',
  height: 'fit-content',
  marginLeft: 18,
  marginRight: 18,
  marginTop: 6,
  marginBottom: 6,
});

const link = css`
  position: relative;
  color: black;
  &:hover {
    color: var(--quote-opening-modifier);
  }
`;

export const Node = ({ node, className, children, style }: Props) => {
  const filteredChildren = node.children.filter((child) => {
    if (typeof child === 'string') return true;
    return !child.completed;
  });
  const hasIncomplete = filteredChildren.length > 0;
  const isScheduled = filteredChildren.find((child) => {
    if (typeof child === 'string') return true;
    return child.scheduled;
  });

  let bgColor;
  if (isScheduled) {
    bgColor = 'var(--green)';
  } else if (hasIncomplete) {
    bgColor = 'var(--orange)';
  } else {
    bgColor = 'var(--red)';
  }

  return (
    <div css={wrapper} id={node.id}>
      <div css={container} style={{ background: bgColor, ...(style ?? {}) }}>
        <ObsidianLink
          css={link}
          className={className}
          label={node.name}
          filePath={node.filePath}
        />
        {children}
      </div>
    </div>
  );
};

const areaTitle = css({
  fontSize: 'larger',
  whiteSpace: 'nowrap',
});

export const AreaNode = (args: Props) => {
  return <Node css={areaTitle} {...args} />;
};

const goalTitle = css({
  fontSize: 'large',
});

export const GoalNode = (args: Props) => {
  return <Node css={goalTitle} {...args} />;
};

const icon = css({
  position: 'absolute',
  top: 2,
  right: 2,
  color: 'yellow',
});

const todayBorder: React.CSSProperties = {
  borderWidth: 3,
  borderColor: 'yellow',
  borderStyle: 'solid',
};

export const KeyResultNode = (args: Props<ITask>) => {
  const isToday = args.node.children.find((task) => task.isToday);

  return (
    <Node {...args} style={isToday ? todayBorder : undefined}>
      <div css={icon}>{isToday ? <HiStar /> : <HiOutlineStar />}</div>
    </Node>
  );
};
