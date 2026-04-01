'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MODELS_DATA } from '@/lib/models-data';

const AGENT_TEMPLATES = [
  { id: 'customer-support', icon: '💬', name: 'Customer Support Bot', desc: 'Handles inquiries, escalations, and ticket creation. Integrates with helpdesk tools.', tags: ['Support', 'Chat', 'Automation'], popular: true },
  { id: 'research-agent',   icon: '🔍', name: 'Research Agent',       desc: 'Deep research with web search, document analysis, and structured reports.', tags: ['Research', 'Web Search', 'Reports'], popular: true },
  { id: 'code-assistant',   icon: '💻', name: 'Code Assistant',       desc: 'Code generation, review, debugging, and documentation across 50+ languages.', tags: ['Code', 'Debug', 'Docs'], popular: true },
  { id: 'sales-assistant',  icon: '📈', name: 'Sales Assistant',      desc: 'Lead qualification, follow-ups, CRM updates, and proposal drafting.', tags: ['Sales', 'CRM', 'Outreach'], popular: false },
  { id: 'data-analyst',     icon: '📊', name: 'Data Analyst',         desc: 'Analyzes datasets, creates visualizations, and generates business insights.', tags: ['Data', 'Analytics', 'Insights'], popular: false },
  { id: 'content-creator',  icon: '✍️', name: 'Content Creator',     desc: 'Blog posts, social media, email campaigns — consistent brand voice at scale.', tags: ['Content', 'Social', 'SEO'], popular: false },
  { id: 'hr-assistant',     icon: '👥', name: 'HR Assistant',         desc: 'Screening, onboarding workflows, policy Q&A, and employee requests.', tags: ['HR', 'Recruiting', 'Onboarding'], popular: false },
  { id: 'finance-agent',    icon: '💰', name: 'Finance Agent',        desc: 'Invoice processing, expense categorization, and financial reporting.', tags: ['Finance', 'Accounting', 'Reports'], popular: false },
];

const WIZARD_STEPS = [
  'Choose Template',
  'Select Model',
  'Configure Prompt',
  'Connect Tools',
  'Review & Deploy',
];

