import { config } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';

import { DeviceToken } from './entities/device-token.entity';
import { Faq } from './entities/faq.entity';
import { Feedback } from './entities/feedback.entity';
import { FollowRequest } from './entities/follow-request.entity';
import { Follow } from './entities/follow.entity';
import { HabitCheck } from './entities/habit-check.entity';
import { HabitCategory } from './entities/habit-category.entity';
import { Habit } from './entities/habit.entity';
import { NoticeRead } from './entities/notice-read.entity';
import { Notice } from './entities/notice.entity';
import { NotificationTemplate } from './entities/notification-template.entity';
import { Notification } from './entities/notification.entity';
import { OnboardingProfile } from './entities/onboarding-profile.entity';
import { UserAuthProvider } from './entities/user-auth-provider.entity';
import { UserNotificationSetting } from './entities/user-notification-setting.entity';
import { UserPrivacySetting } from './entities/user-privacy-setting.entity';
import { UserSession } from './entities/user-session.entity';
import { User } from './entities/user.entity';

config({ path: join(__dirname, '..', '.env') });

const entities = [
  User,
  UserAuthProvider,
  UserSession,
  OnboardingProfile,
  HabitCategory,
  Habit,
  HabitCheck,
  Follow,
  FollowRequest,
  DeviceToken,
  Notification,
  UserNotificationSetting,
  UserPrivacySetting,
  Notice,
  NoticeRead,
  Feedback,
  Faq,
  NotificationTemplate,
];

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities,
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
});

export default AppDataSource;
