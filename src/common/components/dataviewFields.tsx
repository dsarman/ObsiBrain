/** @jsxImportSource @emotion/react */
import * as React from 'react';
import { PropsWithChildren } from 'react';
import { ObsidianLink } from 'common/components/ObsidianLink';
import { DAY_FORMAT } from 'common/dataviewUtils';
import { css } from '@emotion/react';
import { BlockParamNames, CompletedOnBlock, DueBlock, RecurringBlock } from 'features/tasks/blockTypes';
import { recurringText } from 'features/tasks/rendering';

const key = css({
  paddingInlineStart: 8,
  fontSize: 'calc(var(--font-adaptive-normal) - 2px)',
  color: 'var(--text-muted)',
});

const container = css({
  paddingInline: 8,
});

interface DvFieldProps extends PropsWithChildren {
  field: CompletedOnBlock | DueBlock | RecurringBlock;
}

const DvField = ({ field, children }: DvFieldProps) => {
  return (
    <span css={container}>
      {BlockParamNames.fromBlock(field)}
      <span css={key}>{children}</span>
    </span>
  );
};

interface DvLinkFieldProps {
  field: CompletedOnBlock | DueBlock;
  filePath: string;
}

export const DvLinkField = ({ field, filePath }: DvLinkFieldProps) => {
  return (
    <DvField field={field}>
      <ObsidianLink
        label={field.date?.toFormat(DAY_FORMAT) ?? ''}
        filePath={filePath}
      />
    </DvField>
  );
};

interface DvRecurrenceFieldProps extends PropsWithChildren {
  field: RecurringBlock;
}

export const DvRecurrenceField = ({ field }: DvRecurrenceFieldProps) => {
  return (
    <DvField field={field}>
      <span>{recurringText(field)}</span>
    </DvField>
  );
};
