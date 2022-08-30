import * as React from 'react';
import { AreaCard } from './AreaCard';

export const Cards = () => (
  <>
    {[1, 2, 3, 4].map(() => (
      <AreaCard />
    ))}
  </>
);
