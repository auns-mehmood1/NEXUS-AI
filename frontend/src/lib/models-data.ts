export interface Model {
  id: string;
  icon: string;
  bg: string;
  name: string;
  lab: string;
  org: string;
  desc: string;
  tags: string[];
  badge: string;
  badgeClass: string;
  rating: number;
  reviews: number;
  price: string;
  types: string[];
  price_start: number;
  context: string;
  provider: string;
}

export const MODELS_DATA: Model[] = [
  // ── OpenAI ──────────────────────────────────────────────────────
  {id:'gpt5',icon:'🧠',bg:'#EEF2FD',name:'GPT-5',lab:'OpenAI',org:'OpenAI',desc:'OpenAI flagship. Native computer-use agents, advanced reasoning, 2M context.',tags:['Flagship','Agents','Multimodal','Reasoning'],badge:'hot',badgeClass:'badge-hot',rating:4.9,reviews:4210,price:'$7.50/1M tk',types:['language','vision','code'],price_start:7.5,context:'2M tokens',provider:'openai'},
  {id:'gpt52',icon:'🧠',bg:'#EEF2FD',name:'GPT-5.2',lab:'OpenAI',org:'OpenAI',desc:'Mid-tier GPT-5 variant with improved instruction-following and multimodal support.',tags:['Multimodal','Balanced','Instruction'],badge:'new',badgeClass:'badge-new',rating:4.8,reviews:2180,price:'$4/1M tk',types:['language','vision','code'],price_start:4,context:'128K tokens',provider:'openai'},
  {id:'gpt5-turbo',icon:'⚡',bg:'#EEF2FD',name:'GPT-5 Turbo',lab:'OpenAI',org:'OpenAI',desc:'Fast, cost-effective GPT-5 for high-volume deployments.',tags:['Fast','Cost-Effective','High-Volume'],badge:'hot',badgeClass:'badge-hot',rating:4.8,reviews:3560,price:'$2.50/1M tk',types:['language','vision','code'],price_start:2.5,context:'128K tokens',provider:'openai'},
  {id:'gpt45',icon:'🔮',bg:'#EEF2FD',name:'GPT-4.5',lab:'OpenAI',org:'OpenAI',desc:'Bridging model with improved creativity and long-form generation.',tags:['Creative','Long-form','Language'],badge:'',badgeClass:'',rating:4.7,reviews:1980,price:'$3/1M tk',types:['language','vision'],price_start:3,context:'128K tokens',provider:'openai'},
  {id:'gpt41',icon:'💡',bg:'#EEF2FD',name:'GPT-4.1',lab:'OpenAI',org:'OpenAI',desc:'Optimized for coding and instruction-following with 128K context.',tags:['Code','Instructions','128K'],badge:'',badgeClass:'',rating:4.7,reviews:2310,price:'$2/1M tk',types:['language','code'],price_start:2,context:'128K tokens',provider:'openai'},
  {id:'gpt41-mini',icon:'⚡',bg:'#EEF2FD',name:'GPT-4.1-mini',lab:'OpenAI',org:'OpenAI',desc:'Lightweight GPT-4.1 for fast, affordable everyday tasks.',tags:['Fast','Affordable','Everyday'],badge:'',badgeClass:'',rating:4.5,reviews:1870,price:'$0.40/1M tk',types:['language','code'],price_start:0.4,context:'128K tokens',provider:'openai'},
  {id:'gpt4o',icon:'🌟',bg:'#EEF2FD',name:'GPT-4o',lab:'OpenAI',org:'OpenAI',desc:'Multimodal flagship combining text, vision, and audio in one unified model.',tags:['Multimodal','Vision','Audio','Coding'],badge:'',badgeClass:'',rating:4.7,reviews:5120,price:'$2.50/1M tk',types:['language','vision','code'],price_start:2.5,context:'128K tokens',provider:'openai'},
  {id:'gpt4o-mini',icon:'🔹',bg:'#EEF2FD',name:'GPT-4o-mini',lab:'OpenAI',org:'OpenAI',desc:'Affordable, fast GPT-4o for lightweight chat and classification tasks.',tags:['Fast','Budget','Chat'],badge:'',badgeClass:'',rating:4.5,reviews:4380,price:'$0.15/1M tk',types:['language','vision'],price_start:0.15,context:'128K tokens',provider:'openai'},
  {id:'o3',icon:'🧩',bg:'#EEF2FD',name:'o3',lab:'OpenAI',org:'OpenAI',desc:"OpenAI's advanced reasoning model with chain-of-thought for complex tasks.",tags:['Reasoning','Math','Science','Logic'],badge:'hot',badgeClass:'badge-hot',rating:4.8,reviews:1640,price:'$15/1M tk',types:['language','code'],price_start:15,context:'200K tokens',provider:'openai'},
  {id:'o3-mini',icon:'🔸',bg:'#EEF2FD',name:'o3-mini',lab:'OpenAI',org:'OpenAI',desc:'Compact reasoning model for cost-effective STEM and logic tasks.',tags:['Reasoning','STEM','Efficient'],badge:'',badgeClass:'',rating:4.6,reviews:1120,price:'$1.10/1M tk',types:['language','code'],price_start:1.1,context:'128K tokens',provider:'openai'},
  {id:'o4-mini',icon:'⭐',bg:'#EEF2FD',name:'o4-mini',lab:'OpenAI',org:'OpenAI',desc:'Latest compact reasoning model — best value for advanced chain-of-thought.',tags:['Reasoning','Compact','Best Value'],badge:'new',badgeClass:'badge-new',rating:4.7,reviews:890,price:'$1.10/1M tk',types:['language','code'],price_start:1.1,context:'128K tokens',provider:'openai'},
  {id:'dall-e-3',icon:'🖼',bg:'#EEF2FD',name:'DALL-E 3',lab:'OpenAI',org:'OpenAI',desc:'OpenAI image generation with precise prompt adherence.',tags:['Image Gen','Precise','Creative'],badge:'',badgeClass:'',rating:4.6,reviews:2180,price:'$0.04/image',types:['image'],price_start:0.04,context:'N/A',provider:'openai'},
  {id:'whisper-large',icon:'🎙',bg:'#EEF2FD',name:'Whisper Large v3',lab:'OpenAI',org:'OpenAI',desc:'Best-in-class speech recognition across 99 languages.',tags:['Audio','Speech-to-Text','99 Languages'],badge:'',badgeClass:'',rating:4.7,reviews:2890,price:'$0.006/min',types:['audio','open'],price_start:0.006,context:'N/A',provider:'openai'},
  {id:'sora',icon:'🎥',bg:'#EEF2FD',name:'Sora',lab:'OpenAI',org:'OpenAI',desc:'OpenAI video generation with realistic physics and motion.',tags:['Video Gen','Realistic','Physics'],badge:'',badgeClass:'',rating:4.7,reviews:1890,price:'$15/mo',types:['video'],price_start:15,context:'N/A',provider:'openai'},
  // ── Anthropic ────────────────────────────────────────────────────
  {id:'claude-opus46',icon:'👑',bg:'#E2F5EF',name:'Claude Opus 4.6',lab:'Anthropic',org:'Anthropic',desc:'Most intelligent Claude. Adaptive Thinking, 1M token context (beta), 128K max output, Extended Thinking.',tags:['Agents','Coding','Extended Thinking','Computer Use'],badge:'hot',badgeClass:'badge-hot',rating:4.9,reviews:2240,price:'$5/1M tk',types:['language','code'],price_start:5,context:'1M tokens',provider:'anthropic'},
  {id:'claude-opus45',icon:'👑',bg:'#E2F5EF',name:'Claude Opus 4.5',lab:'Anthropic',org:'Anthropic',desc:'Previous-gen Opus with extended context and top-tier reasoning for complex tasks.',tags:['Reasoning','Extended Context','Coding'],badge:'',badgeClass:'',rating:4.8,reviews:1870,price:'$4/1M tk',types:['language','code'],price_start:4,context:'200K tokens',provider:'anthropic'},
  {id:'claude-opus4',icon:'👑',bg:'#E2F5EF',name:'Claude Opus 4',lab:'Anthropic',org:'Anthropic',desc:'Opus 4 — deep analysis, long-document processing, and nuanced writing.',tags:['Analysis','Long Documents','Writing'],badge:'',badgeClass:'',rating:4.8,reviews:1450,price:'$3/1M tk',types:['language','code'],price_start:3,context:'200K tokens',provider:'anthropic'},
  {id:'claude-sonnet46',icon:'⚡',bg:'#E2F5EF',name:'Claude Sonnet 4.6',lab:'Anthropic',org:'Anthropic',desc:'Best speed/intelligence balance. Adaptive Thinking, 1M context (beta), 64K max output.',tags:['Balanced','Fast','Code','Extended Thinking'],badge:'new',badgeClass:'badge-new',rating:4.8,reviews:3180,price:'$3/1M tk',types:['language','code'],price_start:3,context:'1M tokens',provider:'anthropic'},
  {id:'claude-sonnet45',icon:'⚡',bg:'#E2F5EF',name:'Claude Sonnet 4.5',lab:'Anthropic',org:'Anthropic',desc:'Reliable workhorse for coding, writing, and agentic tasks.',tags:['Coding','Writing','Agents'],badge:'',badgeClass:'',rating:4.7,reviews:2640,price:'$2.50/1M tk',types:['language','code'],price_start:2.5,context:'200K tokens',provider:'anthropic'},
  {id:'claude-haiku45',icon:'🚀',bg:'#E2F5EF',name:'Claude Haiku 4.5',lab:'Anthropic',org:'Anthropic',desc:'Fastest near-frontier model. Extended Thinking, 200K context, lowest cost at $1/$5 MTok.',tags:['Fastest','Low Cost','Real-time'],badge:'',badgeClass:'',rating:4.6,reviews:1870,price:'$1/1M tk',types:['language','code'],price_start:1,context:'200K tokens',provider:'anthropic'},
  {id:'claude-haiku4',icon:'🚀',bg:'#E2F5EF',name:'Claude Haiku 4',lab:'Anthropic',org:'Anthropic',desc:'Entry-level Haiku — instant responses for chat, classification, and triage.',tags:['Chat','Classification','Budget'],badge:'',badgeClass:'',rating:4.5,reviews:1340,price:'$0.80/1M tk',types:['language'],price_start:0.8,context:'200K tokens',provider:'anthropic'},
  // ── Google DeepMind ──────────────────────────────────────────────
  {id:'gemini31-pro',icon:'🔬',bg:'#FDF5E0',name:'Gemini 3.1 Pro',lab:'Google',org:'Google DeepMind',desc:'Deep reasoning with up to 5M context and Thought Signatures.',tags:['Deep Reasoning','5M Context','Thought Signatures'],badge:'new',badgeClass:'badge-new',rating:4.7,reviews:1450,price:'$2/1M tk',types:['language','vision'],price_start:2,context:'5M tokens',provider:'google'},
  {id:'gemini3-pro',icon:'🔬',bg:'#FDF5E0',name:'Gemini 3 Pro',lab:'Google',org:'Google DeepMind',desc:'Powerful multimodal reasoning with 2M context window and native tool use.',tags:['Multimodal','2M Context','Tool Use'],badge:'',badgeClass:'',rating:4.6,reviews:1120,price:'$1.50/1M tk',types:['language','vision'],price_start:1.5,context:'2M tokens',provider:'google'},
  {id:'gemini3-flash',icon:'⚡',bg:'#FDF5E0',name:'Gemini 3 Flash',lab:'Google',org:'Google DeepMind',desc:'High-volume chat and coding with sub-second latency and 1M context.',tags:['Fast','1M Context','Chat','Coding'],badge:'hot',badgeClass:'badge-hot',rating:4.5,reviews:1890,price:'$0.50/1M tk',types:['language','vision'],price_start:0.5,context:'1M tokens',provider:'google'},
  {id:'gemini25-pro',icon:'💎',bg:'#FDF5E0',name:'Gemini 2.5 Pro',lab:'Google',org:'Google DeepMind',desc:'State-of-the-art reasoning with 1M context. SOTA on math, science, and coding benchmarks.',tags:['SOTA','Reasoning','1M Context'],badge:'hot',badgeClass:'badge-hot',rating:4.8,reviews:2340,price:'$1.25/1M tk',types:['language','vision','code'],price_start:1.25,context:'1M tokens',provider:'google'},
  {id:'gemini25-flash',icon:'💡',bg:'#FDF5E0',name:'Gemini 2.5 Flash',lab:'Google',org:'Google DeepMind',desc:'Best-in-class efficiency with thinking mode. Adaptive reasoning at low cost.',tags:['Efficient','Thinking Mode','Adaptive'],badge:'new',badgeClass:'badge-new',rating:4.6,reviews:1670,price:'$0.25/1M tk',types:['language','vision'],price_start:0.25,context:'1M tokens',provider:'google'},
  {id:'gemini20-flash',icon:'⚡',bg:'#FDF5E0',name:'Gemini 2.0 Flash',lab:'Google',org:'Google DeepMind',desc:'Real-time multimodal with low latency. Best for interactive agents and streaming.',tags:['Real-time','Multimodal','Streaming'],badge:'',badgeClass:'',rating:4.5,reviews:1230,price:'$0.10/1M tk',types:['language','vision'],price_start:0.1,context:'1M tokens',provider:'google'},
  {id:'gemini15-pro',icon:'🌟',bg:'#FDF5E0',name:'Gemini 1.5 Pro',lab:'Google',org:'Google DeepMind',desc:'1M context with multimodal understanding. Proven for long-document processing.',tags:['1M Context','Long Document','Multimodal'],badge:'',badgeClass:'',rating:4.5,reviews:2100,price:'$0.35/1M tk',types:['language','vision'],price_start:0.35,context:'1M tokens',provider:'google'},
  // ── Meta ─────────────────────────────────────────────────────────
  {id:'llama4-maverick',icon:'🦙',bg:'#EEEDFE',name:'Llama 4 Maverick',lab:'Meta',org:'Meta',desc:'400B MoE architecture with multimodal understanding.',tags:['Open Source','400B MoE','Multimodal','Agentic'],badge:'hot',badgeClass:'badge-hot',rating:4.6,reviews:2950,price:'Free (self-host)',types:['language','vision','code','open'],price_start:0,context:'128K tokens',provider:'meta'},
  {id:'llama4-scout',icon:'🌟',bg:'#EEEDFE',name:'Llama 4 Scout',lab:'Meta',org:'Meta',desc:'Efficient MoE with 128K context for long-context tasks.',tags:['Open Source','Fast','Long Context','Summarization'],badge:'open',badgeClass:'badge-open',rating:4.5,reviews:1760,price:'Free (self-host)',types:['language','vision','open'],price_start:0,context:'128K tokens',provider:'meta'},
  {id:'llama33-70b',icon:'🦙',bg:'#EEEDFE',name:'Llama 3.3 70B',lab:'Meta',org:'Meta',desc:'High-quality 70B model with instruction-tuning for coding and chat.',tags:['Open Source','70B','Coding','Chat'],badge:'',badgeClass:'',rating:4.5,reviews:2180,price:'Free (self-host)',types:['language','code','open'],price_start:0,context:'128K tokens',provider:'meta'},
  {id:'llama31-405b',icon:'🔮',bg:'#EEEDFE',name:'Llama 3.1 405B',lab:'Meta',org:'Meta',desc:"Largest open-source model. Frontier-level reasoning and multilingual ability.",tags:['Open Source','405B','Frontier','Multilingual'],badge:'open',badgeClass:'badge-open',rating:4.7,reviews:1640,price:'Free (self-host)',types:['language','code','open'],price_start:0,context:'128K tokens',provider:'meta'},
  {id:'llama31-70b',icon:'🦙',bg:'#EEEDFE',name:'Llama 3.1 70B',lab:'Meta',org:'Meta',desc:'Best-in-class 70B for balanced cost and capability on self-hosted infrastructure.',tags:['Open Source','70B','Balanced','Self-Host'],badge:'',badgeClass:'',rating:4.5,reviews:2890,price:'Free (self-host)',types:['language','code','open'],price_start:0,context:'128K tokens',provider:'meta'},
  {id:'llama3-70b',icon:'🦙',bg:'#EEEDFE',name:'Llama 3 70B',lab:'Meta',org:'Meta',desc:'Proven 70B model with strong chat and instruction-following performance.',tags:['Open Source','Chat','Instructions'],badge:'',badgeClass:'',rating:4.4,reviews:3210,price:'Free (self-host)',types:['language','open'],price_start:0,context:'8K tokens',provider:'meta'},
  {id:'llama3-8b',icon:'🐾',bg:'#EEEDFE',name:'Llama 3 8B',lab:'Meta',org:'Meta',desc:'Compact, fast 8B model for edge deployment and low-latency applications.',tags:['Open Source','8B','Edge','Fast'],badge:'',badgeClass:'',rating:4.2,reviews:4120,price:'Free (self-host)',types:['language','open'],price_start:0,context:'8K tokens',provider:'meta'},
  // ── DeepSeek ─────────────────────────────────────────────────────
  {id:'deepseek-r1',icon:'🔬',bg:'#EAF3DE',name:'DeepSeek-R1',lab:'DeepSeek',org:'DeepSeek',desc:'Formal theorem proving in Lean 4. Best for academic math proofs with open weights.',tags:['Reasoning','Math','Open Source','Academic'],badge:'open',badgeClass:'badge-open',rating:4.6,reviews:1340,price:'$0.14/1M tk',types:['language','code','open'],price_start:0.14,context:'128K tokens',provider:'deepseek'},
  {id:'deepseek-v3',icon:'💻',bg:'#EAF3DE',name:'DeepSeek-V3',lab:'DeepSeek',org:'DeepSeek',desc:'1T param MoE, 40% less memory, 1.8× faster inference. Best budget general model.',tags:['Open Source','Low Cost','Language','Efficient'],badge:'open',badgeClass:'badge-open',rating:4.5,reviews:2310,price:'~$0.07/1M tk',types:['language','code','open'],price_start:0.07,context:'128K tokens',provider:'deepseek'},
  {id:'deepseek-v32',icon:'🧪',bg:'#EAF3DE',name:'DeepSeek-V3.2',lab:'DeepSeek',org:'DeepSeek',desc:'Sparse Attention for cheaper inference. 128K–164K context.',tags:['Sparse Attention','Agents','Long Context'],badge:'new',badgeClass:'badge-new',rating:4.4,reviews:780,price:'$0.25/1M tk',types:['language','code'],price_start:0.25,context:'164K tokens',provider:'deepseek'},
  {id:'deepseek-coder',icon:'⌨️',bg:'#EAF3DE',name:'DeepSeek Coder V2',lab:'DeepSeek',org:'DeepSeek',desc:'Specialized for code generation, completion, and repair. 338 programming languages.',tags:['Code','338 Languages','Completion','Repair'],badge:'',badgeClass:'',rating:4.5,reviews:1560,price:'$0.14/1M tk',types:['code','open'],price_start:0.14,context:'128K tokens',provider:'deepseek'},
  // ── Alibaba (Qwen) ────────────────────────────────────────────────
  {id:'qwen3-max',icon:'🀄',bg:'#FFF0E8',name:'Qwen3-Max',lab:'Alibaba',org:'Alibaba (Qwen)',desc:'1T param MoE supporting 119 languages. Beats GPT-4o on benchmarks.',tags:['Multilingual','MoE','APAC','Scale'],badge:'new',badgeClass:'badge-new',rating:4.6,reviews:1120,price:'$0.40/1M tk',types:['language','code'],price_start:0.4,context:'128K tokens',provider:'alibaba'},
  {id:'qwen3',icon:'🀄',bg:'#FFF0E8',name:'Qwen3',lab:'Alibaba',org:'Alibaba (Qwen)',desc:'Dense 235B model with thinking mode and strong multilingual reasoning.',tags:['Dense','Multilingual','Thinking Mode'],badge:'new',badgeClass:'badge-new',rating:4.5,reviews:870,price:'$0.60/1M tk',types:['language','code'],price_start:0.6,context:'128K tokens',provider:'alibaba'},
  {id:'qwen25-max',icon:'🌟',bg:'#FFF0E8',name:'Qwen2.5-Max',lab:'Alibaba',org:'Alibaba (Qwen)',desc:'Previous flagship with SOTA performance on coding and math benchmarks.',tags:['SOTA','Coding','Math'],badge:'',badgeClass:'',rating:4.5,reviews:1340,price:'$0.40/1M tk',types:['language','code'],price_start:0.4,context:'128K tokens',provider:'alibaba'},
  {id:'qwen25-72b',icon:'🔹',bg:'#FFF0E8',name:'Qwen2.5-72B',lab:'Alibaba',org:'Alibaba (Qwen)',desc:'Open-weight 72B model — self-hostable, high-quality multilingual output.',tags:['Open Source','72B','Multilingual'],badge:'open',badgeClass:'badge-open',rating:4.4,reviews:980,price:'Free (self-host)',types:['language','code','open'],price_start:0,context:'128K tokens',provider:'alibaba'},
  {id:'qwen-vl',icon:'🖼',bg:'#FFF0E8',name:'Qwen-VL',lab:'Alibaba',org:'Alibaba (Qwen)',desc:'Vision-language model for document OCR, chart understanding, and visual Q&A.',tags:['Vision','OCR','Charts','Visual Q&A'],badge:'',badgeClass:'',rating:4.3,reviews:540,price:'$0.35/1M tk',types:['vision','language'],price_start:0.35,context:'32K tokens',provider:'alibaba'},
  {id:'qwq-32b',icon:'🧠',bg:'#FFF0E8',name:'QwQ-32B',lab:'Alibaba',org:'Alibaba (Qwen)',desc:'Reasoning-first 32B model. Deep chain-of-thought for math and science.',tags:['Reasoning','Math','Chain-of-Thought'],badge:'open',badgeClass:'badge-open',rating:4.5,reviews:680,price:'Free (self-host)',types:['language','open'],price_start:0,context:'128K tokens',provider:'alibaba'},
  // ── xAI ─────────────────────────────────────────────────────────
  {id:'grok4',icon:'𝕏',bg:'#F2F2F2',name:'Grok-4',lab:'xAI',org:'xAI',desc:'Most intelligent Grok. Real-time X data, deep reasoning, 2M context.',tags:['Flagship','Real-Time','Deep Reasoning'],badge:'new',badgeClass:'badge-new',rating:4.6,reviews:780,price:'$3/1M tk',types:['language','vision'],price_start:3,context:'2M tokens',provider:'xai'},
  {id:'grok4-fast',icon:'𝕏',bg:'#F2F2F2',name:'Grok-4 Fast',lab:'xAI',org:'xAI',desc:'4-agent architecture with real-time X data access.',tags:['Real-Time','4-Agent','Fast','X Data'],badge:'hot',badgeClass:'badge-hot',rating:4.5,reviews:870,price:'$0.20/1M tk',types:['language','vision'],price_start:0.2,context:'2M tokens',provider:'xai'},
  {id:'grok3',icon:'𝕏',bg:'#F2F2F2',name:'Grok-3',lab:'xAI',org:'xAI',desc:'Flagship reasoning with extended thinking and real-time web access.',tags:['Reasoning','Extended Thinking','Web Access'],badge:'',badgeClass:'',rating:4.4,reviews:1120,price:'$2/1M tk',types:['language','vision'],price_start:2,context:'128K tokens',provider:'xai'},
  {id:'grok2',icon:'𝕏',bg:'#F2F2F2',name:'Grok-2',lab:'xAI',org:'xAI',desc:'Reliable mid-tier Grok with strong general reasoning and X integration.',tags:['Reasoning','X Integration','General'],badge:'',badgeClass:'',rating:4.3,reviews:1460,price:'$1/1M tk',types:['language'],price_start:1,context:'32K tokens',provider:'xai'},
  // ── Mistral AI ───────────────────────────────────────────────────
  {id:'mistral-large3',icon:'🌀',bg:'#E4E1D8',name:'Mistral Large 3',lab:'Mistral',org:'Mistral AI',desc:'Flagship Mistral — frontier reasoning, multilingual, and function calling.',tags:['Flagship','Multilingual','Function Calling'],badge:'new',badgeClass:'badge-new',rating:4.6,reviews:1040,price:'$2/1M tk',types:['language','code'],price_start:2,context:'128K tokens',provider:'mistral'},
  {id:'mistral-large2',icon:'🌀',bg:'#E4E1D8',name:'Mistral Large 2',lab:'Mistral',org:'Mistral AI',desc:'Strong code and reasoning capabilities with 128K context.',tags:['Code','Reasoning','128K'],badge:'',badgeClass:'',rating:4.5,reviews:1380,price:'$1.50/1M tk',types:['language','code'],price_start:1.5,context:'128K tokens',provider:'mistral'},
  {id:'mixtral-8x22b',icon:'🌀',bg:'#E4E1D8',name:'Mixtral 8x22B',lab:'Mistral',org:'Mistral AI',desc:'Powerful open MoE model with 64K context and strong multilingual support.',tags:['Open Source','MoE','Multilingual','64K'],badge:'open',badgeClass:'badge-open',rating:4.5,reviews:1680,price:'Free (self-host)',types:['language','code','open'],price_start:0,context:'64K tokens',provider:'mistral'},
  {id:'mixtral-8x7b',icon:'🌀',bg:'#E4E1D8',name:'Mixtral 8x7B',lab:'Mistral',org:'Mistral AI',desc:'Lightweight MoE for fast, affordable self-hosted inference.',tags:['Open Source','Fast','MoE','Budget'],badge:'open',badgeClass:'badge-open',rating:4.3,reviews:2340,price:'Free (self-host)',types:['language','open'],price_start:0,context:'32K tokens',provider:'mistral'},
  {id:'codestral',icon:'⌨️',bg:'#E4E1D8',name:'Codestral',lab:'Mistral',org:'Mistral AI',desc:'Code-first model with 32K context and fill-in-the-middle support.',tags:['Code','32K','Fill-in-Middle'],badge:'',badgeClass:'',rating:4.4,reviews:870,price:'$0.20/1M tk',types:['code'],price_start:0.2,context:'32K tokens',provider:'mistral'},
  {id:'mistral-7b',icon:'🔸',bg:'#E4E1D8',name:'Mistral 7B',lab:'Mistral',org:'Mistral AI',desc:'Fast, lightweight open-source model for deployment on modest hardware.',tags:['Open Source','7B','Lightweight','Fast'],badge:'open',badgeClass:'badge-open',rating:4.2,reviews:3120,price:'Free (self-host)',types:['language','open'],price_start:0,context:'32K tokens',provider:'mistral'},
  // ── Cohere ───────────────────────────────────────────────────────
  {id:'command-r-plus',icon:'🧭',bg:'#FDE8F0',name:'Command R+',lab:'Cohere',org:'Cohere',desc:'Enterprise RAG-optimized model with grounding and citation support.',tags:['RAG','Enterprise','Citations','Grounding'],badge:'',badgeClass:'',rating:4.5,reviews:980,price:'$2.50/1M tk',types:['language','code'],price_start:2.5,context:'128K tokens',provider:'cohere'},
  {id:'command-r',icon:'🧭',bg:'#FDE8F0',name:'Command R',lab:'Cohere',org:'Cohere',desc:'Optimized for RAG with multi-step reasoning and citations.',tags:['RAG','Multi-step','Citations'],badge:'',badgeClass:'',rating:4.3,reviews:760,price:'$0.15/1M tk',types:['language'],price_start:0.15,context:'128K tokens',provider:'cohere'},
  // ── Moonshot (Kimi) ──────────────────────────────────────────────
  {id:'kimi-k2',icon:'🌙',bg:'#E8F4FD',name:'Kimi K2',lab:'Moonshot',org:'Moonshot AI',desc:'Advanced reasoning model with long context and strong coding abilities.',tags:['Reasoning','Long Context','Coding'],badge:'new',badgeClass:'badge-new',rating:4.6,reviews:890,price:'$0.60/1M tk',types:['language','code'],price_start:0.6,context:'128K tokens',provider:'kimi'},
  {id:'kimi-moonshot',icon:'🌙',bg:'#E8F4FD',name:'Moonshot v1',lab:'Moonshot',org:'Moonshot AI',desc:'Long context specialist — handles 128K token documents natively.',tags:['Long Context','Documents','Chat'],badge:'',badgeClass:'',rating:4.4,reviews:1120,price:'$0.12/1M tk',types:['language'],price_start:0.12,context:'128K tokens',provider:'kimi'},
  // ── Image Generation ─────────────────────────────────────────────
  {id:'midjourney',icon:'🌈',bg:'#F5EFF8',name:'Midjourney v6',lab:'Midjourney',org:'Midjourney',desc:'Premium artistic image generation with stunning aesthetics.',tags:['Image Gen','Artistic','Premium'],badge:'',badgeClass:'',rating:4.8,reviews:4560,price:'$10/mo',types:['image'],price_start:10,context:'N/A',provider:'midjourney'},
  {id:'flux-pro',icon:'🌊',bg:'#EEF8F5',name:'FLUX.1 Pro',lab:'Black Forest',org:'Black Forest Labs',desc:'Next-gen image generation with superior detail and coherence.',tags:['Image Gen','High Detail','Coherent'],badge:'new',badgeClass:'badge-new',rating:4.7,reviews:1120,price:'$0.055/image',types:['image'],price_start:0.055,context:'N/A',provider:'blackforest'},
  {id:'stable-diffusion-xl',icon:'🎨',bg:'#FDF0FF',name:'SDXL',lab:'Stability AI',org:'Stability AI',desc:'State-of-the-art open image generation with photorealistic quality.',tags:['Image Gen','Open Source','Photorealistic'],badge:'',badgeClass:'',rating:4.5,reviews:3240,price:'Free (self-host)',types:['image','open'],price_start:0,context:'N/A',provider:'stability'},
  {id:'stable-diffusion-3',icon:'🎨',bg:'#FDF0FF',name:'Stable Diffusion 3',lab:'Stability AI',org:'Stability AI',desc:'Latest SD with improved text rendering and photorealism.',tags:['Image Gen','Open Source','Text Rendering'],badge:'new',badgeClass:'badge-new',rating:4.6,reviews:1890,price:'$0.035/image',types:['image','open'],price_start:0.035,context:'N/A',provider:'stability'},
  // ── Audio ─────────────────────────────────────────────────────────
  {id:'elevenlabs',icon:'🔊',bg:'#FFF5E8',name:'ElevenLabs TTS',lab:'ElevenLabs',org:'ElevenLabs',desc:'Ultra-realistic text-to-speech with voice cloning.',tags:['Audio','TTS','Voice Cloning'],badge:'',badgeClass:'',rating:4.8,reviews:3450,price:'$0.30/1K chars',types:['audio'],price_start:0.3,context:'N/A',provider:'elevenlabs'},
  {id:'suno-v4',icon:'🎵',bg:'#FFF0F8',name:'Suno v4',lab:'Suno',org:'Suno',desc:'AI music generation from text prompts. Full songs in seconds.',tags:['Audio','Music Gen','Creative'],badge:'new',badgeClass:'badge-new',rating:4.6,reviews:2340,price:'$10/mo',types:['audio'],price_start:10,context:'N/A',provider:'suno'},
  // ── Video ─────────────────────────────────────────────────────────
  {id:'kling-v2',icon:'🎬',bg:'#F0F8FF',name:'Kling v2',lab:'Kuaishou',org:'Kuaishou',desc:'Advanced video generation with cinematic quality.',tags:['Video Gen','Cinematic','Long Duration'],badge:'new',badgeClass:'badge-new',rating:4.5,reviews:780,price:'$0.14/s',types:['video'],price_start:0.14,context:'N/A',provider:'kuaishou'},
  {id:'runway-gen3',icon:'🎬',bg:'#EEF2FD',name:'Runway Gen-3',lab:'Runway',org:'Runway',desc:'Professional video generation with precise motion control.',tags:['Video Gen','Motion Control','Professional'],badge:'',badgeClass:'',rating:4.6,reviews:1230,price:'$0.05/s',types:['video'],price_start:0.05,context:'N/A',provider:'runway'},
  // ── Microsoft ────────────────────────────────────────────────────
  {id:'phi4',icon:'Φ',bg:'#F0F8FF',name:'Phi-4',lab:'Microsoft',org:'Microsoft',desc:'Compact 14B model with reasoning and STEM capabilities.',tags:['Compact','STEM','Reasoning'],badge:'',badgeClass:'',rating:4.4,reviews:820,price:'Free (self-host)',types:['language','code','open'],price_start:0,context:'16K tokens',provider:'microsoft'},
  {id:'phi3',icon:'Φ',bg:'#F0F8FF',name:'Phi-3',lab:'Microsoft',org:'Microsoft',desc:'Small but capable language model for resource-constrained deployments.',tags:['Small','Efficient','Edge'],badge:'',badgeClass:'',rating:4.2,reviews:1240,price:'Free (self-host)',types:['language','open'],price_start:0,context:'128K tokens',provider:'microsoft'},
  {id:'phi35-moe',icon:'Φ',bg:'#F0F8FF',name:'Phi-3.5-MoE',lab:'Microsoft',org:'Microsoft',desc:'MoE variant with improved reasoning and multilingual capabilities.',tags:['MoE','Multilingual','Reasoning'],badge:'',badgeClass:'',rating:4.3,reviews:560,price:'Free (self-host)',types:['language','open'],price_start:0,context:'128K tokens',provider:'microsoft'},
  // ── AI21 Labs ────────────────────────────────────────────────────
  {id:'jamba15',icon:'🎸',bg:'#FFF8E8',name:'Jamba 1.5',lab:'AI21',org:'AI21 Labs',desc:'Hybrid SSM-Transformer with 256K context and strong instruction following.',tags:['Hybrid','256K Context','Instruction'],badge:'',badgeClass:'',rating:4.4,reviews:640,price:'$0.50/1M tk',types:['language','code'],price_start:0.5,context:'256K tokens',provider:'ai21'},
  {id:'j2-ultra',icon:'🎸',bg:'#FFF8E8',name:'Jurassic-2 Ultra',lab:'AI21',org:'AI21 Labs',desc:'Enterprise-grade model with structured generation and grounding.',tags:['Enterprise','Structured','Grounding'],badge:'',badgeClass:'',rating:4.2,reviews:890,price:'$0.188/1K tk',types:['language'],price_start:0.188,context:'8K tokens',provider:'ai21'},
  // ── Perplexity ───────────────────────────────────────────────────
  {id:'sonar-pro',icon:'🔍',bg:'#E8F8FF',name:'Sonar Pro',lab:'Perplexity',org:'Perplexity',desc:'Search-augmented model with real-time web citations.',tags:['Search','Citations','Real-time'],badge:'',badgeClass:'',rating:4.5,reviews:1240,price:'$3/1M tk',types:['language'],price_start:3,context:'127K tokens',provider:'perplexity'},
  {id:'sonar-large',icon:'🔍',bg:'#E8F8FF',name:'Sonar Large',lab:'Perplexity',org:'Perplexity',desc:'Large search model for complex research queries.',tags:['Research','Search','Complex'],badge:'',badgeClass:'',rating:4.4,reviews:890,price:'$1/1M tk',types:['language'],price_start:1,context:'127K tokens',provider:'perplexity'},
  // ── Amazon ───────────────────────────────────────────────────────
  {id:'titan-text',icon:'🔺',bg:'#FFF0E0',name:'Titan Text G1',lab:'Amazon',org:'Amazon Web Services',desc:'AWS native model for enterprise text generation and summarization.',tags:['Enterprise','AWS Native','Summarization'],badge:'',badgeClass:'',rating:4.1,reviews:760,price:'$0.003/1K tk',types:['language'],price_start:0.003,context:'8K tokens',provider:'amazon'},
  {id:'nova-pro',icon:'🔺',bg:'#FFF0E0',name:'Amazon Nova Pro',lab:'Amazon',org:'Amazon Web Services',desc:'State-of-the-art multimodal model from Amazon.',tags:['Multimodal','AWS','Enterprise'],badge:'new',badgeClass:'badge-new',rating:4.5,reviews:580,price:'$0.80/1M tk',types:['language','vision'],price_start:0.8,context:'300K tokens',provider:'amazon'},
  // ── Together AI ──────────────────────────────────────────────────
  {id:'together-moe',icon:'🤝',bg:'#E8F0FE',name:'Together MoE',lab:'Together',org:'Together AI',desc:'Optimized MoE model for fast, affordable inference.',tags:['MoE','Fast','Affordable'],badge:'',badgeClass:'',rating:4.2,reviews:430,price:'$0.08/1M tk',types:['language','open'],price_start:0.08,context:'32K tokens',provider:'together'},
  // ── Groq ─────────────────────────────────────────────────────────
  {id:'groq-llama70b',icon:'⚡',bg:'#F0FFE8',name:'Groq Llama 70B',lab:'Groq',org:'Groq',desc:'Llama 70B on Groq LPU — world-fastest inference at 800 tokens/sec.',tags:['Ultra-Fast','LPU','Low Latency'],badge:'',badgeClass:'',rating:4.5,reviews:870,price:'$0.59/1M tk',types:['language','open'],price_start:0.59,context:'8K tokens',provider:'groq'},
  {id:'groq-mixtral',icon:'⚡',bg:'#F0FFE8',name:'Groq Mixtral',lab:'Groq',org:'Groq',desc:'Mixtral 8x7B on Groq LPU for blazing-fast responses.',tags:['Ultra-Fast','MoE','Budget'],badge:'',badgeClass:'',rating:4.3,reviews:640,price:'$0.24/1M tk',types:['language','open'],price_start:0.24,context:'32K tokens',provider:'groq'},
  // ── IBM ──────────────────────────────────────────────────────────
  {id:'granite-34b',icon:'💎',bg:'#F5F5F5',name:'Granite 34B',lab:'IBM',org:'IBM',desc:'Enterprise-focused model with strong compliance and safety features.',tags:['Enterprise','Compliance','Safe'],badge:'',badgeClass:'',rating:4.2,reviews:540,price:'Free (self-host)',types:['language','code','open'],price_start:0,context:'4K tokens',provider:'ibm'},
  {id:'granite-code',icon:'💎',bg:'#F5F5F5',name:'Granite Code 34B',lab:'IBM',org:'IBM',desc:'Code-specialized Granite model for enterprise development.',tags:['Code','Enterprise','Open Source'],badge:'',badgeClass:'',rating:4.3,reviews:380,price:'Free (self-host)',types:['code','open'],price_start:0,context:'8K tokens',provider:'ibm'},
  // ── 01.AI ────────────────────────────────────────────────────────
  {id:'yi-large',icon:'🈶',bg:'#F5F0FF',name:'Yi-Large',lab:'01.AI',org:'01.AI',desc:'Chinese-English bilingual with strong reasoning.',tags:['Bilingual','Reasoning','Chinese'],badge:'',badgeClass:'',rating:4.3,reviews:640,price:'$3/1M tk',types:['language'],price_start:3,context:'32K tokens',provider:'01ai'},
  {id:'yi-34b',icon:'🈶',bg:'#F5F0FF',name:'Yi-34B',lab:'01.AI',org:'01.AI',desc:'Open-weight 34B bilingual model with strong performance.',tags:['Open Source','34B','Bilingual'],badge:'open',badgeClass:'badge-open',rating:4.2,reviews:780,price:'Free (self-host)',types:['language','open'],price_start:0,context:'200K tokens',provider:'01ai'},
  // ── Nvidia ───────────────────────────────────────────────────────
  {id:'nemotron-ultra',icon:'🟢',bg:'#E8FFE8',name:'Nemotron Ultra',lab:'Nvidia',org:'Nvidia',desc:'Nvidia flagship with advanced reasoning and 253B parameters.',tags:['Ultra-Large','253B','Reasoning'],badge:'new',badgeClass:'badge-new',rating:4.6,reviews:420,price:'Free (self-host)',types:['language','code','open'],price_start:0,context:'128K tokens',provider:'nvidia'},
  {id:'nemotron-4-340b',icon:'🟢',bg:'#E8FFE8',name:'Nemotron 4 340B',lab:'Nvidia',org:'Nvidia',desc:'340B enterprise model for high-performance AI applications.',tags:['Enterprise','340B','High-Performance'],badge:'open',badgeClass:'badge-open',rating:4.5,reviews:310,price:'Free (self-host)',types:['language','code','open'],price_start:0,context:'4K tokens',provider:'nvidia'},
  // ── Open Source Community ────────────────────────────────────────
  {id:'falcon-180b',icon:'🦅',bg:'#FFF8E8',name:'Falcon 180B',lab:'TII',org:'TII',desc:'Open-source 180B model from Technology Innovation Institute.',tags:['Open Source','180B','Multilingual'],badge:'open',badgeClass:'badge-open',rating:4.3,reviews:760,price:'Free (self-host)',types:['language','open'],price_start:0,context:'4K tokens',provider:'tii'},
  {id:'nous-hermes3',icon:'📜',bg:'#F0EEF8',name:'Nous Hermes 3',lab:'Nous Research',org:'Nous Research',desc:'Instruction-tuned open model with strong general capabilities.',tags:['Open Source','Instruction','General'],badge:'open',badgeClass:'badge-open',rating:4.3,reviews:890,price:'Free (self-host)',types:['language','open'],price_start:0,context:'128K tokens',provider:'nous'},
  {id:'openhermes',icon:'🏺',bg:'#F8F0EE',name:'OpenHermes 2.5',lab:'Teknium',org:'Teknium',desc:'Fine-tuned Mistral with excellent instruction following.',tags:['Open Source','Fine-tuned','Instructions'],badge:'open',badgeClass:'badge-open',rating:4.2,reviews:1560,price:'Free (self-host)',types:['language','open'],price_start:0,context:'4K tokens',provider:'teknium'},
  {id:'zephyr-7b',icon:'💨',bg:'#EEF8F5',name:'Zephyr 7B',lab:'HuggingFace',org:'HuggingFace',desc:'DPO-trained 7B model — excellent alignment at small scale.',tags:['Open Source','7B','DPO','Aligned'],badge:'open',badgeClass:'badge-open',rating:4.2,reviews:1230,price:'Free (self-host)',types:['language','open'],price_start:0,context:'4K tokens',provider:'huggingface'},
  {id:'solar-pro',icon:'☀️',bg:'#FFFDE8',name:'Solar Pro',lab:'Upstage',org:'Upstage',desc:'Instruction-following model optimized for document understanding.',tags:['Documents','Instructions','Efficient'],badge:'',badgeClass:'',rating:4.2,reviews:430,price:'$0.70/1M tk',types:['language'],price_start:0.7,context:'32K tokens',provider:'upstage'},
  // ── More models to reach 400+ ────────────────────────────────────
  ...Array.from({length: 330}, (_, i) => ({
    id: `model-ext-${i+1}`,
    icon: ['🤖','💬','🧬','🔭','🌐','⚙️','🎯','📡','🔐','💫'][i % 10],
    bg: ['#EEF2FD','#E2F5EF','#FDF5E0','#EEEDFE','#EAF3DE','#FFF0E8','#F2F2F2','#E4E1D8','#FDE8F0','#E8F4FD'][i % 10],
    name: `Model ${['Alpha','Beta','Gamma','Delta','Epsilon','Zeta','Eta','Theta','Iota','Kappa'][i % 10]}-${Math.floor(i/10)+1}`,
    lab: ['OpenAI','Anthropic','Google','Meta','DeepSeek','Alibaba','Mistral','Cohere','xAI','Together AI'][i % 10],
    org: ['OpenAI','Anthropic','Google DeepMind','Meta','DeepSeek','Alibaba (Qwen)','Mistral AI','Cohere','xAI','Together AI'][i % 10],
    desc: `Extended model variant ${i+1} for specialized ${['language','vision','code','reasoning','multilingual'][i % 5]} tasks.`,
    tags: [['Language','General'], ['Vision','Multimodal'], ['Code','Dev'], ['Reasoning','STEM'], ['Multilingual','Chat']][i % 5],
    badge: i % 7 === 0 ? 'new' : i % 11 === 0 ? 'hot' : '',
    badgeClass: i % 7 === 0 ? 'badge-new' : i % 11 === 0 ? 'badge-hot' : '',
    rating: +(3.8 + (i % 12) * 0.1).toFixed(1),
    reviews: 100 + (i * 37) % 3000,
    price: i % 3 === 0 ? 'Free (self-host)' : `$${(0.1 + (i % 20) * 0.25).toFixed(2)}/1M tk`,
    types: [['language'],['language','vision'],['language','code'],['code'],['language','open']][i % 5] as string[],
    price_start: i % 3 === 0 ? 0 : +(0.1 + (i % 20) * 0.25),
    context: ['4K tokens','8K tokens','16K tokens','32K tokens','128K tokens'][i % 5],
    provider: ['openai','anthropic','google','meta','deepseek','alibaba','mistral','cohere','xai','together'][i % 10],
  })),
];

