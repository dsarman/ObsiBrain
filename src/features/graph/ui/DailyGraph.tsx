/** @jsxImportSource @emotion/react */
import { IKeyResultNode, WithGraph } from 'features/graph/graphTypes';
import { useAtom } from 'jotai';
import { useXarrow } from 'react-xarrows';
import { onlyTodayAtom } from 'common/state';
import { filterGraphByKeyResult } from 'features/graph/graphData';
import { css } from '@emotion/react';
import { HiEye, HiEyeOff } from 'react-icons/all';
import { AreaNode, GoalNode, KeyResultNode } from 'features/graph/ui/Node';
import { Arrow } from 'features/graph/ui/Arrow';
import * as React from 'react';

const container = css({
  marginTop: 10,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-around',
});

const column = css({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-evenly',
});

const button = css({
  position: 'absolute',
  top: 0,
  right: 35,
});
const filterToday = (keyResult: IKeyResultNode) =>
  !!keyResult.children.find((task) => task.isToday);

export const DailyGraph = ({ graph: graphData }: WithGraph) => {
  const [onlyToday, setOnlyToday] = useAtom(onlyTodayAtom);
  const updateXarrows = useXarrow();

  const graph = onlyToday
    ? filterGraphByKeyResult(graphData, filterToday)
    : graphData;
  const { areas, goals, keyResults } = graph;

  return (
    <>
      <div
        css={button}
        onClick={() => {
          setOnlyToday((prev) => !prev);
          updateXarrows();
        }}
      >
        {onlyToday ? <HiEyeOff /> : <HiEye />}
      </div>
      <div css={container}>
        <div css={column}>
          {areas.map((area) => (
            <div key={area.id}>
              <AreaNode node={area} />
              {area.children.map((child) => (
                <Arrow
                  key={`${area.id}-${child.id}`}
                  parentId={area.id}
                  childId={child.id}
                />
              ))}
            </div>
          ))}
        </div>
        <div css={column}>
          {goals.map((goal) => (
            <div key={goal.id}>
              <GoalNode node={goal} />
              {goal.children.map((child) => (
                <Arrow
                  key={`${goal.id}-${child.id}`}
                  parentId={goal.id}
                  childId={child.id}
                />
              ))}
            </div>
          ))}
        </div>
        <div css={column}>
          {keyResults.map((keyResult) => (
            <KeyResultNode
              key={keyResult.id}
              node={keyResult}
              noteType={graph.type}
            />
          ))}
        </div>
      </div>
    </>
  );
};
