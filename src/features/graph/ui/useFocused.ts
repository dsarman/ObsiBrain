import { useAtomValue } from 'jotai';
import { dvApiAtom, graphAtom, markdownContextAtom } from 'common/state';
import React from 'react';
import { INode, ITask, NoteDateKind } from 'features/graph/graphTypes';
import {
  changeTaskDate,
  MONTH_FORMAT,
  toggleFocus,
  WEEK_FORMAT,
} from 'common/dataviewUtils';
import { DateTime } from 'luxon';
import { isFocused as isPageFocused } from 'common/dataviewUtils';

export const useFocused = <T>(node: INode<T>) => {
  const graph = useAtomValue(graphAtom);
  const graphDate = graph?.date ?? null;
  const dvApi = useAtomValue(dvApiAtom);
  const markdownContext = useAtomValue(markdownContextAtom);
  const [isFocused, setIsFocused] = React.useState<
    boolean | ITask | undefined
  >();

  React.useEffect(() => {
    if (graph?.type === 'daily') {
      const children = node.children as unknown as ITask[];
      setIsFocused(children.find((task) => task.isToday));
      return;
    } else if (graph?.type === 'monthly' || graph?.type === 'weekly') {
      if (!markdownContext || !dvApi) return;
      const namedMatch = markdownContext.sourcePath.match(/.+\/(.+).md$/);
      if (namedMatch)
        setIsFocused(isPageFocused(node.filePath, namedMatch[1], dvApi));
      return;
    }
  }, [node.children, node.filePath, graph?.type, dvApi, markdownContext]);

  const onStarClick = React.useCallback(() => {
    if (!dvApi || !graphDate) return;
    if (graph?.type === 'daily') {
      if (!isFocused || typeof isFocused === 'boolean') return;
      changeTaskDate(isFocused.data, null, 'due', dvApi.app.vault);
      return;
    } else if (graph?.type === 'weekly' || graph?.type === 'monthly') {
      const format = graph?.type === 'weekly' ? WEEK_FORMAT : MONTH_FORMAT;
      setIsFocused((prevState) => !prevState);
      toggleFocus(
        dvApi,
        node.filePath,
        !!isFocused,
        graphDate.toFormat(format)
      );
      return;
    }
  }, [node.filePath, graph?.type, dvApi, graphDate, isFocused]);

  const onOutlineStarClick = React.useCallback(() => {
    if (!dvApi || !graphDate) return;
    if (graph?.type === 'daily') {
      const children = node.children as unknown as ITask[];
      const firstIncomplete = children.find(
        (task) => !task.completed && !task.isToday
      );
      if (firstIncomplete) {
        changeTaskDate(
          firstIncomplete.data,
          DateTime.now(),
          'due',
          dvApi.app.vault
        );
      }
      return;
    } else if (graph?.type === 'weekly' || graph?.type === 'monthly') {
      setIsFocused((prevState) => !prevState);
      const format = graph?.type === 'weekly' ? WEEK_FORMAT : MONTH_FORMAT;
      toggleFocus(
        dvApi,
        node.filePath,
        !!isFocused,
        graphDate.toFormat(format)
      );
      return;
    }
  }, [node.children, node.filePath, graph?.type, dvApi, graphDate, isFocused]);

  return React.useMemo(
    () => ({ isFocused, onStarClick, onOutlineStarClick }),
    [isFocused, onOutlineStarClick, onStarClick]
  );
};
