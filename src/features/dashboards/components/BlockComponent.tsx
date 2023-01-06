import * as React from 'react';
import { useMemo } from 'react';
import { Block, CheckboxBlock, LinkBlock } from 'features/tasks/blockTypes';
import { ObsidianLink } from 'common/components/ObsidianLink';
import {
  DvLinkField,
  DvRecurrenceField,
} from 'common/components/dataviewFields';
import { useAtomValue } from 'jotai';
import { dvApiAtom } from 'common/state';
import { DataViewPage } from 'common/types';

interface BlockComponentProps {
  block: Block;
  onCheckboxChange?: () => void;
}

export const BlockComponent = ({
  block,
  onCheckboxChange,
}: BlockComponentProps) => {
  const dvApi = useAtomValue(dvApiAtom);

  switch (block.kind) {
    case 'checkbox':
      return (
        <CheckboxBlockComponent
          block={block}
          onCheckboxChange={onCheckboxChange}
        />
      );
    case 'text':
      return <span>{` ${block.text} `}</span>;
    case 'link':
      return <LinkBlockComponent block={block} />;
    case 'recurring':
      return <DvRecurrenceField field={block} />;
    case 'completedOn':
    case 'due':
      return <DvLinkField field={block} filePath={block.filePath ?? ''} />;
    default:
      console.error(
        'Could not render unknown block kind ' + JSON.stringify(block)
      );
      return <p>Not implemented yet</p>;
  }
};

interface CheckboxBlockComponentProps extends BlockComponentProps {
  block: CheckboxBlock;
}

const CheckboxBlockComponent = ({
  block,
  onCheckboxChange,
}: CheckboxBlockComponentProps) => {
  return (
    <input
      className="task-list-item-checkbox"
      type="checkbox"
      checked={block.isChecked}
      onChange={onCheckboxChange}
    />
  );
};

interface LinkBlockComponentProps {
  block: LinkBlock;
}

const LinkBlockComponent = ({ block }: LinkBlockComponentProps) => {
  const dvApi = useAtomValue(dvApiAtom);
  const filePath = useMemo(() => {
    if (!dvApi) return;
    const page = dvApi.page(block.text) as DataViewPage;
    return page.file.path;
  }, [block.text, dvApi]);

  return (
    <ObsidianLink label={block.alias ?? block.text} filePath={filePath ?? ''} />
  );
};
