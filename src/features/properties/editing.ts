import { Property } from 'common/types';
import { TFile, Vault } from 'obsidian';
import { NEWLINE, PROPERTY_SEPARATOR } from 'features/properties/constants';
import { parseLine } from 'features/properties/parsing';

const renderProperty = (property: Property | null): string | null =>
  property ? `${property.name}${PROPERTY_SEPARATOR} ${property.value}` : null;

export const updatePropertyValue = async (
  updatedProperty: Property,
  vault: Vault,
  file: TFile
) => {
  const contents = await vault.read(file);
  const lines = contents.split(NEWLINE);
  const modifiedContents = lines
    .map((line) => {
      const property = parseLine(line);
      let resultProperty = property;
      if (property && property.name === updatedProperty.name) {
        resultProperty = updatedProperty;
      }
      return renderProperty(resultProperty) ?? '';
    })
    .join(NEWLINE);
  await vault.modify(file, modifiedContents);
};
