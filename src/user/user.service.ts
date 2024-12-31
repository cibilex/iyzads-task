import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { FindOptionsWhere, Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { EnvType } from 'src/env/env.interface';
import { LoginUserDto } from './dto/login-user.dto';
import { Response } from 'src/helpers/utils';
import { GlobalException } from 'src/global/global.filter';
import { RedisService } from 'src/redis/redis.service';
import { CommonTableStatuses } from 'src/typings/common';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService<EnvType, true>,
    private readonly redisService: RedisService,
  ) {}

  async createUser(data: CreateUserDto) {
    const { username, password } = data;
    const exists = await this.userRepository.existsBy({ username });
    if (exists) {
      throw new GlobalException('errors.already_exists', {
        args: {
          property: 'words.user',
        },
      });
    }

    const permissions = await this.validatePermissions(data.permissions);

    const hashedPassword = await bcrypt.hash(
      password,
      this.configService.get('BCRYPT_SALT', { infer: true }),
    );

    await this.userRepository.save(
      this.userRepository.create({
        username,
        password: hashedPassword,
        permissions,
      }),
    );

    return new Response(true, 'success.registered');
  }

  async login({ username, password, rememberMe }: LoginUserDto) {
    const user = await this.getUser({ username });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new GlobalException('errors.passwordIsNotValid');

    const accessToken = await this.redisService.setAccessToken(
      user,
      rememberMe,
    );

    return new Response({ accessToken }, 'success.logged_in');
  }

  async getUser(where: FindOptionsWhere<User>) {
    const user = await this.userRepository.findOne({
      where: {
        ...where,
        status: Not(CommonTableStatuses.DELETED),
      },
      select: ['password', 'status', 'id', 'type', 'createdAt'],
    });
    if (!user)
      throw new GlobalException('errors.not_found', {
        args: {
          property: 'words.user',
        },
      });
    if (user.status === 2) throw new GlobalException('errors.not_verified');

    return user;
  }

  private async validatePermissions(obj: CreateUserDto['permissions']) {
    const permissions = await this.redisService.getPermissions();

    if (Object.keys(obj).some((key) => !obj[key] || !Array.isArray(obj[key]))) {
      throw new GlobalException('errors.perm_structure_invalid');
    }

    const newPerm: Record<string, number> = {};
    for (const [page, items] of Object.entries(obj)) {
      for (const item of items) {
        const permVal =
          permissions[page] &&
          permissions[page].perms &&
          permissions[page].perms[item];
        if (!permVal) {
          throw new GlobalException('errors.perm_structure_invalid');
        }
        newPerm[page] = (newPerm[page] || 0) | permVal.v;
      }
    }
    return newPerm;
  }
}