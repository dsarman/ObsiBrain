/** @jsxImportSource @emotion/react */
import * as React from 'react';
import { IKeyResultNode, WithGraph } from 'features/graph/graphTypes';
import { css } from '@emotion/react';
import { AreaNode, GoalNode, KeyResultNode } from 'features/graph/ui/Node';
import { Arrow } from 'features/graph/ui/Arrow';
import {
  filterGraphByKeyResult,
  processWeeklyData,
} from 'features/graph/graphData';
import { HiEye, HiEyeOff } from 'react-icons/all';
import { useAtomValue } from 'jotai';
import { dvApiAtom, markdownContextAtom } from 'common/state';
import { isFocused as isPageFocused } from 'common/dataviewUtils';

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

const button = css({
  position: 'absolute',
  top: 0,
  right: 35,
});

export const WeeklyGraph = ({ graph: rawData }: WithGraph) => {
  const graphData = processWeeklyData(rawData);
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
      <div css={button} onClick={() => setOnlyFocused((prev) => !prev)}>
        {onlyFocused ? <HiEyeOff /> : <HiEye />}
      </div>
      <div css={column}>
        {graph.areas.map((area) => (
          <div key={area.id} css={row}>
            <AreaNode node={area} />
            {area.children.map((goal) => {
              return (
                <div key={goal.id} css={secondRow}>
                  <Arrow parentId={area.id} childId={goal.id} />
                  {goal.displayParentId === area.id && (
                    <>
                      <GoalNode node={goal} />
                      <div css={column}>
                        {goal.children.map((keyResult) => {
                          return (
                            <div key={keyResult.id}>
                              <KeyResultNode
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
        ))}
      </div>
    </>
  );
};
