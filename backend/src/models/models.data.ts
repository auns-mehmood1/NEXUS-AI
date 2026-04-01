export interface ModelData {
  id: string; icon: string; bg: string; name: string;
  lab: string; org: string; desc: string; tags: string[];
  badge: string; badgeClass: string; rating: number;
  reviews: number; price: string; types: string[];
  price_start: number; context: string; provider: string;
}

export const MODELS_DATA: ModelData[] = [
  {id:'gpt5',icon:'🧠',bg:'#EEF2FD',name:'GPT-5',lab:'OpenAI',org:'OpenAI',desc:'OpenAI flagship. Native computer-use agents, advanced reasoning, 2M context.',tags:['Flagship','Agents','Multimodal','Reasoning'],badge:'hot',badgeClass:'badge-hot',rating:4.9,reviews:4210,price:'$7.50/1M tk',types:['language','vision','code'],price_start:7.5,context:'2M tokens',provider:'openai'},
  {id:'gpt52',icon:'🧠',bg:'#EEF2FD',name:'GPT-5.2',lab:'OpenAI',org:'OpenAI',desc:'Mid-tier GPT-5 variant with improved instruction-following and multimodal support.',tags:['Multimodal','Balanced','Instruction'],badge:'new',badgeClass:'badge-new',rating:4.8,reviews:2180,price:'$4/1M tk',types:['language','vision','code'],price_start:4,context:'128K tokens',provider:'openai'},
  {id:'gpt5-turbo',icon:'⚡',bg:'#EEF2FD',name:'GPT-5 Turbo',lab:'OpenAI',org:'OpenAI',desc:'Fast, cost-effective GPT-5 for high-volume deployments.',tags:['Fast','Cost-Effective','High-Volume'],badge:'hot',badgeClass:'badge-hot',rating:4.8,reviews:3560,price:'$2.50/1M tk',types:['language','vision','code'],price_start:2.5,context:'128K tokens',provider:'openai'},
  {id:'gpt4o',icon:'🌟',bg:'#EEF2FD',name:'GPT-4o',lab:'OpenAI',org:'OpenAI',desc:'Multimodal flagship combining text, vision, and audio in one unified model.',tags:['Multimodal','Vision','Audio','Coding'],badge:'',badgeClass:'',rating:4.7,reviews:5120,price:'$2.50/1M tk',types:['language','vision','code'],price_start:2.5,context:'128K tokens',provider:'openai'},
  {id:'gpt4o-mini',icon:'🔹',bg:'#EEF2FD',name:'GPT-4o-mini',lab:'OpenAI',org:'OpenAI',desc:'Affordable, fast GPT-4o for lightweight chat and classification tasks.',tags:['Fast','Budget','Chat'],badge:'',badgeClass:'',rating:4.5,reviews:4380,price:'$0.15/1M tk',types:['language','vision'],price_start:0.15,context:'128K tokens',provider:'openai'},
  {id:'o3',icon:'🧩',bg:'#EEF2FD',name:'o3',lab:'OpenAI',org:'OpenAI',desc:"OpenAI's advanced reasoning model with chain-of-thought for complex tasks.",tags:['Reasoning','Math','Science','Logic'],badge:'hot',badgeClass:'badge-hot',rating:4.8,reviews:1640,price:'$15/1M tk',types:['language','code'],price_start:15,context:'200K tokens',provider:'openai'},
  {id:'o4-mini',icon:'⭐',bg:'#EEF2FD',name:'o4-mini',lab:'OpenAI',org:'OpenAI',desc:'Latest compact reasoning model — best value for advanced chain-of-thought.',tags:['Reasoning','Compact','Best Value'],badge:'new',badgeClass:'badge-new',rating:4.7,reviews:890,price:'$1.10/1M tk',types:['language','code'],price_start:1.1,context:'128K tokens',provider:'openai'},
  {id:'claude-opus46',icon:'👑',bg:'#E2F5EF',name:'Claude Opus 4.6',lab:'Anthropic',org:'Anthropic',desc:'Most intelligent Claude. Adaptive Thinking, 1M token context, 128K max output.',tags:['Agents','Coding','Extended Thinking','Computer Use'],badge:'hot',badgeClass:'badge-hot',rating:4.9,reviews:2240,price:'$5/1M tk',types:['language','code'],price_start:5,context:'1M tokens',provider:'anthropic'},
  {id:'claude-sonnet46',icon:'⚡',bg:'#E2F5EF',name:'Claude Sonnet 4.6',lab:'Anthropic',org:'Anthropic',desc:'Best speed/intelligence balance. Adaptive Thinking, 1M context, 64K max output.',tags:['Balanced','Fast','Code','Extended Thinking'],badge:'new',badgeClass:'badge-new',rating:4.8,reviews:3180,price:'$3/1M tk',types:['language','code'],price_start:3,context:'1M tokens',provider:'anthropic'},
  {id:'claude-haiku45',icon:'🚀',bg:'#E2F5EF',name:'Claude Haiku 4.5',lab:'Anthropic',org:'Anthropic',desc:'Fastest near-frontier model. Extended Thinking, 200K context, lowest cost.',tags:['Fastest','Low Cost','Real-time'],badge:'',badgeClass:'',rating:4.6,reviews:1870,price:'$1/1M tk',types:['language','code'],price_start:1,context:'200K tokens',provider:'anthropic'},
  {id:'gemini25-pro',icon:'💎',bg:'#FDF5E0',name:'Gemini 2.5 Pro',lab:'Google',org:'Google DeepMind',desc:'SOTA reasoning with 1M context. Best on math, science, and coding benchmarks.',tags:['SOTA','Reasoning','1M Context'],badge:'hot',badgeClass:'badge-hot',rating:4.8,reviews:2340,price:'$1.25/1M tk',types:['language','vision','code'],price_start:1.25,context:'1M tokens',provider:'google'},
  {id:'gemini25-flash',icon:'💡',bg:'#FDF5E0',name:'Gemini 2.5 Flash',lab:'Google',org:'Google DeepMind',desc:'Best-in-class efficiency with thinking mode. Adaptive reasoning at low cost.',tags:['Efficient','Thinking Mode','Adaptive'],badge:'new',badgeClass:'badge-new',rating:4.6,reviews:1670,price:'$0.25/1M tk',types:['language','vision'],price_start:0.25,context:'1M tokens',provider:'google'},
  {id:'gemini20-flash',icon:'⚡',bg:'#FDF5E0',name:'Gemini 2.0 Flash',lab:'Google',org:'Google DeepMind',desc:'Real-time multimodal with low latency. Best for interactive agents.',tags:['Real-time','Multimodal','Streaming'],badge:'',badgeClass:'',rating:4.5,reviews:1230,price:'$0.10/1M tk',types:['language','vision'],price_start:0.1,context:'1M tokens',provider:'google'},
  {id:'llama4-maverick',icon:'🦙',bg:'#EEEDFE',name:'Llama 4 Maverick',lab:'Meta',org:'Meta',desc:'400B MoE architecture with multimodal understanding.',tags:['Open Source','400B MoE','Multimodal','Agentic'],badge:'hot',badgeClass:'badge-hot',rating:4.6,reviews:2950,price:'Free (self-host)',types:['language','vision','code','open'],price_start:0,context:'128K tokens',provider:'meta'},
  {id:'llama4-scout',icon:'🌟',bg:'#EEEDFE',name:'Llama 4 Scout',lab:'Meta',org:'Meta',desc:'Efficient MoE with 128K context for long-context tasks.',tags:['Open Source','Fast','Long Context','Summarization'],badge:'open',badgeClass:'badge-open',rating:4.5,reviews:1760,price:'Free (self-host)',types:['language','vision','open'],price_start:0,context:'128K tokens',provider:'meta'},
  {id:'deepseek-r1',icon:'🔬',bg:'#EAF3DE',name:'DeepSeek-R1',lab:'DeepSeek',org:'DeepSeek',desc:'Best for academic math proofs with open weights.',tags:['Reasoning','Math','Open Source','Academic'],badge:'open',badgeClass:'badge-open',rating:4.6,reviews:1340,price:'$0.14/1M tk',types:['language','code','open'],price_start:0.14,context:'128K tokens',provider:'deepseek'},
  {id:'deepseek-v3',icon:'💻',bg:'#EAF3DE',name:'DeepSeek-V3',lab:'DeepSeek',org:'DeepSeek',desc:'1T param MoE, 40% less memory. Best budget general model.',tags:['Open Source','Low Cost','Language','Efficient'],badge:'open',badgeClass:'badge-open',rating:4.5,reviews:2310,price:'~$0.07/1M tk',types:['language','code','open'],price_start:0.07,context:'128K tokens',provider:'deepseek'},
  {id:'qwen3-max',icon:'🀄',bg:'#FFF0E8',name:'Qwen3-Max',lab:'Alibaba',org:'Alibaba (Qwen)',desc:'1T param MoE supporting 119 languages.',tags:['Multilingual','MoE','APAC','Scale'],badge:'new',badgeClass:'badge-new',rating:4.6,reviews:1120,price:'$0.40/1M tk',types:['language','code'],price_start:0.4,context:'128K tokens',provider:'alibaba'},
  {id:'grok4',icon:'𝕏',bg:'#F2F2F2',name:'Grok-4',lab:'xAI',org:'xAI',desc:'Most intelligent Grok. Real-time X data, deep reasoning, 2M context.',tags:['Flagship','Real-Time','Deep Reasoning'],badge:'new',badgeClass:'badge-new',rating:4.6,reviews:780,price:'$3/1M tk',types:['language','vision'],price_start:3,context:'2M tokens',provider:'xai'},
  {id:'mistral-large3',icon:'🌀',bg:'#E4E1D8',name:'Mistral Large 3',lab:'Mistral',org:'Mistral AI',desc:'Flagship Mistral — frontier reasoning, multilingual, function calling.',tags:['Flagship','Multilingual','Function Calling'],badge:'new',badgeClass:'badge-new',rating:4.6,reviews:1040,price:'$2/1M tk',types:['language','code'],price_start:2,context:'128K tokens',provider:'mistral'},
  {id:'kimi-k2',icon:'🌙',bg:'#E8F4FD',name:'Kimi K2',lab:'Moonshot',org:'Moonshot AI',desc:'Advanced reasoning model with long context and strong coding abilities.',tags:['Reasoning','Long Context','Coding'],badge:'new',badgeClass:'badge-new',rating:4.6,reviews:890,price:'$0.60/1M tk',types:['language','code'],price_start:0.6,context:'128K tokens',provider:'kimi'},
];

