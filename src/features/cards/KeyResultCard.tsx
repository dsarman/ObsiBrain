/** @jsxImportSource @emotion/react */
import * as React from 'react';
import { css } from '@emotion/react';
import { Page } from './cardTypes';

interface Props {
  keyResult: Page;
}

const card = css`
  background: lightslategray;
  padding-left: 12px;
  padding-right: 12px;
  margin: 4px;
  max-width: 200px;
  border-radius: 4px;
  border-width: 1px;
  border-style: solid;
  border-color: black;
`;

export const KeyResultCard = ({ keyResult }: Props) => {
  return (
    <div css={card}>
      <p>{keyResult.name}</p>
    </div>
  );
};
