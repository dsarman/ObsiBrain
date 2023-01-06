import { describe, expect, test } from '@jest/globals';
import { parseBlocks } from 'features/tasks/parsing';
import { CheckboxBlock, LinkBlock, RecurringBlock } from 'features/tasks/blockTypes';

const line1 =
  '- [ ] Přidat do seznamu dnešních úkolů [[Link name]] automaticky i habity [🗓:: [[2022-12-02]]] [🔁:: every day@] v 10:00';
const line2 =
  '- [x] Přidat do seznamu dnešních úkolů [[Link name|alias]] automaticky i habity [🗓:: [[2022-12-02]]] [🔁:: every 10 months!] ';

const emptyCheckbox: CheckboxBlock = {
  kind: 'checkbox',
  isChecked: false,
};
const checkedCheckbox = { ...emptyCheckbox, isChecked: true };

const link: LinkBlock = { kind: 'link', text: 'Link name', alias: undefined };
const linkWithAlias = { ...link, alias: 'alias' };

const dailyRecurring: RecurringBlock = {
  isStrict: false,
  number: 1,
  period: 'day',
  logInPlace: true,
  kind: 'recurring',
};
const monthly10Recurring: RecurringBlock = {
  isStrict: true,
  number: 10,
  period: 'month',
  logInPlace: false,
  kind: 'recurring',
};

describe('task block parsing module', () => {
  test('parses empty checkbox correctly', () => {
    const blocks = parseBlocks(line1);
    expect(blocks[0]).toStrictEqual(emptyCheckbox);
  });

  test('parses checked checkbox correctly', () => {
    const blocks = parseBlocks(line2);
    expect(blocks[0]).toStrictEqual(checkedCheckbox);
  });

  test('parses link correctly', () => {
    const blocks = parseBlocks(line1);
    expect(blocks[2]).toStrictEqual(link);
  });

  test('parses link with alias correctly', () => {
    const blocks = parseBlocks(line2);
    expect(blocks[2]).toStrictEqual(linkWithAlias);
  });

  //TODO tests for date parsing

  test('parses recurring daily dataview field correctly', () => {
    const blocks = parseBlocks(line1);
    expect(blocks[5]).toStrictEqual(dailyRecurring);
  });

  test('parses recurring 10 monthly strict dataview field correctly', () => {
    const blocks = parseBlocks(line2);
    expect(blocks[5]).toStrictEqual(monthly10Recurring);
  });
});
