import {
  Block,
  BlockParamNames,
  DvLinkFieldBlock,
  LinkBlock,
  RecurringBlock,
  TextBlock,
} from 'features/tasks/blockTypes';
import { DateTime } from 'luxon';
import { DAY_FORMAT } from 'common/dataviewUtils';
import { Link, STask } from 'obsidian-dataview';
import { TaskFields } from 'features/tasks/TaskFields';

const TASK_PREFIX_PATTERN = /^(\s*)-\s\[(.)]\s/;

export const parseBlocks = (line: string, task?: STask): Block[] => {
  const regexp = TASK_PREFIX_PATTERN.exec(line);

  if (!regexp) throw new Error('Could not parse task checkbox');
  const wholeMatch = regexp[0];
  const whitespaceMatch = regexp[1];
  const valueMatch = regexp[2];
  console.log('Taskbox match is');
  console.log(regexp);
  const result: Block[] = [
    {
      kind: 'checkbox',
      isChecked: valueMatch !== ' ',
      startChars: whitespaceMatch.length,
    },
  ];

  let currentIndex = wholeMatch.length;
  while (currentIndex < line.length) {
    const textBlockData = getText(line.slice(currentIndex));
    if (textBlockData) {
      const [textBlock, textLength] = textBlockData;
      result.push(textBlock);
      currentIndex += textLength;
      continue;
    }

    const linkBlockData = getLink(line.slice(currentIndex));
    if (linkBlockData) {
      const [linkBlock, linkLength] = linkBlockData;
      result.push(linkBlock);
      currentIndex += linkLength;
      continue;
    }

    const paramBlockData = getParamLinkBlock(line.slice(currentIndex), task);
    if (paramBlockData) {
      const [paramBlock, paramLength] = paramBlockData;
      result.push(paramBlock);
      currentIndex += paramLength;
      continue;
    }

    const textParamBlockData = getParamTextBlock(line.slice(currentIndex));
    if (textParamBlockData) {
      const [textParamBlock, paramLength] = textParamBlockData;
      result.push(textParamBlock);
      currentIndex += paramLength;
      continue;
    }

    throw Error(
      `Could not parse line ${line}. Stuck at index ${currentIndex} from ${
        line.length
      }, result ${JSON.stringify(result)}`
    );
  }

  return result;
};

const getText = (text: string): [TextBlock, number] | null => {
  const foundEndIndex = text.indexOf('[');
  const endIndex = foundEndIndex >= 0 ? foundEndIndex : undefined;
  const result = text.slice(0, endIndex);
  return result ? [{ kind: 'text', text: result.trim() }, result.length] : null;
};

const LINK_REGEX = /^\s*\[\[(?:(.*?)\|)?(.*?)?]]\s*/;
const getLink = (text: string): [LinkBlock, number] | null => {
  const regex = LINK_REGEX.exec(text);
  if (!regex || (!regex[1] && !regex[2])) return null;

  const linkName = regex[1] ?? regex[2];
  const alias = regex[1] ? regex[2] : undefined;

  return [{ kind: 'link', text: linkName, alias }, regex[0].length];
};

const DV_FIELD_REGEX = /^\s*\[(.+?)::\s\[\[(.+?)]]]\s*/;
const getParamLinkBlock = (
  text: string,
  task?: STask
): [DvLinkFieldBlock, number] | null => {
  const regex = DV_FIELD_REGEX.exec(text);
  if (!regex || !regex[2]) return null;

  const name = regex[1].trim();
  const kind =
    name === BlockParamNames.due
      ? 'due'
      : name === BlockParamNames.completedOn
      ? 'completedOn'
      : null;

  const file = (
    task
      ? kind === 'due'
        ? task[TaskFields.DUE]
        : kind === 'completedOn'
        ? task[TaskFields.COMPLETED_ON]
        : null
      : null
  ) as Link | null;
  const filePath = file ? file.path : undefined;

  return regex && regex[2] && kind
    ? [
        { kind, date: DateTime.fromFormat(regex[2], DAY_FORMAT), filePath },
        regex[0].length,
      ]
    : null;
};

const DV_TEXT_FIELD_REGEX = /^\s*\[(.+?)::\s(.+?)]\s*/;
const RECURRING_FIELD_REGEX = /every\s?(\d+)?\s(day|month)s?(!?)(@?)/;
const getParamTextBlock = (text: string): [RecurringBlock, number] | null => {
  const regex = DV_TEXT_FIELD_REGEX.exec(text);
  if (!regex || !regex[2] || regex[1] !== BlockParamNames.recurring)
    return null;

  const valueRegex = RECURRING_FIELD_REGEX.exec(regex[2]);
  if (!valueRegex) return null;

  const isStrict = valueRegex[3] === '!';

  const period =
    valueRegex[2] === 'day'
      ? 'day'
      : valueRegex[2] === 'month'
      ? 'month'
      : null;
  if (!period) return null;

  const number = valueRegex[1] ? Number(valueRegex[1]) : 1;
  const logInPlace = valueRegex[4] === '@';

  return [
    { kind: 'recurring', period, number, isStrict, logInPlace },
    regex[0].length,
  ];
};
