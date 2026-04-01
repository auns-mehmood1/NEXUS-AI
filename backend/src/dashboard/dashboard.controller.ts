import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('dashboard')
export class DashboardController {
  @UseGuards(JwtAuthGuard)
  @Get('usage')
  getUsage(@CurrentUser() _user: any) {
    // Real implementation would aggregate from sessions
    return {
      totalRequests: 142,
      avgLatency: 1.2,
      totalCost: 0.45,
      requests24h: Array.from({ length: 24 }, (_, i) => Math.floor(Math.random() * 10) + 1),
      topModels: [
        { id: 'gpt4o', name: 'GPT-4o', requests: 45 },
        { id: 'claude-sonnet46', name: 'Claude Sonnet 4.6', requests: 38 },
        { id: 'gemini25-pro', name: 'Gemini 2.5 Pro', requests: 29 },
        { id: 'llama4-maverick', name: 'Llama 4 Maverick', requests: 18 },
        { id: 'deepseek-v3', name: 'DeepSeek-V3', requests: 12 },
      ],
    };
  }
}
