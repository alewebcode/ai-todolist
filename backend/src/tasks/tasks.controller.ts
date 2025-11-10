import { Body, Controller, Delete, Param, Patch } from '@nestjs/common';

import { TasksService } from './tasks.sevice';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.delete(id);
  }

  @Patch(':id/toggle')
  toggleComplete(@Param('id') id: string) {
    return this.tasksService.toggleComplete(id);
  }
}
