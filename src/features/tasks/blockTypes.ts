import { DateTime } from 'luxon';

export interface CheckboxBlock {
  kind: 'checkbox';
  isChecked: boolean;
  startChars: number;
}

export interface TextBlock {
  kind: 'text';
  text: string;
}

export interface LinkBlock {
  kind: 'link';
  text: string;
  alias?: string;
}

const completedOn = '✅';
const due = '🗓';
const recurring = '🔁';
export const BlockParamNames = {
  due,
  completedOn,
  recurring,
  fromBlock: (block: DueBlock | CompletedOnBlock | RecurringBlock) => {
    switch (block.kind) {
      case 'completedOn':
        return completedOn;
      case 'recurring':
        return recurring;
      case 'due':
        return due;
    }
  },
};

export interface DueBlock {
  kind: 'due';
  date: DateTime;
  filePath?: string;
}

export interface CompletedOnBlock {
  kind: 'completedOn';
  date: DateTime;
  filePath?: string;
}

export interface RecurringBlock {
  kind: 'recurring';
  period: 'day' | 'month';
  logInPlace: boolean;
  number: number;
  isStrict: boolean;
}

export type DvLinkFieldBlock = DueBlock | CompletedOnBlock;

export type Block =
  | CheckboxBlock
  | TextBlock
  | LinkBlock
  | DueBlock
  | CompletedOnBlock
  | RecurringBlock;
