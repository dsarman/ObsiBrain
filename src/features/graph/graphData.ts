import { DataArray, DataviewApi } from 'obsidian-dataview';
import {
  IGoalNode,
  IGraph,
  IKeyResultNode,
  INode,
  ITask,
  NoteDateKind,
} from 'features/graph/graphTypes';
import { DataViewPage } from 'common/types';
import { sb } from 'common/loggingUtils';
import {
  isComplete,
  isFocused,
  MONTH_FORMAT,
  processField,
  WEEK_FORMAT,
} from 'common/dataviewUtils';
import { notNull } from 'common/utilities';
import { DateTime } from 'luxon';

const nodeComparator = (a: INode<unknown>, b: INode<unknown>) =>
  b.order - a.order;

const fetchData = (api: DataviewApi, filePath: string) => {
  const noteFile = api.page(filePath) as DataViewPage;
  if (!noteFile) {
    console.error(sb(`Could not find note file with path ${filePath}`));
    return null;
  }
  let noteType: NoteDateKind | null = null;
  const dailyDate = noteFile.file.day;
  let noteDay: DateTime | null = null;
  if (dailyDate?.isValid) {
    noteDay = dailyDate;
    noteType = 'daily';
  } else {
    const weekDay = api.luxon.DateTime.fromFormat(
      noteFile.file.name,
      WEEK_FORMAT
    );
    if (weekDay.isValid) {
      noteDay = weekDay;
      noteType = 'weekly';
    } else {
      const monthDate = api.luxon.DateTime.fromFormat(
        noteFile.file.name,
        MONTH_FORMAT
      );
      if (monthDate.isValid) {
        noteDay = monthDate;
        noteType = 'monthly';
      }
    }
  }

  if (!noteDay || !noteType) {
    console.error(sb(`File ${filePath} is not a day note.`));
    return null;
  }

  const unit = noteType === 'monthly' ? 'month' : 'week';

  const currentQ = noteDay.startOf(unit).toFormat("yyyy-'Q'q");
  const currentMonth = noteDay.startOf(unit).toFormat(MONTH_FORMAT);
  const currentWeek = noteDay.startOf(unit).toFormat(WEEK_FORMAT);

  const areas = (
    api.pages(
      '"💿 Databases/🏰 Areas Of Competence"'
    ) as DataArray<DataViewPage>
  ).filter((area) => isFocused(area, currentQ, api) && !isComplete(area));

  let goals = (
    api.pages('"💿 Databases/🚀 Goals"') as DataArray<DataViewPage>
  ).filter((goal) => !isComplete(goal));
  if (noteType !== 'monthly') {
    goals = goals.filter((goal) => isFocused(goal, currentMonth, api));
  }

  let goalPaths: string[] = [];
  if (noteType === 'weekly') {
    goalPaths = goals.map((goal) => goal.file.path).array();
  }

  const keyResults =
    noteType !== 'monthly'
      ? (
          api.pages('"💿 Databases/💎 Key Results"') as DataArray<DataViewPage>
        ).filter((keyResult) => {
          switch (noteType) {
            case 'daily':
              return (
                isFocused(keyResult, currentWeek, api) && !isComplete(keyResult)
              );
            case 'weekly':
              if (api.value.isLink(keyResult.Goal)) {
                return (
                  !isComplete(keyResult) &&
                  goalPaths.includes(keyResult.Goal.path)
                );
              } else {
                return false;
              }
            default:
              return false;
          }
        })
      : [];

  return { areas, goals, keyResults, noteDay, noteType };
};

