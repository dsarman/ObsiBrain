/** @jsxImportSource @emotion/react */
import * as React from 'react';
import { css } from '@emotion/react';
import { ObsidianLink } from 'features/cards/ObsidianLink';
import { INode, ITask, NoteDateKind } from 'features/graph/graphTypes';
import { HiOutlineStar, HiStar } from 'react-icons/hi';
import { useAtomValue } from 'jotai';
import { dvApiAtom } from 'common/state';
import { useFocused } from 'features/graph/ui/useFocused';

interface Props<T = INode<unknown> | ITask> {
  node: INode<T>;
  className?: string;
  children?: JSX.Element;
  style?: React.CSSProperties;
  noteType?: NoteDateKind;
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
  position: 'relative',
  width: 'fit-content',
  height: 'fit-content',
  margin: 12,
});

const flex = css({
  flex: 1,
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
    if (!('completed' in child)) return true;
    return !child.completed;
  });
  const hasIncomplete = filteredChildren.length > 0;
  const isScheduled = filteredChildren.find((child) => {
    if (!('scheduled' in child)) return true;
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
    <div css={flex}>
      <div id={node.id} css={wrapper}>
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

const focusedBorder: React.CSSProperties = {
  borderWidth: 3,
  borderColor: 'yellow',
  borderStyle: 'solid',
};

export const FocusableNode = (args: Props) => {
  const dvApi = useAtomValue(dvApiAtom);
  const { isFocused, onOutlineStarClick, onStarClick } = useFocused(args.node);
  if (!dvApi) return null;

  return (
    <Node {...args} style={isFocused ? focusedBorder : undefined}>
      <div css={icon}>
        {isFocused ? (
          <HiStar onClick={onStarClick} />
        ) : (
          <HiOutlineStar onClick={onOutlineStarClick} />
        )}
      </div>
    </Node>
  );
};
