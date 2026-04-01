'use client';

import { useMemo, useRef, useState, type ChangeEvent, type CSSProperties, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useModels,
  usePublicContent,
  type HomePageBudgetBucket,
  type HomePageComparisonRow,
  type HomePageTrendingCard,
  type HomePageUseCase,
  type Model,
} from '@/lib/catalog';
import styles from './home.module.css';

type Tone = 'accent' | 'amber' | 'blue' | 'rose' | 'teal';

const TONE_STYLES: Record<Tone, { background: string; borderColor: string; color: string }> = {
  accent: {
    background: 'var(--accent-lt)',
    borderColor: 'var(--accent-border)',
    color: 'var(--accent)',
  },
  amber: {
    background: 'var(--amber-lt)',
    borderColor: 'rgba(138, 90, 0, 0.15)',
    color: 'var(--amber)',
  },
  blue: {
    background: 'var(--blue-lt)',
    borderColor: 'var(--blue-border)',
    color: 'var(--blue)',
  },
  rose: {
    background: 'var(--rose-lt)',
    borderColor: 'rgba(155, 32, 66, 0.15)',
    color: 'var(--rose)',
  },
  teal: {
    background: 'var(--teal-lt)',
    borderColor: 'rgba(10, 94, 73, 0.15)',
    color: 'var(--teal)',
  },
};

const TAG_TONES = ['accent', 'teal', 'blue', 'amber', 'rose'] as const;

type AttachmentChip = {
  icon: string;
  name: string;
};

