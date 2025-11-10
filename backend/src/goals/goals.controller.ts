import { Body, Controller, Delete, Get, Param } from '@nestjs/common';

import { GoalsService } from './goals.service';

@Controller('goals')
export class GoalsController {
  constructor(private goalsService: GoalsService) {}

  @Get()
  findAll() {
    return this.goalsService.findAll();
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.goalsService.delete(id);
  }
}
