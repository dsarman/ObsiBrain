import React, { useCallback, useEffect } from 'react';
import { Graph } from 'features/graph/ui/Graph';
import { useSetAtom } from 'jotai';
import {
  componentAtom,
  dvApiAtom,
  graphAtom,
  markdownContextAtom,
  sourceAtom,
} from 'common/state';
import { DataviewApi } from 'obsidian-dataview';
import { IGraph } from 'features/graph/graphTypes';
import { Component, MarkdownPostProcessorContext } from 'obsidian';
import { ArcherContainer } from 'react-archer';
import { ArcherContainerHandle } from 'react-archer/lib/ArcherContainer/ArcherContainer.types';
import { Xwrapper } from 'react-xarrows';

interface Props {
  source: string;
  graph: IGraph;
  dvApi: DataviewApi;
  markdownContext: MarkdownPostProcessorContext;
  component: Component;
}

export const GraphContainer = ({
  source,
  dvApi,
  graph,
  markdownContext,
  component,
}: Props) => {
  const setDvApi = useSetAtom(dvApiAtom);
  const setGraph = useSetAtom(graphAtom);
  const setContext = useSetAtom(markdownContextAtom);
  const setSource = useSetAtom(sourceAtom);
  const setComponent = useSetAtom(componentAtom);
  const archerRef = React.useRef<ArcherContainerHandle>(null);

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
    setComponent(component);
  }, [component, setComponent]);

  useEffect(() => {
    const filename = markdownContext.sourcePath.match(/.+\/(.+).md$/)?.[1];
    setContext({
      ...markdownContext,
      filename,
    });
  }, [markdownContext, setContext]);

  useEffect(() => {
    archerRef.current?.refreshScreen();
  }, []);

  const onUpdate = useCallback(() => {
    archerRef.current.refreshScreen();
  }, []);

  return (
    <Xwrapper>
      <ArcherContainer ref={archerRef}>
        <Graph onUpdate={onUpdate} />
      </ArcherContainer>
    </Xwrapper>
  );
};
