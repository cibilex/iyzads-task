import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entity/permission.entity';
import { FindOptionsWhere, Not, Repository } from 'typeorm';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { GlobalException } from 'src/global/global.filter';
import { Response } from 'src/helpers/utils';
import { CommonTableStatuses } from 'src/typings/common';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async createPermission({ title, priority }: CreatePermissionDto) {
    await this.throwIfExists({ title });

    const permission = await this.permissionRepository.save(
      this.permissionRepository.create({ title, priority }),
    );

    return new Response(permission, 'success.created', {
      property: 'words.permission_page',
    });
  }

  async updatePermission(id: number, { title, priority }: CreatePermissionDto) {
    const exists = await this.permissionRepository.findOneBy({
      status: Not(CommonTableStatuses.DELETED),
      id,
    });
    if (!exists) {
      throw new GlobalException('errors.not_found', {
        args: {
          property: 'words.permission_page',
        },
      });
    }

    await this.throwIfExists({ title, id: Not(id) });

    const permission = await this.permissionRepository.update(
      id,
      this.permissionRepository.create({ title, priority }),
    );
    if (!permission.affected) {
      throw new GlobalException('errors.not_found', {
        args: {
          property: 'words.permission_page',
        },
      });
    }

    return new Response(true, 'success.updated', {
      property: 'words.permission_page',
    });
  }

  async getPermissions() {
    return this.permissionRepository.find({
      where: {
        status: Not(CommonTableStatuses.DELETED),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  private exists(where: FindOptionsWhere<Permission>) {
    return this.permissionRepository.existsBy({
      status: Not(CommonTableStatuses.DELETED),
      ...where,
    });
  }

  private async throwIfExists(where: FindOptionsWhere<Permission>) {
    const exists = await this.exists(where);
    if (exists) {
      throw new GlobalException('errors.already_exists', {
        args: {
          property: 'words.permission_page',
        },
      });
    }
  }
}
