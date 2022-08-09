import { EditorView, PluginValue, ViewPlugin } from '@codemirror/view';
import { Task } from 'features/tasks/Task';
import { Vault } from 'obsidian';

export const newTasksLivePreview = (vault: Vault) =>
  ViewPlugin.define((view) => new TasksLivePreview(view, vault));

class TasksLivePreview implements PluginValue {
  private readonly view: EditorView;
  public vault: Vault;

  constructor(view: EditorView, vault: Vault) {
    this.view = view;
    this.vault = vault;

    this.handleClickEvent = this.handleClickEvent.bind(this);
    this.view.dom.addEventListener('click', this.handleClickEvent);
  }

  public destroy() {
    this.view.dom.removeEventListener('click', this.handleClickEvent);
  }

  private handleClickEvent(event: MouseEvent): boolean {
    const { target } = event;

    if (
      !target ||
      !(target instanceof HTMLInputElement) ||
      target.type !== 'checkbox'
    ) {
      return false;
    }

    const { state } = this.view;
    const position = this.view.posAtDOM(target as Node);
    const line = state.doc.lineAt(position);
    const task = Task.fromLine(line.text, this.vault);
    if (!task) return false;

    event.preventDefault();

    task.toggle().then((task) => {
      const toggledString = task.line;

      const transaction = state.update({
        changes: {
          from: line.from,
          to: line.to,
          insert: toggledString,
        },
      });
      this.view.dispatch(transaction);

      const desiredCheckedStatus = task.checked;
      setTimeout(() => {
        target.checked = desiredCheckedStatus;
      }, 1);
    });

    return true;
  }
}
