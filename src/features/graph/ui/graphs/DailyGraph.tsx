/** @jsxImportSource @emotion/react */
import { IKeyResultNode, WithGraph } from 'features/graph/graphTypes';
import { useAtom } from 'jotai';
import { onlyTodayAtom } from 'common/state';
import { filterGraphByKeyResult } from 'features/graph/graphData';
import { css } from '@emotion/react';
import { HiEye, HiEyeOff } from 'react-icons/all';
import { AreaNode, FocusableNode, GoalNode } from 'features/graph/ui/graphs/components/Node';
import * as React from 'react';
import { ArcherElement } from 'react-archer';

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

export interface DailyGraphProps extends WithGraph {
  onUpdate: () => void;
}

export const DailyGraph = ({ graph: graphData, onUpdate }: DailyGraphProps) => {
  const [onlyToday, setOnlyToday] = useAtom(onlyTodayAtom);

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
          onUpdate();
        }}
      >
        {onlyToday ? <HiEyeOff /> : <HiEye />}
      </div>
      <div css={container}>
        <div css={column}>
          {areas.map((area) => (
            <ArcherElement
              key={area.id}
              id={area.id}
              relations={area.children.map((child) => ({
                targetId: child.id,
                sourceAnchor: 'right',
                targetAnchor: 'left',
              }))}
            >
              <AreaNode node={area} />
            </ArcherElement>
          ))}
        </div>
        <div css={column}>
          {goals.map((goal) => (
            <ArcherElement
              key={goal.id}
              id={goal.id}
              relations={goal.children.map((child) => ({
                targetId: child.id,
                sourceAnchor: 'right',
                targetAnchor: 'left',
              }))}
            >
              <GoalNode node={goal} />
            </ArcherElement>
          ))}
        </div>
        <div css={column}>
          {keyResults.map((keyResult) => (
            <ArcherElement key={keyResult.id} id={keyResult.id}>
              <FocusableNode node={keyResult} noteType={graph.type} />
            </ArcherElement>
          ))}
        </div>
      </div>
    </>
  );
};
