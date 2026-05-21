import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { User as IUser } from '@scheduler/shared';

@Entity()
export class User implements IUser {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ default: 'UTC' })
  timezone!: string;

  @Column({ nullable: true })
  encryptedTokens?: string;
}
