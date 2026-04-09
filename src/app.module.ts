import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { AuthModule } from './auth/auth.module.js';
import { HabitsModule } from './habits/habits.module.js';
import { UsersModule } from './users/users.module.js';

import { StatisticsModule } from './statistics/statistics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: Number(configService.get<string>('DB_PORT')),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
        migrations: [join(__dirname, 'migrations', '*.{js,ts}')],
        migrationsRun: false,
      }),
    }),
    AuthModule,
    HabitsModule,
    UsersModule,
    StatisticsModule,
  ],
})
export class AppModule {}
