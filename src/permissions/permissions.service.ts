import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entity/permission.entity';
import { EntityManager, FindOptionsWhere, Not, Repository } from 'typeorm';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { GlobalException } from 'src/global/global.filter';
import { getUnusedBitValue, groupArr, Response } from 'src/helpers/utils';
import { CommonTableStatuses } from 'src/typings/common';
import { User } from 'src/user/entity/user.entity';
import { PermissionItem } from 'src/permission-item/entity/permission-item.entity.dto';
import defaultPermissions from './data/permissions.data';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { RedisService } from 'src/redis/redis.service';
@Injectable()
export class PermissionsService implements OnModuleInit {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(PermissionItem)
    private readonly permissionItemRepository: Repository<PermissionItem>,
    private readonly entityManager: EntityManager,
    private readonly redisService: RedisService,
  ) {}

  async list(dense?: boolean) {
    const q = this.permissionRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.permissionItems', 'pi', 'pi.status != :piStatus', {
        piStatus: CommonTableStatuses.DELETED,
      })
      .where('p.status != :status', {
        status: CommonTableStatuses.DELETED,
      });
    if (dense) {
      q.select(['p.id', 'p.title', 'pi.id', 'pi.title', 'pi.value']);
    }

    return q.orderBy('p.createdAt', 'DESC').getMany();
  }

  async getDenseList() {
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
      select: {
        id: true,
        title: true,
        permissionItems: {
          id: true,
          title: true,
          value: true,
        },
      },
    });
  }

  async create({ title, priority }: CreatePermissionDto) {
    await this.throwIfExists({ title });

    const result = await this.entityManager.transaction(async (trx) => {
      const permission = await trx.save(
        this.permissionRepository.create({ title, priority }),
      );

      await this.redisService.setPermissions(trx);
      return permission;
    });

    return new Response(result, 'success.created', {
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
        { id, status: Not(CommonTableStatuses.DELETED) },
        this.permissionRepository.create({
          status: CommonTableStatuses.DELETED,
        }),
      );
      if (!res.affected) {
        throw new GlobalException('errors.not_found', {
          args: { property: 'words.permission_page' },
        });
      }
      await trx.update(
        PermissionItem,
        { permissionId: id, status: Not(CommonTableStatuses.DELETED) },
        trx
          .getRepository(PermissionItem)
          .create({ status: CommonTableStatuses.DELETED }),
      );

      await this.modifyExistingUsers(trx, { page: page.title }, true);
      return true;
    });

    return new Response(result, 'success.deleted', {
      property: 'words.permission_page',
    });
  }

  async update(id: number, { priority }: UpdatePermissionDto) {
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

    const permission = await this.permissionRepository.update(
      id,
      this.permissionRepository.create({ priority }),
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

    await this.redisService.setPermissions(trx);
  }

  async onModuleInit() {
    await this.entityManager.transaction(async (trx) => {
      for (const title of Object.keys(defaultPermissions)) {
        let page = await trx.findOneBy(Permission, { title });
        if (!page) {
          page = await trx.save(
            this.permissionRepository.create({
              title,
            }),
          );
        }

        const permissions = (defaultPermissions as Record<string, string[]>)[
          title
        ];

        const list = await trx.find(PermissionItem, {
          select: {
            value: true,
          },
          where: {
            status: Not(CommonTableStatuses.DELETED),
            permissionId: page.id,
          },
        });

        for (const permission of permissions) {
          const exists = await trx.existsBy(PermissionItem, {
            title: permission,
            permissionId: page.id,
          });
          if (!exists) {
            const value = getUnusedBitValue(list.map((cell) => cell.value));

            const item = await trx.save(
              this.permissionItemRepository.create({
                title: permission,
                permissionId: page.id,
                value,
              }),
            );
            list.push(item);
          }
        }
      }
    });
    await this.redisService.setPermissions();
    console.info('permissions initialized');
  }
}