export default function AgentsPage() {
  const router = useRouter();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof AGENT_TEMPLATES[0] | null>(null);
  const [selectedModel, setSelectedModel] = useState(MODELS_DATA[0]);
  const [agentName, setAgentName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');

  const capableModels = MODELS_DATA.filter(m => m.types.includes('language')).slice(0, 30);

  function startWizard(template: typeof AGENT_TEMPLATES[0]) {
    setSelectedTemplate(template);
    setAgentName(template.name);
    setSystemPrompt(`You are a ${template.name}. ${template.desc}\n\nBe helpful, concise, and professional. Always stay within your defined scope.`);
    setWizardStep(0);
    setWizardOpen(true);
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--blue-lt) 0%, var(--white) 100%)', borderBottom: '1px solid var(--border)', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--blue-lt)', border: '1px solid var(--blue-border)', borderRadius: '2rem', padding: '0.3rem 0.9rem', fontSize: '0.78rem', color: 'var(--blue)', marginBottom: '1.25rem' }}>
            🤖 Agent Builder — Beta
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Build <span style={{ color: 'var(--blue)' }}>AI Agents</span>
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '1rem', maxWidth: 540 }}>
            Create custom AI agents powered by 400+ models. Configure, deploy, and monitor your agents from one dashboard.
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: 10 }}>
            <button onClick={() => setWizardOpen(true)} style={{ background: 'var(--blue)', color: 'white', border: 'none', borderRadius: '2rem', padding: '0.75rem 1.75rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              + Create Agent
            </button>
            <button onClick={() => router.push('/chat')} style={{ background: 'none', border: '1px solid var(--border2)', borderRadius: '2rem', padding: '0.75rem 1.5rem', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              Try in Chat First
            </button>
          </div>
        </div>
      </div>

      {/* Agent templates */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.5rem' }}>Agent Templates</h2>
        <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Start from a template and customize for your needs.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {AGENT_TEMPLATES.map(t => (
            <div key={t.id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: '0.75rem' }}>
                <div style={{ width: 44, height: 44, background: 'var(--blue-lt)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>{t.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.92rem' }}>{t.name}</span>
                    {t.popular && <span style={{ background: 'var(--amber-lt)', color: 'var(--amber)', border: '1px solid rgba(138,90,0,0.2)', fontSize: '0.62rem', padding: '0.1rem 0.45rem', borderRadius: '2rem', fontWeight: 700 }}>Popular</span>}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text2)', lineHeight: 1.5, flex: 1, marginBottom: '0.75rem' }}>{t.desc}</p>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: '1rem' }}>
                {t.tags.map(tag => <span key={tag} style={{ background: 'var(--bg2)', borderRadius: '2rem', padding: '0.12rem 0.5rem', fontSize: '0.7rem', color: 'var(--text2)' }}>{tag}</span>)}
              </div>
              <button onClick={() => startWizard(t)} style={{ background: 'var(--blue)', color: 'white', border: 'none', borderRadius: '2rem', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Use Template →
              </button>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div style={{ marginTop: '3rem', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '2rem' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.2rem', marginBottom: '1.5rem' }}>How Agent Creation Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {[
              { step: '1', title: 'Choose Template', desc: 'Start from a pre-built template or create from scratch.' },
              { step: '2', title: 'Select Model', desc: 'Pick from 400+ AI models based on your requirements.' },
              { step: '3', title: 'Write System Prompt', desc: 'Define your agent\'s persona, scope, and behavior.' },
              { step: '4', title: 'Connect Tools', desc: 'Add web search, APIs, databases, and integrations.' },
              { step: '5', title: 'Deploy & Monitor', desc: 'Go live and track performance in real-time.' },
            ].map(s => (
              <div key={s.step} style={{ textAlign: 'center' }}>
                <div style={{ width: 36, height: 36, background: 'var(--blue)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', margin: '0 auto 0.75rem' }}>{s.step}</div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>{s.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wizard modal */}
      {wizardOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--white)', borderRadius: 20, maxWidth: 600, width: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Wizard header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.1rem' }}>🤖 Agent Creation Wizard</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: 2 }}>Step {wizardStep + 1} of {WIZARD_STEPS.length}: {WIZARD_STEPS[wizardStep]}</div>
              </div>
              <button onClick={() => setWizardOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text3)' }}>✕</button>
            </div>
            {/* Progress */}
            <div style={{ padding: '0 1.5rem', paddingTop: '1rem', display: 'flex', gap: 4 }}>
              {WIZARD_STEPS.map((s, i) => (
                <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= wizardStep ? 'var(--blue)' : 'var(--border2)' }} />
              ))}
            </div>
            {/* Wizard content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              {wizardStep === 0 && (
                <div>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: '1rem' }}>Name Your Agent</h3>
                  <input value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="e.g., Customer Support Bot" style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid var(--border2)', borderRadius: 10, fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', marginBottom: '1rem' }} />
                  {selectedTemplate && (
                    <div style={{ background: 'var(--blue-lt)', border: '1px solid var(--blue-border)', borderRadius: 10, padding: '1rem' }}>
                      <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>Template: {selectedTemplate.name}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>{selectedTemplate.desc}</div>
                    </div>
                  )}
                </div>
              )}
              {wizardStep === 1 && (
                <div>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: '1rem' }}>Select AI Model</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }}>
                    {capableModels.map(m => (
                      <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem', border: '1.5px solid', borderColor: selectedModel.id === m.id ? 'var(--blue)' : 'var(--border)', borderRadius: 10, cursor: 'pointer', background: selectedModel.id === m.id ? 'var(--blue-lt)' : 'none' }}>
                        <input type="radio" checked={selectedModel.id === m.id} onChange={() => setSelectedModel(m)} style={{ accentColor: 'var(--blue)' }} />
                        <span style={{ fontSize: '1.1rem' }}>{m.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{m.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{m.org} · {m.price}</div>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>⭐ {m.rating}</div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {wizardStep === 2 && (
                <div>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: '1rem' }}>System Prompt</h3>
                  <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} rows={8} style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid var(--border2)', borderRadius: 10, fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', resize: 'vertical' }} placeholder="Describe your agent's role, behavior, scope, and limitations..." />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '0.5rem' }}>Tip: Be specific about what the agent should and should not do.</div>
                </div>
              )}
              {wizardStep === 3 && (
                <div>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: '1rem' }}>Connect Tools</h3>
                  {['Web Search', 'Database Lookup', 'Email Send', 'Calendar Access', 'Slack Integration', 'Custom API'].map(tool => (
                    <label key={tool} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 8, cursor: 'pointer' }}>
                      <input type="checkbox" style={{ accentColor: 'var(--blue)' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{tool}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text3)' }}>Coming soon</span>
                    </label>
                  ))}
                </div>
              )}
              {wizardStep === 4 && (
                <div>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: '1.25rem' }}>Review & Deploy</h3>
                  {[{k:'Agent Name', v:agentName},{k:'Model',v:`${selectedModel.icon} ${selectedModel.name}`},{k:'Provider',v:selectedModel.org},{k:'Context',v:selectedModel.context}].map(row => (
                    <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text3)', fontWeight: 500 }}>{row.k}</span>
                      <span style={{ fontWeight: 600 }}>{row.v}</span>
                    </div>
                  ))}
                  <div style={{ background: 'var(--teal-lt)', border: '1px solid rgba(10,94,73,0.2)', borderRadius: 10, padding: '1rem', marginTop: '1rem', fontSize: '0.82rem', color: 'var(--teal)' }}>
                    ✅ Your agent configuration is ready. Click "Deploy Agent" to make it live.
                  </div>
                </div>
              )}
            </div>
            {/* Wizard footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              {wizardStep > 0 && (
                <button onClick={() => setWizardStep(s => s - 1)} style={{ background: 'none', border: '1px solid var(--border2)', borderRadius: '2rem', padding: '0.6rem 1.25rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem' }}>← Back</button>
              )}
              {wizardStep < WIZARD_STEPS.length - 1 ? (
                <button onClick={() => setWizardStep(s => s + 1)} style={{ background: 'var(--blue)', color: 'white', border: 'none', borderRadius: '2rem', padding: '0.6rem 1.5rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600 }}>
                  Continue →
                </button>
              ) : (
                <button onClick={() => { setWizardOpen(false); router.push('/chat?agent=new'); }} style={{ background: 'var(--teal)', color: 'white', border: 'none', borderRadius: '2rem', padding: '0.6rem 1.5rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600 }}>
                  🚀 Deploy Agent
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
