'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useModels, usePublicContent, type AgentTemplate } from '@/lib/catalog';

export default function AgentsPage() {
  const router = useRouter();
  const { data: models = [], isLoading: modelsLoading } = useModels();
  const { data: content, isLoading: contentLoading } = usePublicContent();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [agentName, setAgentName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');

  const agentTemplates = content?.agentTemplates ?? [];
  const wizardSteps = content?.agentWizardSteps ?? [];
  const capableModels = useMemo(() => models.filter((model) => model.types.includes('language')).slice(0, 30), [models]);
  const selectedModel = capableModels.find((model) => model.id === selectedModelId) ?? capableModels[0] ?? null;

  useEffect(() => {
    if (!selectedModelId && capableModels.length > 0) {
      setSelectedModelId(capableModels[0].id);
    }
  }, [capableModels, selectedModelId]);

  function startWizard(template: AgentTemplate) {
    setSelectedTemplate(template);
    setAgentName(template.name);
    setSystemPrompt(`You are a ${template.name}. ${template.desc}\n\nBe helpful, concise, and professional. Always stay within your defined scope.`);
    setWizardStep(0);
    setWizardOpen(true);
  }

  if (modelsLoading || contentLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>Loading agents...</div>;
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg, var(--blue-lt) 0%, var(--white) 100%)', borderBottom: '1px solid var(--border)', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--blue-lt)', border: '1px solid var(--blue-border)', borderRadius: '2rem', padding: '0.3rem 0.9rem', fontSize: '0.78rem', color: 'var(--blue)', marginBottom: '1.25rem' }}>
            Agent Builder - Beta
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

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.5rem' }}>Agent Templates</h2>
        <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Start from a template and customize for your needs.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {agentTemplates.map((template) => (
            <div key={template.id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: '0.75rem' }}>
                <div style={{ width: 44, height: 44, background: 'var(--blue-lt)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>{template.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.92rem' }}>{template.name}</span>
                    {template.popular && <span style={{ background: 'var(--amber-lt)', color: 'var(--amber)', border: '1px solid rgba(138,90,0,0.2)', fontSize: '0.62rem', padding: '0.1rem 0.45rem', borderRadius: '2rem', fontWeight: 700 }}>Popular</span>}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text2)', lineHeight: 1.5, flex: 1, marginBottom: '0.75rem' }}>{template.desc}</p>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: '1rem' }}>
                {template.tags.map((tag) => <span key={tag} style={{ background: 'var(--bg2)', borderRadius: '2rem', padding: '0.12rem 0.5rem', fontSize: '0.7rem', color: 'var(--text2)' }}>{tag}</span>)}
              </div>
              <button onClick={() => startWizard(template)} style={{ background: 'var(--blue)', color: 'white', border: 'none', borderRadius: '2rem', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Use Template -&gt;
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '3rem', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '2rem' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.2rem', marginBottom: '1.5rem' }}>How Agent Creation Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {[
              { step: '1', title: 'Choose Template', desc: 'Start from a pre-built template or create from scratch.' },
              { step: '2', title: 'Select Model', desc: 'Pick from 400+ AI models based on your requirements.' },
              { step: '3', title: 'Write System Prompt', desc: "Define your agent's persona, scope, and behavior." },
              { step: '4', title: 'Connect Tools', desc: 'Add web search, APIs, databases, and integrations.' },
              { step: '5', title: 'Deploy & Monitor', desc: 'Go live and track performance in real-time.' },
            ].map((step) => (
              <div key={step.step} style={{ textAlign: 'center' }}>
                <div style={{ width: 36, height: 36, background: 'var(--blue)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', margin: '0 auto 0.75rem' }}>{step.step}</div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>{step.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {wizardOpen && selectedModel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--white)', borderRadius: 20, maxWidth: 600, width: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.1rem' }}>Agent Creation Wizard</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: 2 }}>Step {wizardStep + 1} of {wizardSteps.length}: {wizardSteps[wizardStep]}</div>
              </div>
              <button onClick={() => setWizardOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text3)' }}>x</button>
            </div>
            <div style={{ padding: '0 1.5rem', paddingTop: '1rem', display: 'flex', gap: 4 }}>
              {wizardSteps.map((step, index) => (
                <div key={step} style={{ flex: 1, height: 4, borderRadius: 2, background: index <= wizardStep ? 'var(--blue)' : 'var(--border2)' }} />
              ))}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              {wizardStep === 0 && (
                <div>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: '1rem' }}>Name Your Agent</h3>
                  <input value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="e.g., Customer Support Bot" style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid var(--border2)', borderRadius: 10, fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', marginBottom: '1rem' }} />
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
                    {capableModels.map((model) => (
                      <label key={model.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem', border: '1.5px solid', borderColor: selectedModel.id === model.id ? 'var(--blue)' : 'var(--border)', borderRadius: 10, cursor: 'pointer', background: selectedModel.id === model.id ? 'var(--blue-lt)' : 'none' }}>
                        <input type="radio" checked={selectedModel.id === model.id} onChange={() => setSelectedModelId(model.id)} style={{ accentColor: 'var(--blue)' }} />
                        <span style={{ fontSize: '1.1rem' }}>{model.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{model.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{model.org} | {model.price}</div>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>Rating {model.rating}</div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {wizardStep === 2 && (
                <div>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: '1rem' }}>System Prompt</h3>
                  <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={8} style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid var(--border2)', borderRadius: 10, fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', resize: 'vertical' }} placeholder="Describe your agent's role, behavior, scope, and limitations..." />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '0.5rem' }}>Tip: Be specific about what the agent should and should not do.</div>
                </div>
              )}
              {wizardStep === 3 && (
                <div>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: '1rem' }}>Connect Tools</h3>
                  {['Web Search', 'Database Lookup', 'Email Send', 'Calendar Access', 'Slack Integration', 'Custom API'].map((tool) => (
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
                  {[{ k: 'Agent Name', v: agentName }, { k: 'Model', v: `${selectedModel.icon} ${selectedModel.name}` }, { k: 'Provider', v: selectedModel.org }, { k: 'Context', v: selectedModel.context }].map((row) => (
                    <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text3)', fontWeight: 500 }}>{row.k}</span>
                      <span style={{ fontWeight: 600 }}>{row.v}</span>
                    </div>
                  ))}
                  <div style={{ background: 'var(--teal-lt)', border: '1px solid rgba(10,94,73,0.2)', borderRadius: 10, padding: '1rem', marginTop: '1rem', fontSize: '0.82rem', color: 'var(--teal)' }}>
                    Ready: Your agent configuration is ready. Click "Deploy Agent" to make it live.
                  </div>
                </div>
              )}
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              {wizardStep > 0 && (
                <button onClick={() => setWizardStep((step) => step - 1)} style={{ background: 'none', border: '1px solid var(--border2)', borderRadius: '2rem', padding: '0.6rem 1.25rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem' }}>&lt;- Back</button>
              )}
              {wizardStep < wizardSteps.length - 1 ? (
                <button onClick={() => setWizardStep((step) => step + 1)} style={{ background: 'var(--blue)', color: 'white', border: 'none', borderRadius: '2rem', padding: '0.6rem 1.5rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600 }}>
                  Continue -&gt;
                </button>
              ) : (
                <button onClick={() => { setWizardOpen(false); router.push('/chat?agent=new'); }} style={{ background: 'var(--teal)', color: 'white', border: 'none', borderRadius: '2rem', padding: '0.6rem 1.5rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600 }}>
                  Deploy Agent
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
