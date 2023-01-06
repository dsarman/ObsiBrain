import { DataviewApi } from 'obsidian-dataview';
import { atom } from 'jotai';
import { IGraph } from 'features/graph/graphTypes';
import { Component, MarkdownPostProcessorContext } from 'obsidian';

interface MarkdownContext extends MarkdownPostProcessorContext {
  filename?: string;
}

export const dvApiAtom = atom<DataviewApi | undefined>(undefined);
export const markdownContextAtom = atom<MarkdownContext | undefined>(undefined);
export const graphAtom = atom<IGraph | undefined>(undefined);
export const onlyTodayAtom = atom<boolean>(false);
export const sourceAtom = atom<string>('defaultSource');
export const componentAtom = atom<Component | undefined>(undefined);
