import { AreaPage, GoalPage, Page } from '../features/cards/CardTypes';
import { faker } from '@faker-js/faker';
import { capitalize, toInteger } from 'lodash';
import { INode } from '../features/graph/react/graphTypes';

// Cards

const keyResultFake = (): Page => ({
  name: `💎 ${capitalize(faker.hacker.phrase())}`,
  filePath: faker.system.filePath(),
});

const goalFake = (): GoalPage => ({
  name: `🚀 ${capitalize(faker.hacker.verb())}`,
  filePath: faker.system.filePath(),
  subPages: [keyResultFake(), keyResultFake()],
});

export const areaFake = (): AreaPage => ({
  name: `${capitalize(faker.word.adverb())} ${faker.word.adjective()}`,
  filePath: faker.system.filePath(),
  status: 'specified',
  subPages: [goalFake(), goalFake()],
});

// Nodes

export const keyResultNodeFake = (): INode => ({
  id: faker.random.numeric(20),
  name: `💎 ${capitalize(faker.hacker.phrase())}`,
  filePath: faker.system.filePath(),
  children: [],
  order: toInteger(faker.random.numeric()),
});

export const goalNodeFake = (): INode => ({
  id: faker.random.numeric(20),
  name: `🚀 ${capitalize(faker.hacker.verb())}`,
  filePath: faker.system.filePath(),
  children: [],
  order: toInteger(faker.random.numeric()),
});

export const areaNodeFake = (): INode => ({
  id: faker.random.numeric(20),
  name: `${capitalize(faker.word.adverb())} ${faker.word.adjective()}`,
  filePath: faker.system.filePath(),
  children: [],
  order: toInteger(faker.random.numeric()),
});
