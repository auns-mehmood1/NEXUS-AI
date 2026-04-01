export function getMockResponse(modelName: string, content: string): string {
  const lc = content.toLowerCase();
  if (lc.includes('hello') || lc.includes('hi ')) return `Hello! I'm ${modelName}. How can I help you today?`;
  if (lc.includes('code') || lc.includes('function')) return `Here's an example:\n\`\`\`javascript\nfunction example() {\n  return 'Hello from ${modelName}';\n}\n\`\`\``;
  if (lc.includes('explain')) return `**Explanation from ${modelName}:**\n\nThis topic involves several key concepts:\n1. Foundation principles\n2. Practical application\n3. Best practices\n\nWould you like me to go deeper on any aspect?`;
  return `I'm ${modelName} and I've processed your request. Here's my response:\n\n${content.length > 50 ? 'Based on your detailed query, ' : ''}I can help with analysis, writing, coding, research, and more. What would you like to explore further?`;
}
