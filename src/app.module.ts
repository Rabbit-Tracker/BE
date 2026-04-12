import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HabitCategoryModule } from './habit-category/habit-category.module';
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
      useFactory: (configService: ConfigService) => {
        // 운영 환경에서는 스키마 자동 동기화를 비활성화
        const isProduction = configService.get<string>('NODE_ENV') === 'production';

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: Number(configService.get<string>('DB_PORT')),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: !isProduction,
          migrations: [join(__dirname, 'migrations', '*.{js,ts}')],
          migrationsRun: false,
        };
      },
    }),
    HabitCategoryModule,
    AuthModule,
    HabitsModule,
    UsersModule,
    StatisticsModule,
  ],
})
export class AppModule {}
