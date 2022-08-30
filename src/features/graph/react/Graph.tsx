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

export const Graph = ({ graph: { areas, goals, keyResults } }: Props) => {
  return (
    <div css={container}>
      <div css={column}>
        {areas.map((area) => (
          <>
            <AreaNode key={area.id} node={area} />
            {area.children.map((childId) => (
              <Xarrow
                key={`${area.id}-${childId}`}
                start={area.id}
                end={childId}
                curveness={0}
              />
            ))}
          </>
        ))}
      </div>
      <div css={column}>
        {goals.map((goal) => (
          <>
            <GoalNode key={goal.id} node={goal} />
            {goal.children.map((childId) => (
              <Xarrow
                key={`${goal.id}-${childId}`}
                start={goal.id}
                end={childId}
                path="straight"
              />
            ))}
          </>
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
