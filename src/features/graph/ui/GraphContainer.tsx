import React, { useEffect } from 'react';
import { Graph } from 'features/graph/ui/Graph';
import { useSetAtom } from 'jotai';
import {
  dvApiAtom,
  graphAtom,
  markdownContextAtom,
  sourceAtom,
} from 'common/state';
import { DataviewApi } from 'obsidian-dataview';
import { IGraph } from 'features/graph/graphTypes';
import { Xwrapper } from 'react-xarrows';
import { MarkdownPostProcessorContext } from 'obsidian';

interface Props {
  source: string;
  graph: IGraph;
  dvApi: DataviewApi;
  markdownContext: MarkdownPostProcessorContext;
}

export const GraphContainer = ({
  source,
  dvApi,
  graph,
  markdownContext,
}: Props) => {
  const setDvApi = useSetAtom(dvApiAtom);
  const setGraph = useSetAtom(graphAtom);
  const setContext = useSetAtom(markdownContextAtom);
  const setSource = useSetAtom(sourceAtom);

  useEffect(() => {
    setSource(source);
  }, [setSource, source]);

  useEffect(() => {
    setGraph(graph);
  }, [graph, setGraph]);

  useEffect(() => {
    setDvApi(dvApi);
  }, [dvApi, setDvApi]);

  useEffect(() => {
    const filename = markdownContext.sourcePath.match(/.+\/(.+).md$/)?.[1];
    setContext({
      ...markdownContext,
      filename,
    });
  }, [markdownContext, setContext]);

  return (
    <Xwrapper>
      <Graph />
    </Xwrapper>
  );
};
