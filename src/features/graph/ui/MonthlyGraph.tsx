/** @jsxImportSource @emotion/react */
import * as React from 'react';
import { css } from '@emotion/react';
import { IGoalNode, WithGraph } from 'features/graph/graphTypes';
import { AreaNode, FocusableNode } from 'features/graph/ui/Node';
import { Arrow } from 'features/graph/ui/Arrow';
import { HiEye, HiEyeOff } from 'react-icons/all';
import { isFocused as isPageFocused } from 'common/dataviewUtils';
import {
  filterGraphByGoals,
  filterOutDuplicateGoals,
} from 'features/graph/graphData';
import { dvApiAtom, markdownContextAtom } from 'common/state';
import { useAtomValue } from 'jotai';
import { useXarrow } from 'react-xarrows';

const row = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

const column = css({
  display: 'flex',
  flexDirection: 'column',
});

const secondRow = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  flex: 2,
});

const secondColumn = css({
  flex: 2,
});

const button = css({
  position: 'absolute',
  top: 0,
  right: 35,
});

export const MonthlyGraph = ({ graph: rawData }: WithGraph) => {
  const updateXarrows = useXarrow();
  const graphData = filterOutDuplicateGoals(rawData);
  const [onlyFocused, setOnlyFocused] = React.useState(false);
  const markdownContext = useAtomValue(markdownContextAtom);
  const dvApi = useAtomValue(dvApiAtom);

  const isFocused: (keyResult: IGoalNode) => boolean = React.useCallback(
    (goalNode) => {
      if (!dvApi) return false;
      const namedMatch = markdownContext?.sourcePath.match(/.+\/(.+).md$/);
      if (namedMatch)
        return isPageFocused(goalNode.filePath, namedMatch[1], dvApi);
      return false;
    },
    [dvApi, markdownContext?.sourcePath]
  );

  const graph = onlyFocused
    ? filterGraphByGoals(graphData, isFocused)
    : graphData;

  return (
    <>
      <div
        css={button}
        onClick={() => {
          setOnlyFocused((prev) => !prev);
          updateXarrows();
        }}
      >
        {onlyFocused ? <HiEyeOff /> : <HiEye />}
      </div>
      <div css={column}>
        {graph.areas.map((area) => (
          <div key={area.id} css={row}>
            <AreaNode node={area} />
            <div css={secondColumn}>
              {graph.goals
                .filter(
                  (graphGoal) =>
                    !!area.children.find((goal) => goal.id === graphGoal.id)
                )
                .map((goal) => {
                  return (
                    <div key={goal.id} css={secondRow}>
                      <Arrow parentId={area.id} childId={goal.id} />
                      {goal.displayParentId === area.id && (
                        <>
                          <FocusableNode node={goal} />
                        </>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
