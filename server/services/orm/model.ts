// TODO: add create method

import * as pg from 'pg';
import {snakeCase} from 'lodash';
import database from 'services/orm';
import QueryBuilder from 'services/query-builder';

export interface IModelSchema {
  [attribute: string]: {
    type: string
    validate?: {
      validator: (value: any) => boolean
      message: string
    },
    required?: string,
    unique?: string,
    default?: Defaults
  }
}

export const Types = {
  string(length: number) {
    return `varchar(${length})`;
  },
  text() {
    return `text`
  },
  timestamp() {
    return 'timestamp'
  }
}

export enum Defaults {
  TODAY = 1
}

export default class Model <T> {
  private readonly tableName: string;
  private modelSchema: IModelSchema;
  private tableExists = false;

  constructor(tableName: string, modelSchema: IModelSchema) {
    this.tableName = snakeCase(tableName);
    this.modelSchema = modelSchema;
  }

  async query(builder: QueryBuilder | string) {
    await this.ensureTableExists();

    let queryText;

    if (builder instanceof QueryBuilder) {
      builder.table(this.tableName);
      queryText = builder.build();
    } else {
      queryText = builder;
    }
    const document = await database.query(queryText);
    return this.deserialize(document);
  }

  private deserialize(document: pg.QueryResult) {
    const rows = document.rows;
    if (rows.length === 1) {
      return <T> rows[0];
    }
    else return <Array<T>> rows;
  }

  private async ensureTableExists() {
    if (this.tableExists) {
      return;
    }

    const queryText = this.buildTableQuery();

    await database.query(queryText);
    this.tableExists = true;
  }

  private buildTableQuery() {
    const tableAtributes = Object.keys(this.modelSchema).map((attribute) => {
      const attributeDefinition = this.modelSchema[attribute];
      const attributeName = snakeCase(attribute);
      const {type, required, unique, default: defaultValue} = attributeDefinition;

      let column = `${attributeName} ${type}`;

      if (required) {
        column = column + 'NOT NULL';
      }

      if (unique) {
        column = column + 'UNIQUE';
      }

      if (defaultValue && Defaults[defaultValue]) {
        column = column + `DEFAULT ${defaultValue}`;
      }

      return column;
    });

    const tableDefinition = tableAtributes.join(' ');
    return `CREATE TABLE IF NOT EXISTS ${this.tableName} ( ${tableDefinition} )`;
  }
}