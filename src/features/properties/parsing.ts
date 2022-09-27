import { Property } from 'common/types';
import { PROPERTY_SEPARATOR } from 'features/properties/constants';
import { NEWLINE } from 'common/utilities';

const parseBoolean = (line: string): boolean | null => {
  switch (line) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      return null;
  }
};

export const parseLine = (line: string): Property | null => {
  const splitLine = line.split(PROPERTY_SEPARATOR);
  if (splitLine.length < 2) {
    console.warn(
      `Text ${line} is not in valid property format. Use "Property:: value"`
    );
    return null;
  }
  const propertyName = splitLine[0];
  const value = splitLine.slice(1).join(PROPERTY_SEPARATOR).trim();
  const possibleBoolValue = parseBoolean(value);
  return { name: propertyName, value: possibleBoolValue ?? value };
};

export const parseText = (rawText: string): Property[] => {
  const lines = rawText.split(NEWLINE);
  const result: Property[] = [];
  lines.forEach((line) => {
    const property = parseLine(line);
    if (property) {
      result.push(property);
    }
  });
  return result;
};
