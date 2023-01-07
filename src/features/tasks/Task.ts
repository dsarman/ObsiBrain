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
import { NEWLINE } from 'common/utilities';

const TASK_PREFIX_PATTERN = /-\s\[(.)\]\s/;

interface TaskData {
  path: string;
  line: number;
}

interface TaskProps {
  blocks: Block[];
  vault: Vault;
  data?: TaskData;
}

export class Task {
  private blocks: Block[];
  private readonly checkboxBlock: CheckboxBlock;
  private readonly due?: DueBlock;
  private readonly completedOn?: CompletedOnBlock;
  private readonly recurrence?: RecurringBlock;
  private readonly vault: Vault;
  private readonly data?: { path: string; line: number };

  constructor({ blocks, vault, data }: TaskProps) {
    this.blocks = blocks;
    this.checkboxBlock = blocks.find(
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
    this.data = data;
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
      data: task,
      vault,
    });
  }

  // ---- Recurrence manipulation methods ----

  public async toggle(): Promise<Task> {
    if (!this.checkboxBlock.isChecked && this.recurrence) {
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

      this.toggleCompletedOn();

      const logFilePath =
        this.recurrence.logInPlace && this.data?.path
          ? this.data.path
          : '🗄 Recurring Log.md';
      const logFile = this.vault.getAbstractFileByPath(logFilePath);
      if (logFile instanceof TFile) {
        const oldLogContent = await this.vault.read(logFile);

        let content: string | null = null;
        if (this.recurrence.logInPlace) {
          if (this.data?.line) {
            const contentByLines = oldLogContent.split(NEWLINE);
            content = [
              ...contentByLines.slice(0, this.data.line),
              newTask.line(),
              this.line(),
              ...contentByLines.slice(this.data.line + 1),
            ].join(NEWLINE);
          }
        } else {
          content = `${oldLogContent}\n${this.line()}`;
        }

        if (content) {
          this.vault.modify(logFile, content);
        }
      }
      return newTask;
    }

    this.toggleCompletedOn();
    return this;
  }

  // ---- Task manipulation methods ----

  public line(): string {
    return this.blocks.map(renderBlockToText).join(' ');
  }

  public getBlocks(): Block[] {
    return [...this.blocks];
  }

  public getCheckedBlock(): CheckboxBlock {
    return this.checkboxBlock;
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
      data: this.data,
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
    if (!this.checkboxBlock.isChecked && !this.completedOn) {
      const completedOn: CompletedOnBlock = {
        kind: 'completedOn',
        date: DateTime.now(),
      };
      this.blocks.push(completedOn);
    }
    if (this.checkboxBlock.isChecked && this.completedOn) {
      this.blocks = this.blocks.filter((block) => block.kind !== 'completedOn');
    }

    this.checkboxBlock.isChecked = !this.checkboxBlock.isChecked;
  }
}
