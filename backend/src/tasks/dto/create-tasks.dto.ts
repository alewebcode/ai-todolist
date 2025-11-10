import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTasksDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}
