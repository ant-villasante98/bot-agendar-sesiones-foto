import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './user.repository/user.repository';

@Module({
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
