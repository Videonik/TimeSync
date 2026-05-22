import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Event as IEvent } from '@scheduler/shared';
import { User } from './user.entity';

@Entity()
export class Event implements IEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  durationMinutes!: number;

  @Column({ nullable: true, default: 0 })
  bufferMinutes?: number;

  @Column({ type: 'varchar', default: 'draft' })
  status!: 'draft' | 'published' | 'completed';

  @Column({ nullable: true })
  organizerId!: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'organizerId' })
  organizer!: User;

  @Column()
  dateRangeStart!: Date;

  @Column()
  dateRangeEnd!: Date;
}
