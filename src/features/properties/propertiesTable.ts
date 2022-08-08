import { getAPI, Link } from 'obsidian-dataview';
import { App, Component, Events, TAbstractFile, TFile, Vault } from 'obsidian';
import { ObsidianHTMLElement } from 'common/types';

const addNewButton = (
  file: TAbstractFile,
  container: ObsidianHTMLElement,
  vault: Vault
) => {
  const btn = container.createEl('button', {
    text: '+ Create New',
  });
  console.log(container);
  btn.addEventListener('click', async (event) => {
    console.log('Clicked button');
    const templateFile = vault.getAbstractFileByPath(
      '💾 Templates/💎 Key Result Template.md'
    );
    if (!templateFile || !(templateFile instanceof TFile)) return;
    const templateContent = await vault.read(templateFile);
    console.log(templateContent);
    const newKeyResult = await vault.create(
      '💿 Databases/💎 Key Results/New Key Result.md',
      `${templateContent}\nGoal:: [[${file.name}]]\n`
    );
    console.log(newKeyResult);
  });
};

export const addPropertiesTable = (
  app: App,
  source: string,
  container: ObsidianHTMLElement,
  component: Component,
  filePath: string
) => {
  const api = getAPI(app);
  if (!api) return;

  const currentPage = api.page(filePath);
  if (!currentPage) return;

  const fileInlinks = currentPage.file.inlinks.filter(
    (link: Link) => link.type === 'file'
  );
  console.log(fileInlinks);
  container.createEl('h3', { text: 'Unfinished Key Results' });
  const listContainer = container.createEl('div');
  const file = app.vault.getAbstractFileByPath(filePath);
  if (!file) return;

  addNewButton(file, container, app.vault);

  api.list(fileInlinks, listContainer, component, filePath);
};
