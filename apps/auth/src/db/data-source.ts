import { DataSource, DataSourceOptions } from 'typeorm';
import { UserEntity } from '@app/shared';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  logging: true,
  entities: [UserEntity],
  migrations: ['dist/apps/auth/db/migrations/*.js'],
};
export const dataSource = new DataSource(dataSourceOptions);
