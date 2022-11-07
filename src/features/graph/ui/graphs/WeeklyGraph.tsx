/** @jsxImportSource @emotion/react */
import * as React from 'react';
import { IKeyResultNode, WithGraph } from 'features/graph/graphTypes';
import { css } from '@emotion/react';
import {
  AreaNode,
  GoalNode,
  FocusableNode,
} from 'features/graph/ui/graphs/components/Node';
import { Arrow } from 'features/graph/ui/graphs/components/Arrow';
import {
  filterGraphByKeyResult,
  filterOutDuplicateGoals,
} from 'features/graph/graphData';
import { HiEye, HiEyeOff } from 'react-icons/all';
import { useAtomValue } from 'jotai';
import { dvApiAtom, markdownContextAtom } from 'common/state';
import { isFocused as isPageFocused } from 'common/dataviewUtils';
import { useXarrow } from 'react-xarrows';

const row = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

const secondRow = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  flex: 2,
});

const column = css({
  display: 'flex',
  flexDirection: 'column',
});

const secondColumn = css({
  flex: 2,
});

const button = css({
  position: 'absolute',
  top: 0,
  right: 35,
});

export const WeeklyGraph = ({ graph: rawData }: WithGraph) => {
  const updateXarrows = useXarrow();
  const graphData = filterOutDuplicateGoals(rawData);
  const [onlyFocused, setOnlyFocused] = React.useState(false);
  const markdownContext = useAtomValue(markdownContextAtom);
  const dvApi = useAtomValue(dvApiAtom);

  const isFocused: (keyResult: IKeyResultNode) => boolean = React.useCallback(
    (keyResult) => {
      if (!dvApi) return false;
      const namedMatch = markdownContext?.sourcePath.match(/.+\/(.+).md$/);
      if (namedMatch)
        return isPageFocused(keyResult.filePath, namedMatch[1], dvApi);
      return false;
    },
    [dvApi, markdownContext?.sourcePath]
  );

  const graph = onlyFocused
    ? filterGraphByKeyResult(graphData, isFocused)
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
                .filter((goal) =>
                  area.children.map((goal) => goal.id).includes(goal.id)
                )
                .map((goal) => {
                  return (
                    <div key={goal.id} css={secondRow}>
                      <Arrow parentId={area.id} childId={goal.id} />
                      {goal.displayParentId === area.id && (
                        <>
                          <GoalNode node={goal} />
                          <div css={column}>
                            {graph.keyResults
                              .filter((keyResult) =>
                                goal.children
                                  .map((goal) => goal.id)
                                  .includes(keyResult.id)
                              )
                              .map((keyResult) => {
                                return (
                                  <div key={keyResult.id}>
                                    <FocusableNode
                                      node={keyResult}
                                      noteType={graph.type}
                                    />
                                    <Arrow
                                      parentId={goal.id}
                                      childId={keyResult.id}
                                    />
                                  </div>
                                );
                              })}
                          </div>
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
