import * as React from 'react';
import { useAtomValue } from 'jotai';
import { graphAtom } from 'common/state';
import { DailyGraph } from 'features/graph/ui/DailyGraph';
import { WeeklyGraph } from 'features/graph/ui/WeeklyGraph';

export const Graph = () => {
  const graphData = useAtomValue(graphAtom);
  if (!graphData) return null;

  switch (graphData.type) {
    case 'daily':
      return <DailyGraph graph={graphData} />;
    case 'weekly':
      return <WeeklyGraph graph={graphData} />;
    default:
      return <p>⛔️ Not implemented yet ⛔️</p>;
  }
};
