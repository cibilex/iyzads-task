import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionItem } from './entity/permission-item.entity.dto';
import { FindOptionsWhere, Not, Repository } from 'typeorm';
import { CreatePermissionItemDto } from './dto/create-permission-item.dto';
import { CommonTableStatuses } from 'src/typings/common';
import { GlobalException } from 'src/global/global.filter';
import { getUnusedBitValue, Response } from 'src/helpers/utils';
import { Permission } from 'src/permissions/entity/permission.entity';

@Injectable()
export class PermissionItemService {
  constructor(
    @InjectRepository(PermissionItem)
    private permissionItemRepository: Repository<PermissionItem>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async list() {
    return this.permissionItemRepository.find({
      where: {
        status: Not(CommonTableStatuses.DELETED),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async create(
    permissionId: number,
    { title, priority }: CreatePermissionItemDto,
  ) {
    await Promise.all([
      this.checkPage(permissionId),
      this.throwIfExists({ title, permissionId }),
    ]);

    const list = await this.permissionItemRepository.find({
      select: {
        value: true,
      },
      where: {
        status: Not(CommonTableStatuses.DELETED),
        permissionId,
      },
    });

    const value = getUnusedBitValue(list.map((cell) => cell.value));

    const permission = await this.permissionItemRepository.save(
      this.permissionItemRepository.create({
        title,
        permissionId,
        priority,
        value,
      }),
    );

    return new Response(permission, 'success.created', {
      property: 'words.permission',
    });
  }

  async delete(permissionId: number, id: number) {
    const result = await this.permissionItemRepository.update(
      {
        id,
        permissionId,
      },
      this.permissionRepository.create({
        status: CommonTableStatuses.DELETED,
      }),
    );
    if (!result.affected) {
      throw new GlobalException('errors.not_found', {
        args: {
          property: 'words.permission',
        },
      });
    }
    // should remove user perms

    return new Response(true, 'success.deleted', {
      property: 'words.permission',
    });
  }

  async update(
    permissionId: number,
    id: number,
    { title, priority }: CreatePermissionItemDto,
  ) {
    await Promise.all([
      this.throwIfNotExists({ id, permissionId }),
      this.checkPage(permissionId),
    ]);
    await this.throwIfExists({ title, permissionId, id: Not(id) });

    const result = await this.permissionItemRepository.update(
      id,
      this.permissionItemRepository.create({
        title,
        priority,
      }),
    );
    if (!result.affected) {
      throw new GlobalException('errors.not_found', {
        args: {
          property: 'words.permission',
        },
      });
    }

    return new Response(true, 'success.updated', {
      property: 'words.permission',
    });
  }

  private async checkPage(id: number) {
    const exists = this.permissionRepository.existsBy({
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
  }

  private exists(where: FindOptionsWhere<PermissionItem>) {
    return this.permissionItemRepository.existsBy({
      status: Not(CommonTableStatuses.DELETED),
      ...where,
    });
  }

  private async throwIfExists(where: FindOptionsWhere<PermissionItem>) {
    const exists = await this.exists(where);
    if (exists) {
      throw new GlobalException('errors.already_exists', {
        args: {
          property: 'words.permission',
        },
      });
    }
  }

  private async throwIfNotExists(where: FindOptionsWhere<PermissionItem>) {
    const exists = await this.exists(where);
    if (!exists) {
      throw new GlobalException('errors.not_found', {
        args: {
          property: 'words.permission',
        },
      });
    }
  }
}
