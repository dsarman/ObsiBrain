/** @jsxImportSource @emotion/react */
import * as React from 'react';
import { css } from '@emotion/react';
import { ObsidianLink } from 'features/cards/ObsidianLink';
import { INode, ITask, NoteDateKind } from 'features/graph/graphTypes';
import { HiOutlineStar, HiStar } from 'react-icons/hi';
import { useAtomValue } from 'jotai';
import { dvApiAtom, graphAtom, markdownContextAtom } from 'common/state';
import { changeTaskDate, toggleFocus, WEEK_FORMAT } from 'common/dataviewUtils';
import { DateTime } from 'luxon';
import { isFocused as isPageFocused } from 'common/dataviewUtils';

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

export const KeyResultNode = (args: Props<ITask>) => {
  const graph = useAtomValue(graphAtom);
  const graphDate = graph?.date ?? null;
  const dvApi = useAtomValue(dvApiAtom);
  const markdownContext = useAtomValue(markdownContextAtom);
  const [isFocused, setIsFocused] = React.useState<
    boolean | ITask | undefined
  >();

  React.useEffect(() => {
    switch (args.noteType) {
      case 'daily':
        setIsFocused(args.node.children.find((task) => task.isToday));
        return;
      case 'weekly': {
        if (!markdownContext || !dvApi) return;
        const namedMatch = markdownContext.sourcePath.match(/.+\/(.+).md$/);
        if (namedMatch)
          setIsFocused(isPageFocused(args.node.filePath, namedMatch[1], dvApi));
        return;
      }
    }
  }, [
    args.node.children,
    args.node.filePath,
    args.noteType,
    dvApi,
    markdownContext,
  ]);

  const onStarClick = React.useCallback(() => {
    if (!dvApi || !graphDate) return;
    switch (args.noteType) {
      case 'daily':
        if (!isFocused || typeof isFocused === 'boolean') return;
        changeTaskDate(isFocused.data, null, 'due', dvApi.app.vault);
        return;
      case 'weekly':
        setIsFocused((prevState) => !prevState);
        toggleFocus(
          dvApi,
          args.node.filePath,
          !!isFocused,
          graphDate.toFormat(WEEK_FORMAT)
        );
        return;
    }
  }, [args.node.filePath, args.noteType, dvApi, graphDate, isFocused]);

  const onOutlineStarClick = React.useCallback(() => {
    if (!dvApi || !graphDate) return;
    switch (args.noteType) {
      case 'daily': {
        const firstIncomplete = args.node.children.find(
          (task) => !task.completed && !task.isToday
        );
        if (firstIncomplete) {
          changeTaskDate(
            firstIncomplete.data,
            DateTime.now(),
            'due',
            dvApi.app.vault
          );
        }
        return;
      }
      case 'weekly':
        setIsFocused((prevState) => !prevState);
        toggleFocus(
          dvApi,
          args.node.filePath,
          !!isFocused,
          graphDate.toFormat(WEEK_FORMAT)
        );
        return;
    }
  }, [
    args.node.children,
    args.node.filePath,
    args.noteType,
    dvApi,
    graphDate,
    isFocused,
  ]);

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
