import { View } from 'obsidian';
import { Literal } from 'obsidian-dataview';

export type Property = { name: string; value: string | boolean };
export type ObsidianHTMLElement = View['containerEl'];
export type DataViewPage = Record<string, Literal> & { file: any };
