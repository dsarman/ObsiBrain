import Xarrow from 'react-xarrows';
import * as React from 'react';

export const Arrow = ({
  parentId,
  childId,
}: {
  parentId: string;
  childId: string;
}) => <Xarrow start={parentId} end={childId} path="straight" zIndex={-1} />;
