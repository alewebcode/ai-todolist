import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateTasksDto } from './dto/generate-tasks.dto';

@Controller('generate-tasks')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post()
  generateTasks(@Body() generateTasksDto: GenerateTasksDto) {
    return this.aiService.generateTasks(generateTasksDto);
  }
}
