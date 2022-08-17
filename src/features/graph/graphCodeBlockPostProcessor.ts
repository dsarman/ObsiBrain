import { MarkdownPostProcessorContext } from 'obsidian';
import {
  DataArray,
  DataviewApi,
  getAPI,
  Link,
  Literal,
} from 'obsidian-dataview';
import { ForceGraph } from './graph-view';
import { createSankey } from './sankey';

type DataViewPage = Record<string, Literal> & { file: any };

const FOCUSED_FIELD = 'Focused In::';

const isFocusedField = (line: string) => {
  return line.startsWith(FOCUSED_FIELD);
};

const _isFocusedLink = (link: Link, name: string) => {
  return link.path.endsWith(`${name}.md`);
};

const isFocused = (area: DataViewPage, name: string, api: DataviewApi) => {
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

export const graphCodeBlockPostProcessor = (
  source: string,
  el: HTMLElement,
  ctx: MarkdownPostProcessorContext
): Promise<any> | void => {
  const api = getAPI();
  if (!api) return;

  const sourceFile = api.page(ctx.sourcePath) as DataViewPage;
  if (!sourceFile) return;

  console.log(sourceFile);

  const noteDay = sourceFile?.file?.day;
  if (!noteDay) return;

  const nodes: { id: string; group: number; path: string }[] = [];

  const currentQ = noteDay.toFormat("kkkk-'Q'q");
  const areas = api.pages(
    '"💿 Databases/🏰 Areas Of Competence"'
  ) as DataArray<DataViewPage>;
  areas
    .filter(
      (area) => isFocused(area, currentQ, api) && !area.file.path.contains('✅')
    )
    .forEach((p) => {
      nodes.push({ id: p.file.name, group: 1, path: p.file.path });
    });

  const links: { source: string; target: string; value: number }[] = [];

  const goalKeyResultsCount: Map<string, number> = new Map();

  const currentWeek = noteDay.toFormat("kkkk-'W'W");
  const keyResults = api.pages(
    '"💿 Databases/💎 Key Results"'
  ) as DataArray<DataViewPage>;
  keyResults
    .filter(
      (keyResult) =>
        isFocused(keyResult, currentWeek, api) &&
        !keyResult.file.path.contains('✅')
    )
    .forEach((keyResult) => {
      if (api.value.isLink(keyResult.goal)) {
        const goalPage = api.page(keyResult.goal.path) as DataViewPage;
        links.push({
          source: goalPage.file.name,
          target: keyResult.file.name,
          value: 1,
        });

        const keyResultCount = goalKeyResultsCount.get(goalPage.file.name) ?? 0;
        goalKeyResultsCount.set(goalPage.file.name, keyResultCount + 1);
      }

      nodes.push({
        id: keyResult.file.name,
        group: 3,
        path: keyResult.file.path,
      });
    });

  const currentMonth = noteDay.toFormat('kkkk-LL');
  const goals = api.pages('"💿 Databases/🚀 Goals"') as DataArray<DataViewPage>;
  goals
    .filter(
      (goal) =>
        isFocused(goal, currentMonth, api) && !goal.file.path.contains('✅')
    )
    .forEach((goal) => {
      if (api.value.isLink(goal.area)) {
        const areaPage = api.page(goal.area.path) as DataViewPage;
        const value = goalKeyResultsCount.get(goal.file.name) ?? 1;
        links.push({
          target: goal.file.name,
          source: areaPage.file.name,
          value,
        });
      }
      nodes.push({ id: goal.file.name, group: 2, path: goal.file.path });
    });

  const svg = createSankey({ nodes, links });
  el.append(svg);
};