export const CPANEL_DATA: Record<string, string[]> = {
  use_cases: [
    'Help me find the best AI model for my project',
    'I want to build an AI chatbot for my website',
    'Generate realistic images for my marketing campaign',
    'Analyse documents and extract key information',
    'Create AI agents for workflow automation',
    'Add voice and speech recognition to my app',
  ],
  monitor: [
    'Track regulatory changes in my industry',
    'Alert me when a product drops in price',
    'Track my portfolio and alert me on big moves',
    'Watch for job postings at target companies',
    'Monitor a competitor daily for any changes',
    'Set up news alerts for my niche topic',
  ],
  prototype: [
    'Build a quick prototype for my app idea',
    'Create a REST API scaffold for my project',
    'Generate a landing page from my description',
    'Turn my wireframe description into working HTML',
    'Build a chatbot prototype in under 10 minutes',
    'Create a data pipeline prototype with sample code',
  ],
  business: [
    'Write a business plan for my startup idea',
    'Create a go-to-market strategy for my product',
    'Draft a financial projection model for investors',
    'Identify my target market and ideal customer profile',
    'Write an executive summary for my pitch deck',
    'Create a competitive analysis for my industry',
  ],
  create: [
    'Write a blog post about AI trends in my industry',
    'Create social media captions for my product launch',
    'Generate an email newsletter for my audience',
    'Write a product description that converts',
    'Create an infographic script on a complex topic',
    'Draft a script for a 2-minute explainer video',
  ],
  analyze: [
    'Analyse this dataset and summarise key insights',
    'Compare the top AI models by performance and cost',
    'Research the competitive landscape in my market',
    'Summarise recent AI research papers on a topic',
    'Identify trends from my customer feedback data',
    'Build a pros and cons comparison for two options',
  ],
  learn: [
    'Explain how large language models work simply',
    'Teach me prompt engineering from scratch',
    'What is RAG and when should you use it?',
    'Help me understand AI agent architectures',
    'Explain the difference between fine-tuning and RAG',
    'Give me a 5-minute overview of AI safety concepts',
  ],
};

export const LANGUAGES = [
  {code:'EN',label:'English'},
  {code:'AR',label:'Arabic'},
  {code:'UR',label:'Urdu'},
  {code:'FR',label:'French'},
  {code:'DE',label:'German'},
  {code:'ES',label:'Spanish'},
  {code:'ZH',label:'Chinese'},
  {code:'JA',label:'Japanese'},
  {code:'PT',label:'Portuguese'},
  {code:'RU',label:'Russian'},
  {code:'HI',label:'Hindi'},
  {code:'TR',label:'Turkish'},
];
