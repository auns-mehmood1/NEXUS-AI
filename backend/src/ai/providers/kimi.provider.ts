import axios from 'axios';

interface KimiMessage { role: string; content: string; }

export async function kimiChat(apiKey: string, model: string, messages: KimiMessage[]): Promise<string> {
  const baseUrl = process.env.KIMI_BASE_URL || 'https://api.moonshot.cn/v1';
  const response = await axios.post(
    `${baseUrl}/chat/completions`,
    { model: model || 'moonshot-v1-8k', messages, temperature: 0.7, max_tokens: 2000 },
    { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
  );
  return response.data.choices[0]?.message?.content || '';
}
