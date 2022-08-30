import { App, Plugin, PluginSettingTab, Setting, Vault } from 'obsidian';
import { newTasksLivePreview } from 'features/tasks/TasksLivePreview';
import { Task } from 'features/tasks/Task';
import { graphCodeBlockPostProcessor } from './features/graph/graphCodeBlockPostProcessor';
import { cardsCodeBlockPostProcessor } from './features/cards/cardsCodeBlockPostProcessor';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  mySetting: 'default',
};

export default class MyPlugin extends Plugin {
  settings!: MyPluginSettings;

  public taskFromLine(checked: boolean, line: string, vault: Vault) {
    return Task.fromLine(`- [${checked ? 'x' : ' '}] ${line}`, vault);
  }

  async onload() {
    await this.loadSettings();

    // This adds a settings tab so the user can configure various aspects of the plugin
    // eslint-disable-next-line no-use-before-define
    this.addSettingTab(new SampleSettingTab(this.app, this));

    this.registerMarkdownCodeBlockProcessor(
      'sb-graph',
      graphCodeBlockPostProcessor
    );

    this.registerMarkdownCodeBlockProcessor(
      'sb-cards',
      cardsCodeBlockPostProcessor(this.app)
    );

    this.registerEditorExtension(newTasksLivePreview(this.app.vault));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  onunload() {}
}

class SampleSettingTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' });

    new Setting(containerEl)
      .setName('Setting #1')
      .setDesc("It's a secret")
      .addText((text) =>
        text
          .setPlaceholder('Enter your secret')
          .setValue(this.plugin.settings.mySetting)
          .onChange(async (value) => {
            console.log('Secret: ' + value);
            this.plugin.settings.mySetting = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
