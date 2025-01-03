import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UserVerification } from './entity/user-verification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserVerification])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
