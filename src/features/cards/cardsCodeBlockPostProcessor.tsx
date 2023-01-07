import * as React from 'react';
import { App, MarkdownPostProcessorContext } from 'obsidian';
import { DataArray, DataviewApi, getAPI } from 'obsidian-dataview';
import { AreaPage } from './cardTypes';
import { sb } from 'common/loggingUtils';
import { DataViewPage } from 'common/types';
import { isComplete, isFocused } from 'common/dataviewUtils';
import { AreaCard } from './AreaCard';
import { ReactRenderChild } from 'src/features/graph/ui/ReactRenderChild';

const getData = (api: DataviewApi, filePath: string): AreaPage[] => {
  const noteFile = api.page(filePath) as DataViewPage;
  if (!noteFile) {
    console.error(sb(`Could not find note file with path ${filePath}`));
    return [];
  }
  const noteDay = noteFile.file.day;
  if (!noteDay) {
    console.error(sb(`File ${filePath} is not a day note.`));
    return [];
  }

  const currentQ = noteDay.toFormat("kkkk-'Q'q");
  const currentMonth = noteDay.toFormat('kkkk-LL');
  const currentWeek = noteDay.toFormat("kkkk-'W'W");

  const areas = (
    api.pages(
      '"💿 Databases/🏰 Areas Of Competence"'
    ) as DataArray<DataViewPage>
  ).filter((area) => isFocused(area, currentQ, api) && !isComplete(area));

  const goals = (
    api.pages('"💿 Databases/🚀 Goals"') as DataArray<DataViewPage>
  ).filter((goal) => isFocused(goal, currentMonth, api) && !isComplete(goal));

  const keyResults = (
    api.pages('"💿 Databases/💎 Key Results"') as DataArray<DataViewPage>
  ).filter(
    (keyResult) =>
      isFocused(keyResult, currentWeek, api) && !isComplete(keyResult)
  );

  const data: AreaPage[] = areas
    .map((area) => ({
      name: area.file.name,
      filePath: area.file.path,
      subPages: [],
    }))
    .array();

  goals.forEach((goal) => {
    if (!api.value.isLink(goal.area)) return;
    const area = data.find((area) => area.filePath === goal.area.path);
    if (!area) {
      console.error(sb(`Could not find area for goal ${goal.file.path}`));
      return;
    }

    const relatedKeyResults = keyResults
      .filter(
        (keyResult) =>
          api.value.isLink(keyResult.goal) &&
          keyResult.goal.path === goal.file.path
      )
      .map((keyResult) => ({
        name: keyResult.file.name,
        filePath: keyResult.file.path,
      }))
      .array();

    area.subPages.push({
      name: goal.file.name,
      filePath: goal.file.path,
      subPages: relatedKeyResults,
    });
  });

  return data;
};

export const cardsCodeBlockPostProcessor =
  (app: App) =>
  (
    source: string,
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext
  ): Promise<any> | void => {
    const api = getAPI(app);
    if (!api) {
      console.error(sb('Could not load dataview api'));
      return;
    }

    const pages = getData(api, ctx.sourcePath);

    const root = createRoot(el);
    root.render(
      <React.StrictMode>
        <div
          css={{
            display: 'flex',
            flexWrap: 'wrap',
            background: 'white',
            justifyContent: 'space-evenly',
            flexDirection: 'row',
          }}
        >
          {pages.map((area) => (
            <AreaCard area={area} key={area.filePath} />
          ))}
        </div>
      </React.StrictMode>
    );

    ctx.addChild(new ReactRenderChild(el, root));
  };