// Fill to 400+ with generated models
for (let i = 0; i < 380; i++) {
  const labs = ['OpenAI','Anthropic','Google','Meta','DeepSeek','Alibaba','Mistral','Cohere','xAI','Together AI','Nvidia','Microsoft','IBM','HuggingFace','Stability AI'];
  const lab = labs[i % labs.length];
  MODELS_DATA.push({
    id: `model-ext-${i+1}`,
    icon: ['🤖','💬','🧬','🔭','🌐','⚙️','🎯','📡','💫','🔐'][i % 10],
    bg: ['#EEF2FD','#E2F5EF','#FDF5E0','#EEEDFE','#EAF3DE','#FFF0E8','#F2F2F2','#E4E1D8','#FDE8F0','#E8F4FD'][i % 10],
    name: `${lab} Model ${String.fromCharCode(65 + (i % 26))}${Math.floor(i/26)+1}`,
    lab, org: lab,
    desc: `Extended ${['language','vision','code','reasoning','multilingual'][i % 5]} model variant ${i+1} for specialized enterprise tasks.`,
    tags: [['Language','General'],['Vision','Multimodal'],['Code','Dev'],['Reasoning','STEM'],['Multilingual','Chat']][i % 5],
    badge: i % 7 === 0 ? 'new' : i % 11 === 0 ? 'hot' : '',
    badgeClass: i % 7 === 0 ? 'badge-new' : i % 11 === 0 ? 'badge-hot' : '',
    rating: parseFloat((3.8 + (i % 12) * 0.1).toFixed(1)),
    reviews: 100 + (i * 37) % 3000,
    price: i % 3 === 0 ? 'Free (self-host)' : `$${parseFloat((0.1 + (i % 20) * 0.25).toFixed(2))}/1M tk`,
    types: [['language'],['language','vision'],['language','code'],['code'],['language','open']][i % 5],
    price_start: i % 3 === 0 ? 0 : parseFloat((0.1 + (i % 20) * 0.25).toFixed(2)),
    context: ['4K tokens','8K tokens','16K tokens','32K tokens','128K tokens'][i % 5],
    provider: lab.toLowerCase().replace(/\s+/g,'-'),
  });
}
