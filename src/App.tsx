import { useEffect, useMemo, useState } from 'react';
import { Braces, Check, ChevronDown, CircleAlert, Copy, Download, FileJson, Layers3, Plus, RotateCcw, Sparkles, Trash2, WandSparkles, Code2, ShieldCheck, ExternalLink, Menu } from 'lucide-react';
import type { BuilderConfig, FieldConfig, FieldType, ProviderMode } from './types/schema';
import { generateSample, generateSchema } from './lib/schemaGenerator';
import { checkCompatibility } from './lib/providerCompatibility';
import { validateSchema } from './lib/validator';
import { presets } from './data/presets';

const makeField = (name = 'newProperty'): FieldConfig => ({
  id: crypto.randomUUID(), name, type: 'string', description: '', required: true, nullable: false,
  enumValues: '', itemType: 'string', children: [], defaultValue: ''
});
const initial: BuilderConfig = presets[0].config;
const safeRead = (): { config: BuilderConfig; provider: ProviderMode } | null => {
  try { const raw = localStorage.getItem('himat-schema-generator-draft'); return raw ? JSON.parse(raw) : null; } catch { return null; }
};

export default function App() {
  const [config, setConfig] = useState<BuilderConfig>(() => safeRead()?.config ?? initial);
  const [provider, setProvider] = useState<ProviderMode>(() => safeRead()?.provider ?? 'standard');
  const [schemaText, setSchemaText] = useState('');
  const [manualMode, setManualMode] = useState(false);
  const [tab, setTab] = useState<'schema'|'sample'>('schema');
  const [toast, setToast] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);

  const generated = useMemo(() => generateSchema(config, provider), [config, provider]);
  useEffect(() => { if (!manualMode) setSchemaText(JSON.stringify(generated, null, 2)); }, [generated, manualMode]);
  useEffect(() => { try { localStorage.setItem('himat-schema-generator-draft', JSON.stringify({ config, provider })); } catch { /* storage may be unavailable */ } }, [config, provider]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2600); return () => clearTimeout(t); }, [toast]);

  const parsed = useMemo(() => {
    try { return { schema: JSON.parse(schemaText) as Record<string, any>, error: '' }; }
    catch (e) { return { schema: null, error: e instanceof Error ? e.message : 'Invalid JSON' }; }
  }, [schemaText]);
  const validation = useMemo(() => parsed.schema ? validateSchema(parsed.schema) : { valid: false, errors: [parsed.error] }, [parsed]);
  const sample = useMemo(() => parsed.schema ? generateSample(parsed.schema) : {}, [parsed]);
  const issues = useMemo(() => parsed.schema ? checkCompatibility(parsed.schema, provider) : [], [parsed, provider]);

  function notify(message: string) { setToast(message); }
  function updateField(id: string, patch: Partial<FieldConfig>) {
    setConfig(c => ({ ...c, fields: c.fields.map(f => f.id === id ? { ...f, ...patch } : f) }));
    setManualMode(false);
  }
  function addField() { setConfig(c => ({ ...c, fields: [...c.fields, makeField(`property${c.fields.length + 1}`)] })); setManualMode(false); }
  function removeField(id: string) { setConfig(c => ({ ...c, fields: c.fields.filter(f => f.id !== id) })); setManualMode(false); }
  function moveField(id: string, direction: -1 | 1) {
    setConfig(c => { const fields = [...c.fields]; const i = fields.findIndex(f => f.id === id); const j = i + direction; if (j < 0 || j >= fields.length) return c; [fields[i], fields[j]] = [fields[j], fields[i]]; return { ...c, fields }; });
    setManualMode(false);
  }
  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      notify(`${label} copied to clipboard`);
    } catch {
      const el = document.createElement('textarea'); el.value = text; document.body.appendChild(el); el.select();
      const ok = document.execCommand('copy'); el.remove(); notify(ok ? `${label} copied` : 'Copy failed — select and copy manually');
    }
  }
  function download(text: string, filename: string) {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
    notify(`${filename} downloaded`);
  }
  function loadPreset(index: number) {
    const selected = presets[index]; if (!selected) return;
    setConfig(JSON.parse(JSON.stringify(selected.config))); setManualMode(false); notify(`${selected.label} preset loaded`);
  }
  function reset() {
    if (!window.confirm('Reset the schema builder to a new empty schema? Your current builder configuration will be replaced.')) return;
    setConfig({ name: 'NewSchema', description: 'Describe your structured LLM output.', additionalProperties: false, fields: [] });
    setProvider('standard'); setManualMode(false); notify('Builder reset');
  }
  function regenerate() { setManualMode(false); setSchemaText(JSON.stringify(generated, null, 2)); notify('Schema regenerated from the form'); }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="https://himat.co.in" target="_blank" rel="noreferrer"><span className="brand-mark"><Braces size={22}/></span><span><b>HIMAT</b><small>DEVELOPER TOOLS</small></span></a>
      <div className="header-title"><span className="eyebrow">FREE DEVELOPER TOOL</span><strong>Structured Output Schema Generator</strong></div>
      <button className="mobile-menu" onClick={() => setMobileMenu(v => !v)} aria-label="Toggle menu"><Menu size={20}/></button>
      <nav className={mobileMenu ? 'header-links open' : 'header-links'}>
        <a href="https://himat.tech/free-tools/llm-structured-output-schema-generator" target="_blank" rel="noreferrer">Live tool <ExternalLink size={14}/></a>
        <a href="https://github.com/himat-technologies/llm-structured-output-schema-generator" target="_blank" rel="noreferrer">GitHub <ExternalLink size={14}/></a>
      </nav>
    </header>

    <main className="page">
      <section className="hero">
        <div className="hero-copy">
          <div className="pill"><Sparkles size={14}/> BUILT FOR AI DEVELOPERS</div>
          <h1>Shape your AI output.<br/><span>Structure every response.</span></h1>
          <p>Design JSON Schemas for LLMs, agents, extraction pipelines, and APIs. Configure fields visually, validate the result, and export a ready-to-use schema — all locally.</p>
          <div className="hero-points"><span><Check size={15}/> No API key needed</span><span><Check size={15}/> Instant preview</span><span><Check size={15}/> Export-ready JSON</span></div>
        </div>
        <div className="hero-art"><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="floating-code"><span className="code-dot"></span><span className="code-dot"></span><span className="code-dot"></span><pre>{`{
  "type": "object",
  "properties": {
    "answer": { "type": "string" },
    "confidence": { "type": "number" }
  },
  "required": ["answer"]
}`}</pre></div><div className="spark spark-a">✦</div><div className="spark spark-b">✧</div></div>
      </section>

      <section className="quickbar">
        <div><span className="quick-icon"><Layers3 size={18}/></span><div><b>Start from a template</b><small>Jump-start common response patterns</small></div></div>
        <div className="preset-pills">{presets.map((p, i) => <button key={p.label} onClick={() => loadPreset(i)}>{p.label}</button>)}</div>
      </section>

      <div className="workspace-heading"><div><span className="section-kicker">SCHEMA WORKSPACE</span><h2>Build your response contract</h2><p>Configure the fields your model should return, then inspect the generated JSON Schema.</p></div><button className="btn btn-ghost" onClick={reset}><RotateCcw size={15}/> Reset</button></div>
      <div className="workspace">
        <section className="panel builder-panel">
          <div className="panel-head"><div className="panel-title-icon"><Layers3 size={18}/></div><div><h3>Schema configuration</h3><p>Describe your response shape</p></div><span className="step-badge">01</span></div>
          <div className="form-grid">
            <label className="form-label">Schema name<input value={config.name} onChange={e => {setConfig(c => ({...c, name:e.target.value})); setManualMode(false);}} placeholder="e.g. ProductReview"/></label>
            <label className="form-label">Schema description<textarea rows={2} value={config.description} onChange={e => {setConfig(c => ({...c, description:e.target.value})); setManualMode(false);}} placeholder="What should the output represent?"/></label>
          </div>
          <div className="fields-header"><div><h4>Properties <span className="count">{config.fields.length}</span></h4><p>Add the fields your LLM response needs.</p></div><button className="btn btn-primary btn-small" onClick={addField}><Plus size={15}/> Add property</button></div>
          {config.fields.length === 0 && <div className="empty-fields"><Braces size={28}/><b>Your schema is ready for its first field</b><span>Add a property to start building your output.</span><button className="btn btn-primary" onClick={addField}><Plus size={15}/> Add your first property</button></div>}
          <div className="field-list">{config.fields.map((field, index) => <article className="field-card" key={field.id}>
            <div className="field-card-top"><span className="field-number">{String(index+1).padStart(2,'0')}</span><input aria-label={`Property name ${index+1}`} className="property-name" value={field.name} onChange={e => updateField(field.id,{name:e.target.value})} placeholder="propertyName"/><span className={`type-chip type-${field.type}`}>{field.type}</span><div className="field-actions"><button title="Move up" disabled={index===0} onClick={() => moveField(field.id,-1)}>↑</button><button title="Move down" disabled={index===config.fields.length-1} onClick={() => moveField(field.id,1)}>↓</button><button title="Remove property" className="delete-action" onClick={() => removeField(field.id)}><Trash2 size={15}/></button></div></div>
            <div className="field-controls">
              <label className="form-label">Type<select value={field.type} onChange={e => updateField(field.id,{type:e.target.value as FieldType})}>{['string','number','integer','boolean','object','array','null'].map(t => <option key={t}>{t}</option>)}</select></label>
              <label className="form-label field-description">Description<input value={field.description} onChange={e => updateField(field.id,{description:e.target.value})} placeholder="What does this field mean?"/></label>
            </div>
            <div className="field-options">
              <label className="check-label"><input type="checkbox" checked={field.required} onChange={e => updateField(field.id,{required:e.target.checked})}/> Required</label>
              {field.type !== 'null' && <label className="check-label"><input type="checkbox" checked={field.nullable} onChange={e => updateField(field.id,{nullable:e.target.checked})}/> Nullable</label>}
              {field.type === 'string' && <label className="inline-option">Enum values<input value={field.enumValues} onChange={e => updateField(field.id,{enumValues:e.target.value})} placeholder="low, medium, high"/></label>}
              {(field.type === 'number' || field.type === 'integer') && <><label className="inline-option">Min<input type="number" value={field.min ?? ''} onChange={e => updateField(field.id,{min:e.target.value===''?undefined:Number(e.target.value)})}/></label><label className="inline-option">Max<input type="number" value={field.max ?? ''} onChange={e => updateField(field.id,{max:e.target.value===''?undefined:Number(e.target.value)})}/></label></>}
              {field.type === 'string' && <><label className="inline-option">Min length<input type="number" min="0" value={field.minLength ?? ''} onChange={e => updateField(field.id,{minLength:e.target.value===''?undefined:Number(e.target.value)})}/></label><label className="inline-option">Max length<input type="number" min="0" value={field.maxLength ?? ''} onChange={e => updateField(field.id,{maxLength:e.target.value===''?undefined:Number(e.target.value)})}/></label></>}
              {field.type === 'array' && <label className="inline-option">Item type<select value={field.itemType} onChange={e => updateField(field.id,{itemType:e.target.value as FieldType})}>{['string','number','integer','boolean','object'].map(t=><option key={t}>{t}</option>)}</select></label>}
            </div>
          </article>)}</div>
          <label className="check-label additional-check"><input type="checkbox" checked={config.additionalProperties} onChange={e => {setConfig(c => ({...c,additionalProperties:e.target.checked})); setManualMode(false);}}/> Allow additional properties on the root object</label>
        </section>

        <section className="panel output-panel">
          <div className="panel-head"><div className="panel-title-icon output-icon"><Code2 size={18}/></div><div><h3>Generated output</h3><p>Live schema preview and validation</p></div><span className="step-badge">02</span></div>
          <div className="output-toolbar"><label className="provider-select">Provider mode <select value={provider} onChange={e => {setProvider(e.target.value as ProviderMode); setManualMode(false);}}><option value="standard">Standard JSON Schema</option><option value="openai">OpenAI Structured Outputs</option><option value="generic">Generic LLM output</option></select><ChevronDown size={14}/></label><div className="toolbar-actions"><button className="icon-btn" onClick={regenerate} title="Regenerate from form"><RotateCcw size={15}/></button><button className="icon-btn" onClick={() => copy(schemaText,'Schema')} title="Copy schema"><Copy size={15}/></button><button className="btn btn-primary btn-small" onClick={() => download(schemaText,'schema.json')}><Download size={14}/> Export</button></div></div>
          <div className="code-tabs"><button className={tab==='schema'?'active':''} onClick={() => setTab('schema')}><Braces size={14}/> JSON Schema</button><button className={tab==='sample'?'active':''} onClick={() => setTab('sample')}><FileJson size={14}/> Sample output</button><span className="live-indicator"><i/> LIVE PREVIEW</span></div>
          {tab==='schema' ? <textarea className="code-editor" aria-label="Generated JSON Schema editor" spellCheck={false} value={schemaText} onChange={e => {setSchemaText(e.target.value);setManualMode(true);}}/> : <pre className="sample-preview">{JSON.stringify(sample,null,2)}</pre>}
          <div className={`validation-banner ${validation.valid?'valid':'invalid'}`}>{validation.valid?<><span className="validation-icon"><Check size={15}/></span><div><b>Schema structure looks valid</b><small>JSON parsed and the schema compiled with AJV.</small></div></>:<><span className="validation-icon"><CircleAlert size={15}/></span><div><b>Schema needs attention</b><small>{validation.errors[0] || 'Check the schema syntax.'}</small></div></>}</div>
          {validation.errors.length>1 && <ul className="error-list">{validation.errors.slice(1).map((e,i)=><li key={i}>{e}</li>)}</ul>}
          {issues.length>0 && <div className="compatibility-box"><b><CircleAlert size={15}/> Provider compatibility notes ({issues.length})</b>{issues.map((issue,i)=><p key={i}><span>{issue.severity.toUpperCase()}</span> {issue.path}: {issue.message}</p>)}</div>}
          <div className="output-bottom"><button className="btn btn-outline" onClick={() => copy(JSON.stringify(sample,null,2),'Sample output')}><Copy size={15}/> Copy sample</button><button className="btn btn-outline" onClick={() => download(JSON.stringify(sample,null,2),'sample-output.json')}><Download size={15}/> Download sample</button></div>
          <div className="privacy-note"><ShieldCheck size={16}/><span><b>Your schema stays in this browser.</b> No AI API calls are made. Draft preferences are stored locally on this device.</span></div>
        </section>
      </div>

      <section className="how-section"><div><span className="section-kicker">DESIGNED FOR STRUCTURE</span><h2>From prompt ideas to predictable data</h2><p>JSON Schema gives your application a contract for the shape of model responses. Define the fields once, validate outputs, and make downstream automation easier to maintain.</p></div><div className="how-cards"><article><span className="how-number">01</span><WandSparkles size={22}/><h3>Design</h3><p>Model fields, data types, constraints, and required values.</p></article><article><span className="how-number">02</span><Check size={22}/><h3>Validate</h3><p>Check schema structure and review provider compatibility.</p></article><article><span className="how-number">03</span><Download size={22}/><h3>Integrate</h3><p>Export JSON and validate real model responses in your app.</p></article></div></section>
    </main>
    <footer className="footer"><div className="footer-brand"><span className="brand-mark"><Braces size={20}/></span><div><b>Built by Himat Technologies</b><small>Build systems, not just websites.</small></div></div><div className="footer-links"><a href="https://himat.co.in">Website</a><a href="https://github.com/himat-technologies/llm-structured-output-schema-generator">GitHub</a><a href="https://www.facebook.com/people/Himat-technologies/61593829197445/">Facebook</a><a href="https://www.linkedin.com/in/himat-technologies-14b1051b4">LinkedIn</a><a href="https://www.instagram.com/himat_technologies?stkn=djdmcGxweWtwYWI0">Instagram</a><a href="mailto:info@himat.co.in">info@himat.co.in</a><a href="https://wa.me/919445234023">+91 94452 34023</a></div><p className="footer-copyright">© {new Date().getFullYear()} Himat Technologies · Local-first schema design</p></footer>
    {toast && <div role="status" className="toast"><Check size={16}/>{toast}</div>}
  </div>;
}
