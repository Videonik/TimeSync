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

  @Column({ type: 'varchar', default: 'draft' })
  status!: 'draft' | 'published' | 'completed';

  @Column()
  organizerId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'organizerId' })
  organizer!: User;

  @Column()
  dateRangeStart!: Date;

  @Column()
  dateRangeEnd!: Date;
}
