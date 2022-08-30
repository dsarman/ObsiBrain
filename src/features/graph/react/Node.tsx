/** @jsxImportSource @emotion/react */
import * as React from 'react';
import { css } from '@emotion/react';
import { ObsidianLink } from '../../cards/ObsidianLink';
import { INode } from './graphTypes';

interface Props {
  node: INode;
  className?: string;
}

const container = css({
  background: 'white',
  width: 'fit-content',
  height: 'fit-content',
  padding: 12,
  marginLeft: 24,
  marginRight: 24,
  marginTop: 12,
  marginBottom: 12,
  borderRadius: 4,
});

export const Node = ({ node, className }: Props) => {
  return (
    <div css={container} id={node.id}>
      <ObsidianLink
        className={className}
        label={node.name}
        filePath={node.filePath}
      />
    </div>
  );
};

const areaTitle = css({
  fontSize: 'larger',
  whiteSpace: 'nowrap',
});

export const AreaNode = (args: Props) => {
  return <Node css={areaTitle} {...args} />;
};

const goalTitle = css({
  fontSize: 'large',
});

export const GoalNode = (args: Props) => {
  return <Node css={goalTitle} {...args} />;
};

export const KeyResultNode = (args: Props) => {
  return <Node {...args} />;
};
