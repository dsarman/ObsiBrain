import { DateTime, Duration } from 'luxon';
import { Events, TFile, Vault } from 'obsidian';

const TASK_PREFIX_PATTERN = /-\s\[(.)\]\s/;
const DAY_RECURRENCE_PATTERN = /every (\d+) days!?/;
const MONTH_RECURRENCE_PATTERN = /every (\d+) months!?/;
const TASK_START = '- [';

type PositionInfo<T> = {
  identifier: string;
  start: number;
  end: number;
  value: T | null;
} | null;
type RecurrenceType = 'day' | 'month';
interface RecurrenceValue {
  type: RecurrenceType;
  number: number;
  isStrict: boolean;
}
type DateField = PositionInfo<DateTime>;
type Recurrence = PositionInfo<RecurrenceValue>;
interface TaskProps {
  line: string;
  checked: boolean;
  due: DateField;
  completedOn: DateField;
  recurrence: Recurrence;
  vault: Vault;
}

export class Task {
  public line: string;
  public checked: boolean;
  public readonly due: DateField;
  public completedOn: DateField;
  public readonly recurrence: Recurrence;
  private vault: Vault;

  constructor({
    line,
    checked,
    completedOn,
    due,
    recurrence,
    vault,
  }: TaskProps) {
    this.line = line;
    this.checked = checked;
    this.due = due;
    this.completedOn = completedOn;
    this.recurrence = recurrence;
    this.vault = vault;
  }

  public static fromLine(line: string, vault: Vault): Task | null {
    const taskMatch = line.match(TASK_PREFIX_PATTERN);
    if (!taskMatch) return null;

    return new Task({
      line,
      checked: taskMatch[1] !== ' ',
      due: this.parseDate('🗓', line),
      recurrence: this.parseRecurrence('🔁', line),
      completedOn: this.parseDate('✅', line),
      vault,
    });
  }

  // ---- Input parsing methods ----

  private static parseField(
    identifier: string,
    line: string
  ): PositionInfo<string> {
    const fieldStart = `[${identifier}::`;
    const startIndex = line.indexOf(fieldStart);
    if (startIndex < 0) return null;

    const valueStartIndex = startIndex + fieldStart.length;

    let value = null;
    let offset = 0;
    let parenBuffer = 0;
    for (const char of line.slice(valueStartIndex)) {
      if (char === '[') {
        parenBuffer += 1;
      } else if (char === ']') {
        if (parenBuffer === 0) {
          value = line.slice(valueStartIndex, valueStartIndex + offset).trim();
        } else {
          parenBuffer -= 1;
        }
      }
      offset += 1;
      if (value !== null) break;
    }

    return value
      ? {
          start: valueStartIndex - fieldStart.length,
          end: valueStartIndex + offset,
          value: value,
          identifier,
        }
      : null;
  }

  private static parseDate(
    identifier: string,
    line: string
  ): PositionInfo<DateTime> {
    const dueField = this.parseField(identifier, line);
    if (!dueField) return null;

    let dueString = dueField.value;
    // If the due date is Wikilink, we want to extract the date inside
    if (dueString && dueString.startsWith('[[') && dueString.endsWith(']]')) {
      dueString = dueString.slice(2, dueString.length - 2);
    }

    return {
      ...dueField,
      value: dueString ? DateTime.fromISO(dueString) : null,
    };
  }

  private static parseRecurrence(identifier: string, line: string): Recurrence {
    const recurrenceField = this.parseField(identifier, line);
    if (!recurrenceField) return null;

    const isStrict = recurrenceField.value?.endsWith('!') ?? false;

    if (recurrenceField.value?.startsWith('every month')) {
      return {
        ...recurrenceField,
        value: { type: 'month', number: 1, isStrict },
      };
    }
    if (recurrenceField.value?.startsWith('every day')) {
      return {
        ...recurrenceField,
        value: { type: 'day', number: 1, isStrict },
      };
    }

    let valueType: RecurrenceType = 'day';
    let numberMatch = line.match(DAY_RECURRENCE_PATTERN);
    if (!numberMatch) {
      numberMatch = line.match(MONTH_RECURRENCE_PATTERN);
      valueType = 'month';
    }
    if (!numberMatch) return null;

    return {
      ...recurrenceField,
      value: { type: valueType, number: parseInt(numberMatch[1]), isStrict },
    };
  }

  // ---- Recurrence manipulation methods ----

  private getNextDueDate(now = DateTime.now()): DateTime | null {
    if (!this.recurrence || !this.recurrence.value) return null;
    const startDate = this.recurrence.value.isStrict ? this.due?.value : now;
    if (!startDate) return null;

    switch (this.recurrence.value.type) {
      case 'day':
        return startDate.plus(
          Duration.fromObject({ days: this.recurrence.value.number })
        );
      case 'month':
        return startDate.plus(
          Duration.fromObject({ months: this.recurrence.value.number })
        );
    }
  }

  // ---- Task manipulation methods ----

  private addCompleted() {
    if (!this.checked && !this.completedOn) {
      this.completedOn = {
        start: this.line.length + 1,
        end: this.line.length + 17,
        value: DateTime.now(),
        identifier: '✅',
      };
    }
    if (this.checked && this.completedOn) {
      this.completedOn = { ...this.completedOn, value: null };
    }

    this.checked = !this.checked;
    this.updateLine();
  }

  public async toggle(): Promise<Task> {
    if (!this.checked && this.recurrence) {
      const nextDueDate = this.getNextDueDate();
      const existingProps = this.toProps();
      if (!nextDueDate || !existingProps.due) return this;
      const newTask = new Task({
        ...existingProps,
        due: { ...existingProps.due, value: nextDueDate },
      });
      newTask.updateLine();
      this.addCompleted();
      const logFile = this.vault.getAbstractFileByPath('🗄 Recurring Log.md');
      if (logFile instanceof TFile) {
        const oldLogContent = await this.vault.read(logFile);
        this.vault.modify(logFile, `${oldLogContent}\n${this.line}`);
      }
      return newTask;
    }

    this.addCompleted();
    return this;
  }

  private updateLine() {
    const sortedPositions = [this.due, this.completedOn]
      .filter((pos) => !!pos)
      .sort((posA, posB) => posA!.start - posB!.start);
    const parts = [];

    const checkboxIndex = this.line.indexOf(TASK_START);
    parts.push(this.line.slice(0, checkboxIndex + TASK_START.length));
    parts.push(this.checked ? 'x' : ' ');
    let offset = checkboxIndex + TASK_START.length + 1;
    sortedPositions.forEach((pos) => {
      if (!pos) return;
      const { start, end, value, identifier } = pos;
      const prefixSlice = this.line.slice(offset, start);
      if (prefixSlice !== '\n') {
        parts.push(prefixSlice);
      }
      offset = end;
      if (value) {
        const spacePrefix =
          prefixSlice[prefixSlice.length - 1] === ' ' ? '' : ' ';
        parts.push(
          `${spacePrefix}[${identifier}:: [[${value.toFormat('yyyy-LL-dd')}]]]`
        );
      }
    });
    parts.push(this.line.slice(offset));

    this.line = parts.join('');
  }

  // ---- Task output/export methods ----

  public toProps(): TaskProps {
    return {
      due: this.due,
      recurrence: this.recurrence,
      checked: this.checked,
      line: this.line,
      completedOn: this.completedOn,
      vault: this.vault,
    };
  }

  /**
   * Returns task text without the status part (e.g. `- [ ]`)
   */
  public getText(): string {
    return this.line.trim().slice(5);
  }
}
