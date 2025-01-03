import { BaseEntity } from 'src/entity/base.entity';
import { PermissionItem } from 'src/v1/permission-item/entity/permission-item.entity.dto';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column({
    type: 'varchar',
    length: '40',
  })
  title: string;

  @Column({
    type: 'int',
    nullable: true,
  })
  priority: number;

  @OneToMany(
    () => PermissionItem,
    (permissionItem) => permissionItem.permission,
  )
  permissionItems: PermissionItem[];
}
