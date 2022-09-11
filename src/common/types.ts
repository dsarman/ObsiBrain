import { View } from 'obsidian';
import { Literal, SMarkdownPage } from 'obsidian-dataview';

export type Property = { name: string; value: string | boolean };
export type ObsidianHTMLElement = View['containerEl'];
export type DataViewPage = SMarkdownPage;
