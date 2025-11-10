import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Goal } from './goal.entity';
import { CreateGoalDto } from './dto/create-goal.dto';

@Injectable()
export class GoalsService {
  constructor(@InjectRepository(Goal) private goalsRepo: Repository<Goal>) {}

  findAll() {
    return this.goalsRepo.find({
      relations: ['tasks'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(data: CreateGoalDto, manager: EntityManager) {
    const goal = manager.create(Goal, data);
    return manager.save(goal);
  }

  async delete(id: string) {
    try {
      const result = await this.goalsRepo.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException('Objetivo não encontrado');
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new BadRequestException('Erro ao deletar um objetivo');
    }
  }
}
