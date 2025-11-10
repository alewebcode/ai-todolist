import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { GenerateTasksDto } from 'src/ai/dto/generate-tasks.dto';
import { GoalsService } from 'src/goals/goals.service';
import { TasksService } from 'src/tasks/tasks.sevice';
import { DataSource } from 'typeorm';

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
@Injectable()
export class AiService {
  constructor(
    private tasksService: TasksService,
    private goalsService: GoalsService,
    private dataSource: DataSource,
  ) {}

  async generateTasks(generateTasksDto: GenerateTasksDto) {
    const { prompt, apiKey } = generateTasksDto;

    if (!apiKey || apiKey.trim() === '') {
      throw new BadRequestException(
        'Chave de API é obrigatória para gerar tarefas.',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      try {
        let tasks: string[] = [];
        const goal = await this.goalsService.create({ title: prompt }, manager);
        tasks = await this.callOpenRouterAPI(prompt, apiKey);

        if (!tasks || tasks.length === 0) {
          throw new BadRequestException('Nenhuma tarefa retornada pela IA.');
        }

        const createdTasks = await this.tasksService.create(
          tasks.map((title) => ({
            title,
            isCompleted: false,
            goalId: goal.id,
          })),
          manager,
        );

        return {
          id: goal.id,
          title: goal.title,
          tasks: createdTasks,
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            throw new BadRequestException(
              'Chave de API inválida. Verifique e tente novamente.',
            );
          }

          throw new BadRequestException(
            'Erro ao chamar a API de IA. Tente novamente.',
          );
        }

        throw new BadRequestException('Não foi possivél gerar as tarefas.');
      }
    });
  }

  private async callOpenRouterAPI(
    prompt: string,
    apiKey: string,
  ): Promise<string[]> {
    const response = await axios.post<OpenRouterResponse>( // ← Adiciona tipo genérico
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistralai/mixtral-8x7b-instruct',
        messages: [
          {
            role: 'system',
            content:
              'Você é um assistente que gera tarefas baseadas em um objetivo. Retorne APENAS um JSON no formato {"tasks": ["tarefa 1", "tarefa 2", ...]}',
          },
          {
            role: 'user',
            content: `Objetivo: ${prompt}`,
          },
        ],
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const text = response.data.choices[0].message.content;

    return this.extractTasks(text);
  }

  private extractTasks(text: string): string[] {
    try {
      let cleaned = text
        //Remove qualquer ocorrência de <s>, </s>, [OUT], [INST], etc. no texto inteiro
        .replace(/<\s*\/?\s*s\s*>/gi, '')
        .replace(/\[OUT\]/gi, '')
        .replace(/\[INST\]/gi, '')
        .replace(/\[IN\]/gi, '')
        //Remove também se vier com espaços ou no início da resposta
        .replace(/^\s*(<s>|<\/s>|\[OUT\]|\[INST\]|\[IN\])\s*/gi, '')
        .replace(/\s*(<s>|<\/s>|\[OUT\]|\[INST\]|\[IN\])\s*$/gi, '')
        // markdown e HTML
        .replace(/\*\*/g, '')
        .replace(/[_`]/g, '')
        .replace(/<\/?[^>]+(>|$)/g, '')
        .replace(/\r/g, '')
        .trim();

      cleaned = cleaned.replace(/^.*?(Lista de tarefas:|Tarefas:|Tasks:)/i, '');

      const jsonMatch = cleaned.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]) as unknown;
          if (Array.isArray(parsed)) {
            const tasks = (parsed as string[])
              .map((task) => String(task).trim())
              .filter((task) => task.length > 0 && task.length < 200)
              .slice(0, 10);

            if (tasks.length > 0) return tasks;
          }
        } catch {
          console.log('JSON inválido');
        }
      }

      const lines = cleaned
        .split('\n')
        .map((line) =>
          line
            .replace(/<\s*\/?\s*s\s*>/gi, '')
            .replace(/\[OUT\]/gi, '')
            .replace(/\[INST\]/gi, '')
            .replace(/^\d+[\.\)]\s*/, '')
            .replace(/^[-*•]\s*/, '')
            .replace(/^[\[\]]\s*/, '')
            .replace(/^\s*•\s*/, '')
            .replace(/[\t]+/g, ' ')
            .trim(),
        )
        .filter((line) => {
          return (
            line.length > 3 &&
            line.length < 200 &&
            !line.match(/^(Objetivo|Lista|Tarefas|Tasks|Here|Saída|Output)/i) &&
            !line.includes('```') &&
            !line.startsWith('{') &&
            !line.startsWith('[')
          );
        });

      if (lines.length > 0) {
        return lines.slice(0, 10);
      }

      const fallback = cleaned
        .split(/[;.]/)
        .map((t) => t.trim())
        .filter((t) => t.length > 5 && t.length < 200)
        .slice(0, 10);

      if (fallback.length > 0) {
        return fallback;
      }

      throw new Error('Não foi possível extrair tarefas da resposta da IA.');
    } catch (error) {
      console.error('Falha ao processar resposta da IA:', error);
      throw new BadRequestException(
        'Não foi possível processar a resposta da IA. Tente novamente com um objetivo mais claro.',
      );
    }
  }
}
