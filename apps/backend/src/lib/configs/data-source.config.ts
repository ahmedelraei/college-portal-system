import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';

if (!process.env.DB_HOST) {
  config();
}

const configService = new ConfigService(process.env);

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: parseInt(configService.get('DB_PORT', '5432'), 10),
  username: configService.get<string>('DB_USER', 'postgres'),
  password: configService.get<string>('DB_PASSWORD', 'postgres'),
  database: configService.get<string>('DB_NAME', 'college_db'),
  entities: [`${__dirname}/../../**/*.entity{.ts,.js}`],
  migrations: [`${__dirname}/../../migrations/*{.ts,.js}`],
  logging: configService.get('DB_LOGGING') === 'true',
  dropSchema: false,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
