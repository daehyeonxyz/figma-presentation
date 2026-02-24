import React, { useState, useEffect, useCallback } from 'react';
import {
  AppSettings,
  ToneType,
  AudienceType,
  MessageToUI,
  SlidesPlan,
  StyleGuide,
  CLAUDE_MODELS,
} from '../types';
import { generateSlidesPlan, buildDefaultStyle } from '../api/claude';

// ── Storage Keys ─────────────────────────────────────────────
const STORAGE_KEY = 'figma-presentation-settings';

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppSettings;
  } catch {}
  return { apiKey: '', model: 'claude-sonnet-4-5' };
}

function saveSettings(s: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

// ── Types ────────────────────────────────────────────────────
type View = 'form' | 'settings' | 'progress' | 'success' | 'error';

interface FormState {
  title: string;
  purpose: string;
  audience: AudienceType;
  tone: ToneType;
  content: string;
  slideCountAuto: boolean;
  slideCount: number;
}

// ── Tone options ─────────────────────────────────────────────
const TONES: Array<{ id: ToneType; label: string; emoji: string }> = [
  { id: 'minimal', label: 'Minimal', emoji: '⬜' },
  { id: 'bold', label: 'Bold', emoji: '🔥' },
  { id: 'luxury', label: 'Luxury', emoji: '✨' },
  { id: 'editorial', label: 'Editorial', emoji: '📰' },
  { id: 'technical', label: 'Technical', emoji: '⚙️' },
  { id: 'playful', label: 'Playful', emoji: '🎨' },
];

const AUDIENCES: Array<{ id: AudienceType; label: string }> = [
  { id: 'executives', label: '🏢 Executives' },
  { id: 'engineers', label: '💻 Engineers' },
  { id: 'customers', label: '🤝 Customers' },
  { id: 'general', label: '👥 General' },
];

// ── Main App ─────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<View>('form');
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [showKey, setShowKey] = useState(false);
  const [progress, setProgress] = useState({ message: '', percent: 0, step: '' });
  const [successCount, setSuccessCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState<FormState>({
    title: '',
    purpose: '',
    audience: 'executives',
    tone: 'bold',
    content: '',
    slideCountAuto: true,
    slideCount: 10,
  });

  // Listen for messages from plugin backend
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data.pluginMessage as MessageToUI;
      if (!msg) return;

      if (msg.type === 'PROGRESS') {
        setProgress({ message: msg.message, percent: msg.percent, step: `${msg.percent}%` });
      } else if (msg.type === 'DONE') {
        setSuccessCount(msg.slideCount);
        setView('success');
      } else if (msg.type === 'ERROR') {
        setErrorMsg(msg.message);
        setView('error');
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      saveSettings(next);
      return next;
    });
  }, []);

  const updateForm = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!settings.apiKey) {
      setErrorMsg('Please set your Claude API key in Settings first.');
      setView('error');
      return;
    }

    if (!form.title.trim() || !form.content.trim()) {
      setErrorMsg('Please fill in the presentation title and content.');
      setView('error');
      return;
    }

    setView('progress');
    setProgress({ message: 'Connecting to Claude API...', percent: 5, step: 'PLANNING' });

    try {
      const style: StyleGuide = buildDefaultStyle(form.tone);

      setProgress({ message: 'Claude is planning your slides...', percent: 15, step: 'GENERATING PLAN' });

      const plan: SlidesPlan = await generateSlidesPlan({
        apiKey: settings.apiKey,
        model: settings.model,
        title: form.title,
        purpose: form.purpose,
        audience: form.audience,
        tone: form.tone,
        content: form.content,
        slideCount: form.slideCountAuto ? 'auto' : form.slideCount,
        style,
      });

      setProgress({ message: 'Sending to Figma...', percent: 40, step: 'RENDERING' });

      parent.postMessage(
        {
          pluginMessage: {
            type: 'GENERATE_SLIDES',
            plan,
            style,
          },
        },
        '*'
      );
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Failed to generate slide plan');
      setView('error');
    }
  }, [settings, form]);

  // ── Settings View ────────────────────────────────────────────
  const renderSettings = () => (
    <div className="settings-panel">
      <div className="section">
        <div className="section-title">Claude API</div>
        <label>
          API Key
          <div className="input-group">
            <input
              type={showKey ? 'text' : 'password'}
              value={settings.apiKey}
              onChange={e => updateSettings({ apiKey: e.target.value })}
              placeholder="sk-ant-..."
            />
            <button className="input-group-btn" onClick={() => setShowKey(v => !v)}>
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <span>
            Get your key at{' '}
            <a href="https://console.anthropic.com" target="_blank" rel="noreferrer"
               style={{ color: 'var(--color-primary)' }}>
              console.anthropic.com
            </a>
          </span>
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`api-status ${settings.apiKey ? 'ok' : 'missing'}`}>
            {settings.apiKey ? '● Connected' : '○ Not set'}
          </span>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Model</div>
        <label>
          Claude Model
          <select
            value={settings.model}
            onChange={e => updateSettings({ model: e.target.value })}
          >
            {CLAUDE_MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="settings-hint">
        🔒 Your API key is stored locally in your browser and never shared.
        API calls go directly from Figma to Anthropic — no intermediary server.
      </div>
    </div>
  );

  // ── Form View ────────────────────────────────────────────────
  const renderForm = () => (
    <>
      <div className="section">
        <div className="section-title">Presentation</div>
        <label>
          Title *
          <input
            type="text"
            value={form.title}
            onChange={e => updateForm('title', e.target.value)}
            placeholder="e.g. 2025 Product Vision"
          />
        </label>
        <label>
          Purpose
          <input
            type="text"
            value={form.purpose}
            onChange={e => updateForm('purpose', e.target.value)}
            placeholder="e.g. Q1 all-hands, investor pitch, product launch..."
          />
        </label>
      </div>

      <div className="divider" />

      <div className="section">
        <div className="section-title">Audience</div>
        <div className="audience-grid">
          {AUDIENCES.map(a => (
            <button
              key={a.id}
              className={`audience-btn ${form.audience === a.id ? 'selected' : ''}`}
              onClick={() => updateForm('audience', a.id)}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="divider" />

      <div className="section">
        <div className="section-title">Tone & Visual Style</div>
        <div className="tone-grid">
          {TONES.map(t => (
            <button
              key={t.id}
              className={`tone-btn ${form.tone === t.id ? 'selected' : ''}`}
              onClick={() => updateForm('tone', t.id)}
            >
              <span className="tone-emoji">{t.emoji}</span>
              <span className="tone-label">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="divider" />

      <div className="section">
        <div className="section-title">Content *</div>
        <label>
          <span>Paste your outline, notes, data, or bullet points</span>
          <textarea
            value={form.content}
            onChange={e => updateForm('content', e.target.value)}
            placeholder={`Example:
- Market size: $4.2T by 2027
- Problem: Developers lose 2.4h/day to context-switching
- Our solution: unified AI-native platform
- Traction: $12.4M ARR, 94% retention
- Ask: Series B, $24M raise`}
            rows={7}
          />
        </label>
        <div className="char-count">{form.content.length} chars</div>
      </div>

      <div className="divider" />

      <div className="section">
        <div className="section-title">Slide Count</div>
        <div className="slide-count-row">
          <input
            type="number"
            min={3}
            max={30}
            value={form.slideCount}
            disabled={form.slideCountAuto}
            onChange={e => updateForm('slideCount', parseInt(e.target.value) || 10)}
          />
          <label className="auto-checkbox">
            <input
              type="checkbox"
              checked={form.slideCountAuto}
              onChange={e => updateForm('slideCountAuto', e.target.checked)}
            />
            Auto (Claude decides)
          </label>
        </div>
      </div>
    </>
  );

  // ── Progress View ────────────────────────────────────────────
  const renderProgress = () => (
    <div className="progress-view">
      <div className="progress-spinner" />
      <div>
        <div className="progress-step">{progress.step}</div>
        <div className="progress-message" style={{ marginTop: 6 }}>{progress.message}</div>
      </div>
      <div style={{ width: '100%' }}>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress.percent}%` }} />
        </div>
        <div style={{ textAlign: 'right', fontSize: 10, color: 'var(--color-text-muted)', marginTop: 4 }}>
          {progress.percent}%
        </div>
      </div>
    </div>
  );

  // ── Result Views ─────────────────────────────────────────────
  const renderSuccess = () => (
    <div className="result-view">
      <div className="result-icon">🎉</div>
      <div className="result-title">Slides Created!</div>
      <div className="result-subtitle">
        {successCount} slides have been added to a new Figma page.
        <br />
        Check your Pages panel to find your presentation.
      </div>
      <button className="result-btn" onClick={() => setView('form')}>
        ← Create Another
      </button>
    </div>
  );

  const renderError = () => (
    <div className="result-view">
      <div className="result-icon">⚠️</div>
      <div className="result-title">Something went wrong</div>
      <div className="error-box">{errorMsg}</div>
      <button className="result-btn" onClick={() => setView('form')}>
        ← Try Again
      </button>
      {errorMsg.includes('API key') || errorMsg.includes('401') ? (
        <button className="result-btn" onClick={() => setView('settings')}>
          ⚙ Open Settings
        </button>
      ) : null}
    </div>
  );

  // ── Render ───────────────────────────────────────────────────
  const isProgress = view === 'progress';
  const isResult = view === 'success' || view === 'error';
  const hasKey = !!settings.apiKey;

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="header-logo">🎨</div>
        <h1>Figma Presentation</h1>
        {!isProgress && !isResult && (
          <button
            className="header-settings-btn"
            onClick={() => setView(v => v === 'settings' ? 'form' : 'settings')}
            title="Settings"
          >
            {view === 'settings' ? '✕' : '⚙'}
          </button>
        )}
        {!hasKey && !isProgress && !isResult && view !== 'settings' && (
          <span className="api-status missing" style={{ cursor: 'pointer' }}
                onClick={() => setView('settings')}>
            Set API Key
          </span>
        )}
      </div>

      {/* Tabs (only when not progress/result) */}
      {!isProgress && !isResult && view !== 'settings' && (
        <div className="tabs">
          <button className="tab active">✦ Generate</button>
        </div>
      )}

      {/* Content */}
      <div className="content">
        {view === 'settings' && renderSettings()}
        {view === 'form' && renderForm()}
        {view === 'progress' && renderProgress()}
        {view === 'success' && renderSuccess()}
        {view === 'error' && renderError()}
      </div>

      {/* Footer generate button */}
      {(view === 'form' || view === 'settings') && (
        <div className="footer">
          {view === 'settings' ? (
            <button
              className="generate-btn"
              onClick={() => setView('form')}
            >
              ← Back to Generator
            </button>
          ) : (
            <button
              className="generate-btn"
              onClick={handleGenerate}
              disabled={!form.title.trim() || !form.content.trim()}
            >
              {!hasKey ? '⚙ Set API Key First' : '✦ Generate Presentation'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
