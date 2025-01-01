import {
  Body,
  Controller,
  Get,
  Header,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Auth, Public } from 'src/public/public.decorator';
import { RUser } from './user.decorator';
import { FastifyRequest } from 'fastify';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth(['user.create'])
  @Post()
  createUser(@Body() body: CreateUserDto) {
    return this.userService.createUser(body);
  }

  @Get('profile')
  profile(@RUser('userId') id: number) {
    return this.userService.profile(id);
  }

  @Post('logout')
  logout(@Req() req: FastifyRequest) {
    return this.userService.logout(req.headers.authorization!.split(' ')[1]);
  }

  @Public(true)
  @Post('login')
  login(@Body() body: LoginUserDto) {
    return this.userService.login(body);
  }
}
