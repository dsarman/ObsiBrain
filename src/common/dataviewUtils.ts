import { DataviewApi, Link, Literal } from 'obsidian-dataview';
import { DataViewPage } from './types';
import { INode } from '../features/graph/react/graphTypes';

const FOCUSED_FIELD = 'Focused In::';

const isFocusedField = (line: string) => {
  return line.startsWith(FOCUSED_FIELD);
};
const _isFocusedLink = (link: Link, name: string) => {
  return link.path.endsWith(`${name}.md`);
};

export const isFocused = (
  area: DataViewPage,
  name: string,
  api: DataviewApi
) => {
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

const processSingleLink = (
  field: Literal,
  nodes: INode[],
  id: string,
  api: DataviewApi
): number => {
  if (api.value.isLink(field)) {
    const node = nodes.find((area) => area.filePath === field.path);
    if (node) {
      node.children.push(id);
      return node.order;
    }
  }
  return 0;
};

export const processField = (
  field: Literal,
  nodes: INode[],
  id: string,
  api: DataviewApi
): number => {
  let order = 0;
  if (api.value.isArray(field)) {
    field.forEach((fieldValue) => {
      const fieldOrder = processSingleLink(fieldValue, nodes, id, api);
      order = Math.max(order, fieldOrder);
    });
  } else {
    order = processSingleLink(field, nodes, id, api);
  }
  return order;
};