export const getData = (api: DataviewApi, filePath: string): IGraph | null => {
  const rawData = fetchData(api, filePath);
  if (!rawData) return null;
  const { areas, goals, keyResults, noteDay, noteType } = rawData;

  // Create initial graph data with filled in areas
  const data: IGraph = {
    areas: areas.array().map((area, index) => ({
      id: `a-${index}`,
      name: area.file.name,
      filePath: area.file.path,
      order: index,
      children: [],
    })),
    goals: [],
    keyResults: [],
    date: DateTime.now(),
    type: noteType,
  };

  // Add goals to the graph while computing order from a parent area
  goals.forEach((goal, index) => {
    const id = `g-${index}`;
    const mappedGoal: IGoalNode = {
      id,
      name: goal.file.name,
      filePath: goal.file.path,
      order: index,
      children: [],
    };
    mappedGoal.order = processField(goal.area, data.areas, mappedGoal, api);
    data.goals.push(mappedGoal);
  });

  // Compute if given key result is scheduled today
  keyResults.forEach((keyResult, index) => {
    const id = `k-${index}`;
    const mappedKeyResult: IKeyResultNode = {
      id,
      name: keyResult.file.name,
      filePath: keyResult.file.path,
      order: index,
      children: [],
    };
    const order = processField(
      keyResult.goal,
      data.goals,
      mappedKeyResult,
      api
    );
    let isKeyResultToday = false;
    const tasks: ITask[] = keyResult.file.tasks
      .filter((task) => !task.completed)
      .map((task, index) => {
        const scheduled = task['🗓'];
        if (api.value.isLink(scheduled)) {
          const scheduledPage = api.page(scheduled.path) as DataViewPage;
          const scheduledOn = scheduledPage?.file?.day;
          const isToday = !!scheduledOn && !!noteDay && scheduledOn <= noteDay;
          isKeyResultToday = isToday || isKeyResultToday;
          return {
            completed: task.completed,
            scheduled: scheduledOn,
            isToday,
            data: task,
          };
        } else {
          return {
            completed: task.completed,
            isToday: false,
            data: task,
          };
        }
        return null;
      })
      .filter(notNull);

    mappedKeyResult.order = isKeyResultToday ? order * 1000 : order;
    mappedKeyResult.children = tasks;
    data.keyResults.push(mappedKeyResult);
  });

  // "Backpropagate" the correct order from key results to goals, taking into account if a key result is scheduled today (= ordered on top)
  data.keyResults.forEach((keyResult) => {
    const goal = data.goals.find(
      (goal) => !!goal.children.find((child) => child.id === keyResult.id)
    );
    if (!goal) return;

    const order = Math.max(goal.order, keyResult.order);
    goal.order = order;
    keyResult.order = order;
  });

  // "Backpropagate" correct order from goals to areas
  data.goals.forEach((goal) => {
    const area = data.areas.find(
      (area) => !!area.children.find((child) => child.id === goal.id)
    );
    if (!area) return;

    const order = Math.max(goal.order, area.order);
    goal.order = order;
    area.order = order;
  });

  return {
    areas: data.areas.sort(nodeComparator),
    goals: data.goals.sort(nodeComparator),
    keyResults: data.keyResults.sort(nodeComparator),
    date: noteDay,
    type: data.type,
  };
};

export const filterGraphByKeyResult = (
  graph: IGraph,
  findFunc: (keyResult: IKeyResultNode) => boolean
): IGraph => {
  const result: IGraph = {
    areas: [],
    goals: [],
    keyResults: [],
    type: graph.type,
    date: graph.date,
  };
  const includedKeyResult: string[] = [];

  graph.keyResults.forEach((keyResult) => {
    const todayTask = findFunc(keyResult);
    if (todayTask) {
      result.keyResults.push(keyResult);
      includedKeyResult.push(keyResult.id);
    }
  });

  const includedGoals: string[] = [];
  graph.goals.forEach((goal) => {
    const onlyIncluded = goal.children.filter((keyResult) =>
      includedKeyResult.includes(keyResult.id)
    );
    if (onlyIncluded.length > 0) {
      result.goals.push({ ...goal, children: onlyIncluded });
      includedGoals.push(goal.id);
    }
  });

  graph.areas.forEach((area) => {
    const onlyIncluded = area.children.filter((goal) =>
      includedGoals.includes(goal.id)
    );
    if (onlyIncluded.length > 0) {
      result.areas.push({ ...area, children: onlyIncluded });
    }
  });

  return result;
};

export const filterGraphByGoals = (
  graph: IGraph,
  findFunc: (goal: IGoalNode) => boolean
): IGraph => {
  const result: IGraph = {
    areas: [],
    goals: [],
    keyResults: [],
    type: graph.type,
    date: graph.date,
  };

  const includedGoals: string[] = [];
  for (const goal of graph.goals) {
    const found = findFunc(goal);
    if (found) {
      includedGoals.push(goal.id);
      result.goals.push(goal);
    }
  }

  for (const area of graph.areas) {
    const isIncluded = includedGoals.find(
      (goalId) => !!area.children.find((goal) => goal.id === goalId)
    );
    if (isIncluded) {
      result.areas.push(area);
    }
  }

  return result;
};

export const filterOutDuplicateGoals = (graph: IGraph): IGraph => {
  const seenGoalIds: string[] = [];

  graph.areas.forEach((area) => {
    area.children.forEach((goal) => {
      const alreadyIncluded = seenGoalIds.includes(goal.id);
      if (!alreadyIncluded) {
        goal.displayParentId = area.id;
        seenGoalIds.push(goal.id);
      }
    });
  });

  return graph;
};
