import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTasksDto } from './dto/create-tasks.dto';
import {
  BadRequestException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';

export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async create(createTasksDto: CreateTasksDto[], manager: EntityManager) {
    const newTasks = manager.create(Task, createTasksDto);
    return manager.save(newTasks);
  }
  async findAll(): Promise<Task[]> {
    return await this.tasksRepository.find({
      relations: ['goal'],
      order: { createdAt: 'DESC' },
    });
  }
  async toggleComplete(id: string): Promise<Task> {
    try {
      const task = await this.tasksRepository.findOneBy({ id });

      if (!task) {
        throw new NotFoundException('Tarefa não encontrada');
      }

      task.isCompleted = !task?.isCompleted;

      return await this.tasksRepository.save(task);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Erro ao atualizar a tarefa');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.tasksRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException('Tarefa não encontrada');
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Erro ao deletar a tarefa');
    }
  }
}
