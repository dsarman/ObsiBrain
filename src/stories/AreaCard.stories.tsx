import { AreaCard } from '../features/cards/AreaCard';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { areaFake } from './fakes';

export default {
  title: 'AreaCard',
  component: AreaCard,
} as ComponentMeta<typeof AreaCard>;

const Template: ComponentStory<typeof AreaCard> = (args) => (
  <AreaCard {...args} />
);

export const Default = Template.bind({});
Default.args = {
  area: areaFake(),
};
