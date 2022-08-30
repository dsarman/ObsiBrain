/** @jsxImportSource @emotion/react */
import * as React from 'react';
import { GoalPage } from './cardTypes';
import { css } from '@emotion/react';
import { KeyResultCard } from './KeyResultCard';
import { ObsidianLink } from './ObsidianLink';

interface Props {
  goal: GoalPage;
}

const card = css`
  background: lightgray;
  padding-left: 16px;
  padding-right: 16px;
  margin: 4px;
  max-width: 200px;
  height: fit-content;
  border-radius: 4px;
  border-width: 1px;
  border-style: solid;
  border-color: black;
  & div:last-child {
    margin-bottom: 16px;
  }
`;

const goalTitle = css`
  font-size: large;
`;

export const GoalCard = ({ goal }: Props) => {
  return (
    <div css={card}>
      <ObsidianLink
        css={goalTitle}
        label={goal.name}
        filePath={goal.filePath}
      />
      <div>
        {goal.subPages.map((keyResult) => (
          <KeyResultCard key={keyResult.filePath} keyResult={keyResult} />
        ))}
      </div>
    </div>
  );
};
