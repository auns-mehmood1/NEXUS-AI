import { Injectable, Logger } from '@nestjs/common';
import { getMockResponse } from './providers/mock.provider';
import { kimiChat } from './providers/kimi.provider';

interface AiMessage { role: string; content: string; }

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  async chat(modelId: string, modelName: string, messages: AiMessage[]): Promise<string> {
    const provider = process.env.AI_PROVIDER || 'mock';

    if (provider === 'kimi' && process.env.KIMI_API_KEY) {
      try {
        const kimiModel = modelId.startsWith('kimi') ? 'moonshot-v1-8k' : 'moonshot-v1-32k';
        return await kimiChat(process.env.KIMI_API_KEY, kimiModel, messages);
      } catch (err) {
        this.logger.warn('Kimi API failed, falling back to mock', err);
      }
    }

    // Mock response
    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
    return getMockResponse(modelName, lastUserMsg?.content || '');
  }
}
