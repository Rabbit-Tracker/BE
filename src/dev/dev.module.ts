import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Follow } from '../entities/follow.entity.js';
import { User } from '../entities/user.entity.js';
import { DevController } from './dev.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, Follow])],
  controllers: [DevController],
})
export class DevModule {}
