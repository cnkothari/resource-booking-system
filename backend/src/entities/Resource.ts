import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ResourceType } from './ResourceType';
import { Booking } from './Booking';

@Entity({ name: 'resources' })
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  location!: string | null;

  // Optional capacity (meaningful for meeting rooms / vehicles).
  @Column({ type: 'int', nullable: true })
  capacity!: number | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Index()
  @Column({ type: 'uuid' })
  resourceTypeId!: string;

  @ManyToOne(() => ResourceType, (resourceType) => resourceType.resources, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'resourceTypeId' })
  resourceType!: ResourceType;

  @OneToMany(() => Booking, (booking) => booking.resource)
  bookings!: Booking[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
