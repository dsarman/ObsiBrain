/** @jsxImportSource @emotion/react */
import * as React from 'react';
import { AreaPage, Page } from './cardTypes';
import { css } from '@emotion/react';
import { GoalCard } from './GoalCard';
import { ObsidianLink } from './ObsidianLink';

interface Props {
  area: AreaPage;
}

const card = css`
  background: white;
  padding: 0 16px 16px 16px;
  border-width: 1px;
  border-style: solid;
  border-color: black;
  width: 500px;
  height: fit-content;
`;

const areaText = css`
  font-size: xx-large;
  margin-bottom: 0;
  margin-top: 12px;
  color: black;
`;

const goals = css`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

export const AreaCard = ({ area }: Props) => {
  return (
    <div css={card}>
      <ObsidianLink css={areaText} label={area.name} filePath={area.filePath} />
      <div css={goals}>
        {area.subPages.map((goal) => (
          <GoalCard key={goal.filePath} goal={goal} />
        ))}
      </div>
    </div>
  );
};
