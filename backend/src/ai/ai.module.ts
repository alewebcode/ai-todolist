import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { Goal } from 'src/goals/goal.entity';
import { Task } from 'src/tasks/task.entity';
import { GoalsModule } from 'src/goals/goals.module';
import { TasksModule } from 'src/tasks/tasks.module';

@Module({
  imports: [TypeOrmModule.forFeature([Goal, Task]), GoalsModule, TasksModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
