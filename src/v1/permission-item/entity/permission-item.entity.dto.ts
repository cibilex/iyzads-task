import { BaseEntity } from 'src/entity/base.entity';
import { Permission } from 'src/v1/permissions/entity/permission.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('permission_items')
export class PermissionItem extends BaseEntity {
  @Column()
  title: string;

  @Column({
    nullable: true,
  })
  priority: number;

  @Column()
  value: number;

  @Column({ nullable: false, name: 'permission_id' })
  permissionId: number;

  @ManyToOne(() => Permission)
  @JoinColumn({ name: 'permission_id' })
  permission: Partial<Permission>;
}
