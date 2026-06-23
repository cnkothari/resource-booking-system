import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Resource } from './Resource';
import { User } from './User';

// Stored lifecycle state. "past" / "upcoming" are *derived* from the dates,
// not stored — only the cancellation state is persisted.
export const BOOKING_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
} as const;

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

@Entity({ name: 'bookings' })
@Index(['resourceId', 'startTime', 'endTime'])
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  title!: string | null;

  @Index()
  @Column({ type: 'uuid' })
  resourceId!: string;

  @ManyToOne(() => Resource, (resource) => resource.bookings, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'resourceId' })
  resource!: Resource;

  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.bookings, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'timestamptz' })
  startTime!: Date;

  @Column({ type: 'timestamptz' })
  endTime!: Date;

  @Column({ type: 'varchar', length: 20, default: BOOKING_STATUS.ACTIVE })
  status!: BookingStatus;

  @Column({ type: 'timestamptz', nullable: true })
  cancelledAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
