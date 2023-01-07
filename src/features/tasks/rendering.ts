import {
  Block,
  BlockParamNames,
  RecurringBlock,
} from 'features/tasks/blockTypes';
import { DAY_FORMAT } from 'common/dataviewUtils';

export const renderBlockToText = (block: Block): string => {
  switch (block.kind) {
    case 'checkbox':
      return `- [${block.isChecked ? 'x' : ' '}]`;
    case 'text':
    case 'link':
      return block.text;
    case 'completedOn':
    case 'due':
      return ` [${BlockParamNames.fromBlock(block)}:: [[${block.date.toFormat(
        DAY_FORMAT
      )}]]]`;
    case 'recurring':
      return ` [${BlockParamNames.fromBlock(block)}:: ${recurringText(block)}]`;
  }
};

export const recurringText = (block: RecurringBlock): string => {
  return `every ${
    block.number > 1 ? `${block.number} ${block.period}s` : block.period
  }${block.isStrict ? '!' : ''}${block.logInPlace ? '@' : ''}`;
};
