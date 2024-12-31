import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entity/permission.entity';
import { EntityManager, FindOptionsWhere, Not, Repository } from 'typeorm';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { GlobalException } from 'src/global/global.filter';
import { groupArr, Response } from 'src/helpers/utils';
import { CommonTableStatuses } from 'src/typings/common';
import { ModuleRef } from '@nestjs/core';
import { User } from 'src/user/entity/user.entity';
import { PermissionItem } from 'src/permission-item/entity/permission-item.entity.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    private readonly entityManager: EntityManager,
    private readonly moduleRef: ModuleRef,
  ) {}

  async list() {
    return this.permissionRepository.find({
      where: {
        status: Not(CommonTableStatuses.DELETED),
      },
      order: {
        createdAt: 'DESC',
      },
      relations: {
        permissionItems: true,
      },
    });
  }

  async create({ title, priority }: CreatePermissionDto) {
    await this.throwIfExists({ title });

    const permission = await this.permissionRepository.save(
      this.permissionRepository.create({ title, priority }),
    );

    return new Response(permission, 'success.created', {
      property: 'words.permission_page',
    });
  }

  async delete(id: number) {
    const page = await this.permissionRepository.findOneBy({
      id,
      status: Not(CommonTableStatuses.DELETED),
    });
    if (!page) {
      throw new GlobalException('errors.not_found', {
        args: { property: 'words.permission_page' },
      });
    }

    const result = await this.entityManager.transaction(async (trx) => {
      const res = await trx.update(
        Permission,
        {
          id,
          status: Not(CommonTableStatuses.DELETED),
        },
        {
          status: CommonTableStatuses.DELETED,
        },
      );
      if (!res.affected) {
        throw new GlobalException('errors.not_found', {
          args: { property: 'words.permission_page' },
        });
      }
      await trx.update(
        PermissionItem,
        { permissionId: id, status: Not(CommonTableStatuses.DELETED) },
        { status: CommonTableStatuses.DELETED },
      );

      await this.modifyExistingUsers(trx, { page: page.title }, true);
      return true;
    });

    return new Response(result, 'success.deleted', {
      property: 'words.permission_page',
    });
  }

  async update(id: number, { title, priority }: CreatePermissionDto) {
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

  async modifyExistingUsers(
    trx: EntityManager,
    payload: { val?: number; page: string },
    del = false,
  ) {
    const { val, page } = payload;

    const items = await trx.find(User, {
      select: ['id', 'permissions'],
    });

    const groupedItems = groupArr<User>(items, 20);
    for (const list of groupedItems) {
      const promises = [];
      for (const item of list) {
        const currentPerms = item.permissions;

        if (currentPerms[page]) {
          if (del) {
            if (!val) {
              delete currentPerms[page];
            } else {
              currentPerms[page] = currentPerms[page] & ~val;
            }
          } else {
            currentPerms[page] = currentPerms[page] | val!;
          }
        } else if (!del) {
          currentPerms[page] = val!;
        }

        promises.push(
          await trx.update(
            User,
            { id: item.id },
            { permissions: currentPerms },
          ),
        );
      }
      await Promise.all(promises);
    }
  }
}
