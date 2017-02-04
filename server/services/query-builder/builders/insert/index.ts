import {IQuery} from 'services/query-builder';

export default function buildSelect(query: IQuery) {
  const queryTexts = [];

  const {table, values: data = []} = query

  if (!query.table) {
    throw new Error(`Cannot build new insert command without table property!`);
  }

  queryTexts.push('INSERT INTO', table);

  const properties: Array<string> = [];
  const values: Array<any> = [];
  data.forEach(([property, value]) => {
    properties.push(property);
    values.push(value);
  });

  queryTexts.push(`(${properties.join(', ')})`);
  queryTexts.push('VALUES');
  queryTexts.push(`(${values.join(', ')})`);

  return queryTexts.join(' ');
}
