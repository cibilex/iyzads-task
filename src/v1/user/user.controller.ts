import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Auth, Public } from 'src/public/public.decorator';
import { RUser } from './user.decorator';
import { FastifyRequest } from 'fastify';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @ApiBearerAuth()
  @Auth(['user.list'])
  @Get()
  list(@RUser('userId') id: number) {
    return this.userService.list(id);
  }

  @ApiBearerAuth()
  @Auth(['user.create'])
  @Post()
  create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }

  @ApiBearerAuth()
  @Get('profile')
  profile(@RUser('userId') id: number) {
    return this.userService.profile(id);
  }

  @ApiBearerAuth()
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
