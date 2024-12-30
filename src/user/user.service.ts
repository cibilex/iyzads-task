import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { EntityManager, Not, Repository } from 'typeorm';
import { Setting } from './entity/setting.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { EnvType } from 'src/env/env.interface';
import { LoginUserDto } from './dto/login-user.dto';
import { Response } from 'src/helpers/utils';
import { GlobalException } from 'src/global/global.filter';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService<EnvType, true>,
  ) {}

  async createUser(data: CreateUserDto) {
    const { username, password } = data;
    const exists = await this.userRepository.existsBy({ username });
    if (exists)
      throw new GlobalException('errors.already_exists', {
        args: {
          property: 'words.user',
        },
      });

    const hashedPassword = await bcrypt.hash(
      password,
      this.configService.get('BCRYPT_SALT', { infer: true }),
    );

    return this.insertUser(data, hashedPassword);
  }

  private async insertUser(
    { username, birthYear, phone, country }: CreateUserDto,
    hashedPassword: string,
  ) {
    // return this.entityManager.transaction(async (trx) => {
    //   const user = await trx.insert(
    //     User,
    //     this.userRepository.create({
    //       username,
    //       password: hashedPassword,
    //       birthYear,
    //     }),
    //   );
    //   await trx.insert(
    //     Setting,
    //     this.settingRepository.create({
    //       phone,
    //       country,
    //       userId: user.identifiers[0]!.id as number,
    //     }),
    //   );
    //   return new Response(true, 'success.registered');
    // });
  }

  async login({ username, password }: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: {
        username,
        status: Not(3),
      },
      select: ['password', 'status'],
    });
    if (!user)
      throw new GlobalException('errors.not_found', {
        args: {
          property: 'words.user',
        },
      });
    if (user.status === 2) throw new GlobalException('errors.not_verified');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new GlobalException('errors.passwordIsNotValid');

    return true;
  }
}
