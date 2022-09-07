/** @jsxImportSource @emotion/react */
import * as React from 'react';
import { IGraph } from './graphTypes';
import { css } from '@emotion/react';
import { AreaNode, GoalNode, KeyResultNode } from './Node';
import Xarrow from 'react-xarrows';

interface Props {
  graph: IGraph;
}

const container = css({
  display: 'flex',
  flexDirection: 'row',
});

const column = css({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-evenly',
});

const Arrow = ({
  parentId,
  childId,
}: {
  parentId: string;
  childId: string;
}) => <Xarrow start={parentId} end={childId} path="straight" />;

export const Graph = ({ graph: { areas, goals, keyResults } }: Props) => {
  return (
    <div css={container}>
      <div css={column}>
        {areas.map((area) => (
          <div key={area.id}>
            <AreaNode node={area} />
            {area.children.map((childId) => (
              <Arrow
                key={`${area.id}-${childId}`}
                parentId={area.id}
                childId={childId}
              />
            ))}
          </div>
        ))}
      </div>
      <div css={column}>
        {goals.map((goal) => (
          <div key={goal.id}>
            <GoalNode node={goal} />
            {goal.children.map((childId) => (
              <Arrow
                key={`${goal.id}-${childId}`}
                parentId={goal.id}
                childId={childId}
              />
            ))}
          </div>
        ))}
      </div>
      <div css={column}>
        {keyResults.map((keyResult) => (
          <KeyResultNode key={keyResult.id} node={keyResult} />
        ))}
      </div>
    </div>
  );
};
