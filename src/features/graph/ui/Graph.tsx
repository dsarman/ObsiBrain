import * as React from 'react';
import { useAtomValue } from 'jotai';
import { graphAtom } from 'common/state';
import { DailyGraph } from 'features/graph/ui/graphs/DailyGraph';
import { WeeklyGraph } from 'features/graph/ui/graphs/WeeklyGraph';
import { MonthlyGraph } from 'features/graph/ui/graphs/MonthlyGraph';

export const Graph = () => {
  const graphData = useAtomValue(graphAtom);
  if (!graphData) return null;

  switch (graphData.type) {
    case 'daily':
      return <DailyGraph graph={graphData} />;
    case 'weekly':
      return <WeeklyGraph graph={graphData} />;
    case 'monthly':
      return <MonthlyGraph graph={graphData} />;
    default:
      return <p>⛔️ Not implemented yet ⛔️</p>;
  }
};
