import { Task } from 'src/tasks/task.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Task, (task) => task.goal, { cascade: true })
  tasks!: Task[];
}
