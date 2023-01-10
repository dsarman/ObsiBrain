import React, { PropsWithChildren } from 'react';
import { css } from '@emotion/react';

const tasksContainer = css({
  backgroundColor: 'rgba(0,0,0,0.2)',
  padding: 20,
  borderRadius: 4,
});

export const TaskContainer = ({ children }: PropsWithChildren) => {
  return <div css={tasksContainer}>{children}</div>;
};
