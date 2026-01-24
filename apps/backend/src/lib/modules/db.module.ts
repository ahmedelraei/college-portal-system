import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { dataSourceOptions } from '../configs/data-source.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: Boolean(process.env.DB_HOST),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        const syncSetting = configService.get('DB_SYNC');
        const synchronize =
          syncSetting === 'true' || (!isProduction && syncSetting !== 'false');

        return {
        ...(dataSourceOptions as any),
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: parseInt(configService.get('DB_PORT', '5432'), 10),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'college_db'),
        autoLoadEntities: true,
        synchronize,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
