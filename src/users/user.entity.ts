import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid') // Change ID to UUID
  id: string; // Use 'string' type for UUID

  @Column({ unique: true }) // Make username unique
  username: string;

  @Column({ unique: true }) // Make email unique
  email: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;
}
