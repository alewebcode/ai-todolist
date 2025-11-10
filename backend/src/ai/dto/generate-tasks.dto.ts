import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateTasksDto {
  @IsString()
  @IsNotEmpty()
  prompt!: string;

  @IsString()
  @IsNotEmpty()
  apiKey!: string;
}
