import { DataviewApi, Link, Literal, STask } from 'obsidian-dataview';
import { DataViewPage } from './types';
import { INode } from 'features/graph/graphTypes';
import { TFile, Vault } from 'obsidian';
import { NEWLINE } from './utilities';
import { DateTime } from 'luxon';

const FOCUSED_FIELD = 'Focused In::';

const isFocusedField = (line: string) => {
  return line.startsWith(FOCUSED_FIELD);
};
const _isFocusedLink = (link: Link, name: string) => {
  return link.path.endsWith(`${name}.md`);
};

export const isFocused = (
  areaSource: DataViewPage | string,
  name: string,
  api: DataviewApi
) => {
  const area =
    typeof areaSource === 'string' ? api.page(areaSource) : areaSource;
  if (!area) return false;
  const focusedField = area['focused-in'];
  if (!focusedField) {
    return false;
  } else if (api.value.isArray(focusedField)) {
    return focusedField.some((link) => _isFocusedLink(link as Link, name));
  } else if (api.value.isLink(focusedField)) {
    return _isFocusedLink(focusedField, name);
  } else {
    console.error(
      `Could not determine type of field ${JSON.stringify(focusedField)}`
    );
    return false;
  }
};

export const isComplete = (page: DataViewPage) => page.file.path.contains('✅');

const processSingleLink = <T>(
  field: Literal,
  nodes: INode<T>[],
  childNode: T,
  api: DataviewApi
): number => {
  if (api.value.isLink(field)) {
    const node = nodes.find((area) => area.filePath === field.path);
    if (node) {
      node.children.push(childNode);
      return node.order;
    }
  }
  return 0;
};

export const processField = <T>(
  field: Literal,
  nodes: INode<T>[],
  childNode: T,
  api: DataviewApi
): number => {
  let order = 0;
  if (api.value.isArray(field)) {
    field.forEach((fieldValue) => {
      const fieldOrder = processSingleLink(fieldValue, nodes, childNode, api);
      order = Math.max(order, fieldOrder);
    });
  } else {
    order = processSingleLink(field, nodes, childNode, api);
  }
  return order;
};

const DUE_FIELD_REGEX = /\[🗓::\s*\[\[\d+-\d+-\d+]]]/g;

export const changeTaskDate = async (
  task: STask,
  newDate: DateTime | null,
  field: 'due' | 'completed',
  vault: Vault
) => {
  const abstractFile = vault.getAbstractFileByPath(task.path);
  if (abstractFile instanceof TFile) {
    const fileContent = await vault.read(abstractFile);
    const lines = fileContent.split(NEWLINE);
    const taskLine = lines[task.line];

    // We are deleting the scheduled field
    if (newDate === null) {
      lines[task.line] = taskLine.replace(DUE_FIELD_REGEX, '');
    }
    // We are adding or changing the date
    else {
      const updating = taskLine.includes('[🗓');
      const newValue = `[🗓:: [[${newDate.toFormat('yyyy-LL-dd')}]]]`;
      if (updating) {
        lines[task.line] = taskLine.replace(DUE_FIELD_REGEX, newValue);
      } else {
        lines[task.line] = `${taskLine} ${newValue}`;
      }
    }

    const modifiedContent = lines.join(NEWLINE);
    await vault.modify(abstractFile, modifiedContent);
  } else {
    console.error(`Task ${task} does not point to a valid Obsidian file`);
    return;
  }
};

export const toggleFocus = async (
  dv: DataviewApi,
  targetPath: string,
  isFocusedNow: boolean,
  sourceName: string
) => {
  const file = dv.app.vault.getAbstractFileByPath(targetPath);
  if (!file || !(file instanceof TFile)) return;
  const content = await dv.app.vault.read(file);
  const modifiedContent = content
    .split('\n')
    .map((line) => {
      if (!line.contains(FOCUSED_FIELD)) return line;
      const values = line
        .trim()
        .slice(FOCUSED_FIELD.length)
        .trim()
        .split(',')
        .filter((text) => text);
      if (isFocusedNow) {
        const filteredValues = values.filter((link) => {
          return link.trim() !== `[[${sourceName}]]`;
        });
        return `${FOCUSED_FIELD} ${filteredValues.join(',')}`;
      } else {
        return `${FOCUSED_FIELD} ${
          values.length > 0 ? `${values}, ` : ''
        }[[${sourceName}]]`;
      }
    })
    .join('\n');
  await dv.app.vault.modify(file, modifiedContent);
};
export const WEEK_FORMAT = "kkkk-'W'W";
export const MONTH_FORMAT = 'yyyy-MM';