export default function HomePage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [attachments, setAttachments] = useState<AttachmentChip[]>([]);
  const { data: models = [] } = useModels();
  const { data: content } = usePublicContent();

  const homePage = content?.homePage;

  const featuredModels = useMemo(() => {
    if (!homePage) return [] as Model[];

    const selected = new Map<string, Model>();
    const modelMap = new Map(models.map((model) => [model.id, model]));

    homePage.featuredModelIds.forEach((id) => {
      const model = modelMap.get(id);
      if (model) selected.set(id, model);
    });

    if (selected.size < 6) {
      models.forEach((model) => {
        if (!selected.has(model.id) && selected.size < 6) {
          selected.set(model.id, model);
        }
      });
    }

    return Array.from(selected.values());
  }, [homePage, models]);

  if (!homePage) {
    return <div className={styles.loadingState}>Loading homepage...</div>;
  }

  const liveCountLabel = models.length > 0 ? `${models.length}+ models live - updated daily` : homePage.hero.eyebrow;

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (value) {
      router.push(`/chat?q=${encodeURIComponent(value)}`);
      return;
    }
    router.push('/chat');
  }

  function launchPrompt(prompt: string) {
    router.push(`/chat?q=${encodeURIComponent(prompt)}`);
  }

  function nudgeQuery(nextValue: string) {
    setQuery((current) => current || nextValue);
    inputRef.current?.focus();
  }

  function handleFileSelection(kind: 'file' | 'image', event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setAttachments((current) => [
      ...current,
      { icon: kind === 'image' ? '🖼' : '📄', name: file.name },
    ]);

    if (kind === 'image') {
      setQuery(`What AI tools can help me work with this image: "${file.name}"?`);
    } else {
      setQuery(`Help me find AI tools for my file: "${file.name}"`);
    }

    event.target.value = '';
    inputRef.current?.focus();
  }

  function handleNewsletterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const destination = newsletterEmail.trim()
      ? `/auth/signup?email=${encodeURIComponent(newsletterEmail.trim())}`
      : '/auth/signup';
    router.push(destination);
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroEyebrow}>
            <span className={styles.liveDot} />
            {liveCountLabel}
          </div>

          <h1 className={styles.heroTitle}>
            {homePage.hero.title} <span className={styles.heroAccent}>{homePage.hero.accent}</span>
            <br />
            {homePage.hero.subtitle}
          </h1>

          <p className={styles.heroDescription}>{homePage.hero.description}</p>

          <div className={styles.heroSearchRoot}>
            <form className={styles.heroSearchCard} onSubmit={handleSearch}>
              <div className={styles.heroSearchRow}>
                <input
                  ref={inputRef}
                  className={styles.heroSearchInput}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={homePage.hero.placeholder}
                />

                <div className={styles.heroSearchActions}>
                  <button
                    className={styles.heroSearchIcon}
                    type="button"
                    title="Voice conversation"
                    onClick={() => nudgeQuery('I want to talk through what I need')}
                  >
                    <MicrophoneIcon />
                  </button>
                  <button
                    className={styles.heroSearchIcon}
                    type="button"
                    title="Voice typing"
                    onClick={() => nudgeQuery('Help me write down what I need')}
                  >
                    <TypingIcon />
                  </button>
                  <button
                    className={styles.heroSearchIcon}
                    type="button"
                    title="Video"
                    onClick={() => nudgeQuery('I want AI help creating video content')}
                  >
                    <VideoIcon />
                  </button>
                  <button
                    className={styles.heroSearchIcon}
                    type="button"
                    title="Screen sharing"
                    onClick={() => nudgeQuery('I need AI help with something on my screen')}
                  >
                    <ScreenIcon />
                  </button>
                  <button
                    className={styles.heroSearchIcon}
                    type="button"
                    title="Attach file"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <AttachmentIcon />
                  </button>
                  <button
                    className={styles.heroSearchIcon}
                    type="button"
                    title="Upload image"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <ImageIcon />
                  </button>
                  <span className={styles.heroSearchDivider} />
                </div>

                <button className={styles.heroSearchSubmit} type="submit">
                  <SearchIcon />
                  {homePage.hero.cta}
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept=".pdf,.doc,.docx,.txt,.csv"
                onChange={(event) => handleFileSelection('file', event)}
              />
              <input
                ref={imageInputRef}
                type="file"
                hidden
                accept="image/*"
                onChange={(event) => handleFileSelection('image', event)}
              />
            </form>

            {attachments.length > 0 && (
              <div className={styles.attachmentRow}>
                {attachments.map((attachment, index) => (
                  <span key={`${attachment.name}-${index}`} className={styles.attachmentChip}>
                    <span>{attachment.icon}</span>
                    <span>{attachment.name}</span>
                    <button
                      className={styles.attachmentRemove}
                      type="button"
                      onClick={() =>
                        setAttachments((current) => current.filter((_, currentIndex) => currentIndex !== index))
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className={styles.heroActionGrid}>
            {homePage.heroActions.map((action) => (
              <button
                key={action.label}
                className={`${styles.heroActionButton} ${
                  action.label === 'Just exploring' ? styles.heroActionButtonExplore : ''
                }`}
                type="button"
                onClick={() => launchPrompt(action.prompt)}
              >
                <span className={styles.heroActionIcon}>{action.icon}</span>
                <span className={styles.heroActionLabel}>{action.label}</span>
              </button>
            ))}
          </div>

          <div className={styles.heroStats}>
            {homePage.stats.map((stat) => (
              <div key={stat.label} className={styles.heroStat}>
                <strong className={styles.heroStatValue}>{stat.value}</strong>
                <span className={styles.heroStatLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Featured Models</h2>
            <Link className={styles.sectionLink} href="/marketplace">
              Browse all {models.length || '400+'} →
            </Link>
          </div>

          <div className={styles.modelsGrid}>
            {featuredModels.map((model) => (
              <ModelCard key={model.id} model={model} onUse={() => router.push(`/chat?model=${encodeURIComponent(model.id)}`)} />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Built for every builder</h2>
          </div>

          <div className={styles.featureGrid}>
            {homePage.builderFeatures.map((feature) => (
              <Link key={feature.title} className={styles.featureCard} href={feature.href}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Browse by AI Lab</h2>
            <Link className={styles.sectionLink} href="/marketplace">
              See all labs →
            </Link>
          </div>

          <div className={styles.labGrid}>
            {homePage.labs.map((lab) => (
              <Link key={lab.name} className={styles.labCard} href={lab.href}>
                <div className={styles.labIcon}>{lab.icon}</div>
                <div className={styles.labName}>{lab.name}</div>
                <div className={styles.labSummary}>{lab.summary}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Flagship Model Comparison</h2>
            <Link className={styles.sectionLink} href="/marketplace">
              Compare all →
            </Link>
          </div>

          <p className={styles.sectionDescription}>
            Side-by-side view of the leading models across all major labs. Input/Output prices per 1M tokens.
          </p>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHeadRow}>
                  <th className={styles.tableHeadCell} style={{ textAlign: 'left' }}>Model</th>
                  <th className={styles.tableHeadCell} style={{ textAlign: 'left' }}>Lab</th>
                  <th className={styles.tableHeadCell} style={{ textAlign: 'center' }}>Context</th>
                  <th className={styles.tableHeadCell} style={{ textAlign: 'center' }}>Input $/1M</th>
                  <th className={styles.tableHeadCell} style={{ textAlign: 'center' }}>Output $/1M</th>
                  <th className={styles.tableHeadCell} style={{ textAlign: 'center' }}>Multimodal</th>
                  <th className={styles.tableHeadCell} style={{ textAlign: 'center' }}>Speed</th>
                  <th className={styles.tableHeadCell} style={{ textAlign: 'left' }}>Best For</th>
                </tr>
              </thead>
              <tbody>
                {homePage.comparisonRows.map((row) => (
                  <ComparisonTableRow key={row.model} row={row} />
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.comparisonNote}>
            * Prices shown are approximate. Free self-hosted models exclude infrastructure costs. Beta pricing may change.
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>🔥 Trending This Week</h2>
            <Link className={styles.sectionLink} href="/discover">
              View research feed →
            </Link>
          </div>

          <div className={styles.trendGrid}>
            {homePage.trending.map((card) => (
              <TrendingCard key={card.title} card={card} onOpen={() => launchPrompt(card.prompt)} />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Find Models by Budget</h2>
          </div>

          <div className={styles.budgetGrid}>
            {homePage.budgetBuckets.map((bucket) => (
              <BudgetCard key={bucket.title} bucket={bucket} onOpen={() => router.push(bucket.href)} />
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Quick-Start by Use Case</h2>
          </div>

          <div className={styles.useCaseGrid}>
            {homePage.useCases.map((useCase) => (
              <UseCaseCard key={useCase.title} useCase={useCase} onOpen={() => launchPrompt(useCase.prompt)} />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.newsletter}>
        <div className={styles.newsletterInner}>
          <div className={styles.newsletterEyebrow}>{homePage.newsletter.eyebrow}</div>
          <h2 className={styles.newsletterTitle}>
            {homePage.newsletter.title}
            <br />
            {homePage.newsletter.subtitle}
          </h2>
          <p className={styles.newsletterDescription}>{homePage.newsletter.description}</p>

          <form className={styles.newsletterForm} onSubmit={handleNewsletterSubmit}>
            <input
              className={styles.newsletterInput}
              type="email"
              value={newsletterEmail}
              onChange={(event) => setNewsletterEmail(event.target.value)}
              placeholder={homePage.newsletter.placeholder}
            />
            <button className={styles.newsletterButton} type="submit">
              {homePage.newsletter.buttonLabel} →
            </button>
          </form>

          <p className={styles.newsletterFinePrint}>{homePage.newsletter.finePrint}</p>
        </div>
      </section>

      <footer className={styles.footerStrip}>
        <div className={styles.footerBrand}>{homePage.footer.brand}</div>
        <div className={styles.footerLinks}>
          {homePage.footer.links.map((link) =>
            link.href.startsWith('/') ? (
              <Link key={link.label} className={styles.footerLink} href={link.href}>
                {link.label}
              </Link>
            ) : (
              <a key={link.label} className={styles.footerLink} href={link.href}>
                {link.label}
              </a>
            ),
          )}
        </div>
      </footer>
    </div>
  );
}

function ModelCard({ model, onUse }: { model: Model; onUse: () => void }) {
  return (
    <article className={styles.modelCard}>
      <div className={styles.modelTop}>
        <div className={styles.modelIdentity}>
          <div className={styles.modelIcon} style={{ background: model.bg }}>
            {model.icon}
          </div>

          <div className={styles.modelMeta}>
            <div className={styles.modelNameRow}>
              <span className={styles.modelName}>{model.name}</span>
              {model.badge ? <span className={model.badgeClass}>{model.badge}</span> : null}
            </div>
            <div className={styles.modelOrg}>{model.org}</div>
          </div>
        </div>

        <div className={styles.modelRating}>★ {model.rating.toFixed(1)}</div>
      </div>

      <p className={styles.modelDescription}>
        {model.desc.length > 122 ? `${model.desc.slice(0, 122)}...` : model.desc}
      </p>

      <div className={styles.modelTags}>
        {model.tags.slice(0, 3).map((tag, index) => {
          const tone = TONE_STYLES[TAG_TONES[index % TAG_TONES.length]];
          return (
            <span
              key={tag}
              className={styles.modelTag}
              style={{
                background: tone.background,
                color: tone.color,
              }}
            >
              {tag}
            </span>
          );
        })}
      </div>

      <div className={styles.modelFooter}>
        <span className={styles.modelPrice}>{model.price}</span>
        <button className={styles.modelButton} type="button" onClick={onUse}>
          Use in Chat
        </button>
      </div>
    </article>
  );
}

function ComparisonTableRow({ row }: { row: HomePageComparisonRow }) {
  const tone = TONE_STYLES[row.speedTone];

  return (
    <tr className={styles.tableBodyRow}>
      <td className={`${styles.tableCell} ${styles.tableCellStrong}`}>{row.model}</td>
      <td className={styles.tableCell}>{row.lab}</td>
      <td className={`${styles.tableCell} ${styles.centerCell}`}>{row.context}</td>
      <td className={`${styles.tableCell} ${styles.centerCell} ${styles.tableCellAccent}`}>{row.inputPrice}</td>
      <td className={`${styles.tableCell} ${styles.centerCell} ${styles.tableCellAccent}`}>{row.outputPrice}</td>
      <td className={`${styles.tableCell} ${styles.centerCell}`}>
        <span style={{ color: row.multimodal ? 'var(--green)' : 'var(--rose)', fontWeight: 700 }}>
          {row.multimodal ? '✓' : '✕'}
        </span>
      </td>
      <td className={`${styles.tableCell} ${styles.centerCell}`}>
        <span className={styles.speedBadge} style={{ color: tone.color }}>
          <span className={styles.speedDot} style={{ background: tone.color }} />
          {row.speed}
        </span>
      </td>
      <td className={styles.tableCell}>{row.bestFor}</td>
    </tr>
  );
}

function TrendingCard({ card, onOpen }: { card: HomePageTrendingCard; onOpen: () => void }) {
  const tone = TONE_STYLES[card.badgeTone];

  return (
    <button className={styles.trendCard} type="button" onClick={onOpen}>
      <div className={styles.trendMeta}>
        <span
          className={styles.trendBadge}
          style={{
            background: tone.background,
            color: tone.color,
            border: `1px solid ${tone.borderColor}`,
          }}
        >
          {card.badge}
        </span>
        <span className={styles.trendLab}>{card.lab}</span>
      </div>
      <h3 className={styles.trendTitle}>{card.title}</h3>
      <p className={styles.trendDescription}>{card.description}</p>
    </button>
  );
}

function BudgetCard({ bucket, onOpen }: { bucket: HomePageBudgetBucket; onOpen: () => void }) {
  const tone = TONE_STYLES[bucket.tone];
  const cardStyle: CSSProperties = {
    background: tone.background,
    border: `1px solid ${tone.borderColor}`,
  };

  return (
    <button className={styles.budgetCard} style={cardStyle} type="button" onClick={onOpen}>
      <div className={styles.budgetIcon}>{bucket.icon}</div>
      <h3 className={styles.budgetTitle} style={{ color: tone.color }}>
        {bucket.title}
      </h3>
      <p className={styles.budgetDescription}>{bucket.description}</p>
      <div className={styles.budgetCta} style={{ color: tone.color }}>
        {bucket.cta} →
      </div>
    </button>
  );
}

function UseCaseCard({ useCase, onOpen }: { useCase: HomePageUseCase; onOpen: () => void }) {
  return (
    <button className={styles.useCaseCard} type="button" onClick={onOpen}>
      <div className={styles.useCaseIcon}>{useCase.icon}</div>
      <div className={styles.useCaseContent}>
        <h3 className={styles.useCaseTitle}>{useCase.title}</h3>
        <p className={styles.useCaseModels}>{useCase.models}</p>
        <span className={styles.useCaseCta}>{useCase.cta} →</span>
      </div>
    </button>
  );
}

function MicrophoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function TypingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="14" width="20" height="7" rx="2" />
      <path d="M12 2a2 2 0 0 1 2 2v5a2 2 0 0 1-4 0V4a2 2 0 0 1 2-2z" />
      <path d="M17 10v1a5 5 0 0 1-10 0v-1" />
      <line x1="8" y1="17" x2="8" y2="17.01" />
      <line x1="12" y1="17" x2="12" y2="17.01" />
      <line x1="16" y1="17" x2="16" y2="17.01" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

function ScreenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <polyline points="8 21 12 17 16 21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function AttachmentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}
