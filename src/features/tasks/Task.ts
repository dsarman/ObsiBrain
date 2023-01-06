import { DateTime, Duration } from 'luxon';
import { TFile, Vault } from 'obsidian';
import {
  Block,
  CheckboxBlock,
  CompletedOnBlock,
  DueBlock,
  RecurringBlock,
} from 'features/tasks/blockTypes';
import { parseBlocks } from 'features/tasks/parsing';
import { renderBlockToText } from 'features/tasks/rendering';
import { STask } from 'obsidian-dataview';

const TASK_PREFIX_PATTERN = /-\s\[(.)\]\s/;

interface TaskProps {
  blocks: Block[];
  vault: Vault;
}

export class Task {
  private blocks: Block[];
  private readonly checked: CheckboxBlock;
  private readonly due?: DueBlock;
  private readonly completedOn?: CompletedOnBlock;
  private readonly recurrence?: RecurringBlock;
  private readonly vault: Vault;

  constructor({ blocks, vault }: TaskProps) {
    this.blocks = blocks;
    this.checked = blocks.find(
      (block) => block.kind === 'checkbox'
    )! as CheckboxBlock;
    this.due = blocks.find((block) => block.kind === 'due') as DueBlock;
    this.completedOn = blocks.find(
      (block) => block.kind === 'completedOn'
    ) as CompletedOnBlock;
    this.recurrence = blocks.find(
      (block) => block.kind === 'recurring'
    ) as RecurringBlock;
    this.vault = vault;
  }

  public static fromLine(
    line: string,
    vault: Vault,
    task?: STask
  ): Task | null {
    const taskMatch = line.match(TASK_PREFIX_PATTERN);
    if (!taskMatch) return null;

    return new Task({
      blocks: parseBlocks(line, task),
      vault,
    });
  }

  // ---- Recurrence manipulation methods ----

  public async toggle(): Promise<Task> {
    console.log('Toggling task!!!!');
    if (!this.checked && this.recurrence) {
      const nextDueDate = this.getNextDueDate();
      const existingProps = this.toProps();
      if (!nextDueDate) return this;
      const newTask = new Task({
        ...existingProps,
        blocks: existingProps.blocks.map((block) => {
          if (block.kind !== 'due') return { ...block };
          const newDueBlock: DueBlock = { ...block, date: nextDueDate };
          return newDueBlock;
        }),
      });
      newTask.toggleCompletedOn();
      const logFile = this.vault.getAbstractFileByPath('🗄 Recurring Log.md');
      if (logFile instanceof TFile) {
        const oldLogContent = await this.vault.read(logFile);
        this.vault.modify(logFile, `${oldLogContent}\n${this.line()}`);
      }
      return newTask;
    }

    this.toggleCompletedOn();
    console.log(this);
    return this;
  }

  // ---- Task manipulation methods ----

  public line(): string {
    return this.blocks.map(renderBlockToText).join(' ');
  }

  public getBlocks(): Block[] {
    return [...this.blocks];
  }

  public getChecked(): CheckboxBlock {
    return this.checked;
  }

  public getDue(): DueBlock | undefined {
    return this.due;
  }

  public getRecurring(): RecurringBlock | undefined {
    return this.recurrence;
  }

  public getCompletedOn(): CompletedOnBlock | undefined {
    return this.completedOn;
  }

  public toProps(): TaskProps {
    return {
      blocks: this.blocks,
      vault: this.vault,
    };
  }

  private getNextDueDate(now = DateTime.now()): DateTime | null {
    if (!this.recurrence) return null;
    const startDate = this.recurrence.isStrict ? this.due?.date : now;
    if (!startDate) return null;

    switch (this.recurrence.period) {
      case 'day':
        return startDate.plus(
          Duration.fromObject({ days: this.recurrence.number })
        );
      case 'month':
        return startDate.plus(
          Duration.fromObject({ months: this.recurrence.number })
        );
    }
  }

  // ---- Task output/export methods ----

  private toggleCompletedOn() {
    console.log('Blocks were: ' + JSON.stringify(this.blocks));
    if (!this.checked.isChecked && !this.completedOn) {
      console.log('Was here');
      const completedOn: CompletedOnBlock = {
        kind: 'completedOn',
        date: DateTime.now(),
      };
      this.blocks.push(completedOn);
    }
    if (this.checked.isChecked && this.completedOn) {
      console.log('Was here !!!!!!!!');
      this.blocks = this.blocks.filter((block) => block.kind !== 'completedOn');
    }
    console.log('Blocks are: ' + JSON.stringify(this.blocks));

    this.checked.isChecked = !this.checked.isChecked;
  }
}
