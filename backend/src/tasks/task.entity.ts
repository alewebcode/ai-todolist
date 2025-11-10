import { Goal } from 'src/goals/goal.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ default: false })
  isCompleted!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @Column()
  goalId!: number;

  @ManyToOne(() => Goal, (goal) => goal.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goalId' })
  goal!: Goal;
}
