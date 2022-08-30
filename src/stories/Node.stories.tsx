import {
  AreaNode as AreaNodeComponent,
  GoalNode as GoalNodeComponent,
  KeyResultNode as KeyResultNodeComponent,
  Node,
} from '../features/graph/react/Node';
import { ComponentMeta } from '@storybook/react';
import { areaNodeFake, goalNodeFake, keyResultNodeFake } from './fakes';
import * as React from 'react';

export default {
  title: 'Node',
  component: Node,
} as ComponentMeta<typeof Node>;

export const AreaNode = () => <AreaNodeComponent node={areaNodeFake()} />;

export const GoalNode = () => <GoalNodeComponent node={goalNodeFake()} />;

export const KeyResultNode = () => (
  <KeyResultNodeComponent node={keyResultNodeFake()} />
);
