// Boro · Live Streams — UI components
const { useState, useEffect, useRef } = React;

/* ----------------------------- Icons ----------------------------- */

const Icon = {
  Menu: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="14" y2="17"/></svg>,
  Search: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  Plus: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  Refresh: (p) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/></svg>,
  Check: (p) => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="5 12 10 17 19 8"/></svg>,
  Copy: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>,
  Upload: (p) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v3a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-3"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Close: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M6 6l12 12M6 18 18 6"/></svg>,
  Video: (p) => <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="6" width="14" height="12" rx="2"/><path d="m17 10 4-2v8l-4-2z"/></svg>,
  Audio: (p) => <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>,
  Sun: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></svg>,
  Moon: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 12.8A8.6 8.6 0 1 1 11.2 3a6.8 6.8 0 0 0 9.8 9.8z"/></svg>,
  Settings: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .4 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.4 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.4l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .4-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.4-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.4H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.4l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.4 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>,
  AlertCircle: (p) => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Loader: ({ className = '', ...p }) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`spin ${className}`} {...p}><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>,
  Pencil: (p) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash: (p) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
};

/* ----------------------------- Toast tray ----------------------------- */

function ToastTray({ toasts }) {
  return (
    <div className="toast-tray">
      {toasts.map((t) => (
        <div key={t.id} className="toast" data-type={t.type || 'ok'}>
          <span className="icon-badge">
            {t.type === 'error' ? <Icon.AlertCircle /> : t.type === 'info' ? <Icon.Loader /> : <Icon.Check />}
          </span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------- Card thumbnail ----------------------------- */

function CardThumb({ live }) {
  const isAudio = live.thumbType === 'audio';
  return (
    <div className="thumb">
      <div className="thumb-wave" />
      <div className="thumb-icon">
        {isAudio ? <Icon.Audio /> : <Icon.Video />}
      </div>
      <span className="thumb-tag" data-status={live.status}>
        <span className="dot" />
        {live.status === 'online' ? 'LIVE' : 'Offline'}
      </span>
      <span className="thumb-region">{live.region}</span>
    </div>
  );
}

/* ----------------------------- Live card ----------------------------- */

function LiveCard({ live, onCopy, onUpload, submitting }) {
  const url = `https://mdstrm.com/live-stream-playlist/${live.id}.m3u8`;
  const shortId = live.id.slice(0, 8) + '…' + live.id.slice(-4);

  return (
    <article className="card" data-status={live.status}>
      <CardThumb live={live} />
      <div className="card-body">
        <h3 className="card-title">{live.name}</h3>
        <div className="card-meta">
          <span className="mono">{shortId}</span>
          <span className="sep" />
          <span>{live.status === 'online' ? 'Activo ahora' : 'Sin emisión'}</span>
        </div>
        <div className="url-row" title={url}>
          <code>{url}</code>
          <button className="copy-mini" onClick={() => onCopy(url, '.m3u8 copiado al portapapeles')} aria-label="Copiar URL">
            <Icon.Copy />
          </button>
        </div>
        <div className="card-actions">
          <button className="act" onClick={() => onCopy(live.id, 'ID copiado al portapapeles')}>
            <Icon.Copy /> Copiar ID
          </button>
          <button className="act" onClick={() => onCopy(url, '.m3u8 copiado al portapapeles')}>
            <Icon.Copy /> .m3u8
          </button>
          <button
            className="act act-primary"
            onClick={() => onUpload(live)}
            disabled={submitting}
            title="Subir señal a Boro"
          >
            {submitting ? <Icon.Loader /> : <Icon.Upload />}
            Subir
          </button>
        </div>
      </div>
    </article>
  );
}

/* ----------------------------- Sidebar ----------------------------- */

function Sidebar({ accounts, activeId, onSelect, onAdd, onEdit }) {
  return (
    <aside className="sidebar" aria-label="Cuentas">
      <div className="sidebar-head">
        <div className="brand">
          <div className="brand-mark">B</div>
          <div className="brand-text">
            <span>Boro</span>
            <span>Live Signals</span>
          </div>
        </div>
      </div>

      <div className="sidebar-scroll">
        <div className="sidebar-section">
          <div className="sidebar-section-title">
            <span>Cuentas</span>
            <span className="count">{accounts.length}</span>
          </div>

          {accounts.map((a) => (
            <div
              key={a.id}
              className="account-row"
              data-active={a.id === activeId}
              onClick={() => onSelect(a.id)}
            >
              <div
                className="account-avatar"
                style={{ background: `linear-gradient(135deg, ${a.color}, color-mix(in oklab, ${a.color}, #000 30%))`, color: '#0A1020' }}
              >
                {a.initials}
              </div>
              <div className="account-info">
                <div className="account-name">{a.name}</div>
                <div className="account-meta">{a.meta}</div>
              </div>
              <button
                className="row-edit"
                onClick={(e) => { e.stopPropagation(); onEdit(a.id); }}
                aria-label="Editar cuenta"
                title="Editar"
              >
                <Icon.Pencil />
              </button>
              <div className="account-check"><Icon.Check /></div>
            </div>
          ))}

          <button className="add-account-btn" onClick={onAdd}>
            <Icon.Plus /> Agregar cuenta
          </button>
        </div>
      </div>

      <div className="sidebar-foot">
        <div className="foot-user">
          <div className="account-avatar" style={{ background: 'linear-gradient(135deg, #5358FF, #25E0FF)', color: '#fff' }}>MS</div>
          <div style={{ minWidth: 0 }}>
            <div className="foot-user-name">Mediastream</div>
            <div className="foot-user-mail">boro.elecard.com</div>
          </div>
        </div>
        <button className="icon-btn" aria-label="Ajustes"><Icon.Settings /></button>
      </div>
    </aside>
  );
}

/* ----------------------------- Add account modal ----------------------------- */

const ACCOUNT_COLORS = ['#25E0FF', '#5358FF', '#FF8FA3', '#FFB547', '#2EE6A6', '#FF6A82'];

const ACCOUNT_REGIONS = ['LATAM', 'US', 'EU', 'BR', 'CO', 'PE', 'CL', 'MX', 'AR', 'GLOBAL'];

function AddAccountModal({ onClose, onSave, existingCount = 0, initialData = null, onDelete }) {
  const isEdit = !!initialData;
  const [name, setName] = useState(initialData?.name || '');
  const [region, setRegion] = useState(initialData?.region || 'LATAM');
  const [token, setToken] = useState(initialData?.token || '');
  const [apiKey, setApiKey] = useState(initialData?.apiKey || '');
  const [color, setColor] = useState(initialData?.color || ACCOUNT_COLORS[existingCount % ACCOUNT_COLORS.length]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  const canSave = name.trim() && token.trim();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <h3>{isEdit ? 'Editar cuenta' : 'Agregar cuenta de Mediastream'}</h3>
            <p>{isEdit ? name : 'Conecta una cuenta para listar sus señales en vivo.'}</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar"><Icon.Close /></button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label htmlFor="acct-name">Nombre de la cuenta</label>
            <input
              ref={inputRef}
              id="acct-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Mediastream Producción"
            />
          </div>
          <div className="field">
            <label htmlFor="acct-region">Región</label>
            <select
              id="acct-region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              {[...new Set([...ACCOUNT_REGIONS, region])].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <span className="hint">Se usa como etiqueta en las señales de esta cuenta.</span>
          </div>
          <div className="field">
            <label>Color</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ACCOUNT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: c,
                    border: color === c ? '2px solid var(--text)' : '2px solid transparent',
                    boxShadow: color === c ? `0 0 0 3px color-mix(in oklab, ${c} 30%, transparent)` : 'none',
                    transition: 'all .14s',
                  }}
                />
              ))}
            </div>
          </div>
          <div className="field">
            <label htmlFor="acct-token">JWT Token (API)</label>
            <textarea
              id="acct-token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…"
            />
            <span className="hint">Para listar streams vía API.</span>
          </div>
          <div className="field">
            <label htmlFor="acct-api-key">API Key (para tokens HLS)</label>
            <input
              id="acct-api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="aa7c4501cb56d706ee57afbcd56449b6 (opcional)"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}
            />
            <span className="hint">Token para POST /api/access/issue — genera URLs de consumo HLS con acceso temporal.</span>
          </div>
        </div>
        <div className="modal-foot">
          {isEdit && onDelete && (
            confirmDelete ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginRight: 'auto' }}>
                <span style={{ fontSize: 12, color: 'var(--text-2)' }}>¿Eliminar cuenta?</span>
                <button className="btn-danger" onClick={() => onDelete(initialData.id)}>
                  <Icon.Trash /> Confirmar
                </button>
                <button className="btn-ghost" onClick={() => setConfirmDelete(false)}>No</button>
              </div>
            ) : (
              <button className="btn-danger" style={{ marginRight: 'auto' }} onClick={() => setConfirmDelete(true)}>
                <Icon.Trash /> Eliminar
              </button>
            )
          )}
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button
            className="btn-primary"
            onClick={() => canSave && onSave({ name: name.trim(), region: region.trim() || 'GLOBAL', token: token.trim(), apiKey: apiKey.trim(), color })}
            disabled={!canSave}
          >
            {isEdit ? <><Icon.Check /> Guardar cambios</> : <><Icon.Plus /> Conectar cuenta</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Boro submit modal ----------------------------- */

const BORO_ZONES = [
  'CO - Boro',
  'BR-SaoPaulo-Sensay',
  'CL-VMSensay',
  'EU-EC2 Boro (Spain)',
  'PE-EC2-Lima',
  'US-EC2-Boro',
  'US-Link-SRT',
];

const SIGNAL_TYPES = [
  { value: 'hls-video', label: 'HLS Video (.m3u8)',  placeholder: null },
  { value: 'hls-audio', label: 'Audio HLS (.m3u8)',  placeholder: null },
  { value: 'srt',       label: 'SRT',                placeholder: 'srt://host:port?streamid=...' },
  { value: 'rtmp',      label: 'RTMP',               placeholder: 'rtmp://host/app/streamkey' },
  { value: 'udp',       label: 'UDP / RTP',          placeholder: 'udp://host:port' },
];

function BoroModal({ target, onClose, onSubmit, submitting }) {
  const { useState: _useState, useEffect: _useEffect } = React;
  const [zone, setZone] = _useState(BORO_ZONES[0]);
  const [signalType, setSignalType] = _useState('hls-video');
  const [url, setUrl] = _useState('');
  const [fetchingToken, setFetchingToken] = _useState(false);
  const [tokenError, setTokenError] = _useState(null);

  const isHls = signalType === 'hls-video' || signalType === 'hls-audio';

  async function issueToken() {
    if (!target.apiKey || !target.id) {
      setUrl(`https://mdstrm.com/live-stream-playlist/${target.id}.m3u8`);
      if (!target.apiKey) setTokenError('Sin API Key — URL sin token de acceso.');
      return;
    }
    setFetchingToken(true);
    setTokenError(null);
    try {
      const res = await fetch('/api/issue-access-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: target.apiKey, streamId: target.id }),
      });
      const data = await res.json();
      if (data.access_token) {
        setUrl(`https://mdstrm.com/live-stream-playlist/${target.id}.m3u8?access_token=${data.access_token}&admin_token=true`);
        setTokenError(null);
      } else {
        setUrl(`https://mdstrm.com/live-stream-playlist/${target.id}.m3u8`);
        setTokenError(`Error: ${data.error || 'no se pudo emitir token'}`);
      }
    } catch (e) {
      setUrl(`https://mdstrm.com/live-stream-playlist/${target.id}.m3u8`);
      setTokenError(`Error de red: ${e.message}`);
    } finally {
      setFetchingToken(false);
    }
  }

  _useEffect(() => {
    if (isHls) {
      issueToken();
    } else {
      const t = SIGNAL_TYPES.find((s) => s.value === signalType);
      setUrl(t?.placeholder || '');
      setTokenError(null);
    }
  }, [signalType]);

  _useEffect(() => {
    const k = (e) => { if (e.key === 'Escape' && !submitting) onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose, submitting]);

  const canSubmit = url.trim().length > 0 && !fetchingToken;

  return (
    <div className="modal-backdrop" onClick={() => !submitting && onClose()}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" style={{ maxWidth: 500 }}>
        <div className="modal-head">
          <div>
            <h3>Subir señal a Boro</h3>
            <p>{target.name}</p>
          </div>
          <button className="icon-btn" onClick={onClose} disabled={submitting} aria-label="Cerrar">
            <Icon.Close />
          </button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label htmlFor="boro-signal-type">Tipo de señal</label>
            <select
              id="boro-signal-type"
              value={signalType}
              onChange={(e) => setSignalType(e.target.value)}
              disabled={submitting || fetchingToken}
            >
              {SIGNAL_TYPES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label htmlFor="boro-url" style={{ margin: 0 }}>
                URL de la señal
                {fetchingToken && <Icon.Loader style={{ marginLeft: 6, verticalAlign: 'middle' }} />}
              </label>
              {isHls && (
                <button
                  type="button"
                  onClick={issueToken}
                  disabled={fetchingToken || submitting}
                  style={{ fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {fetchingToken ? 'Generando…' : '↺ Regenerar token'}
                </button>
              )}
            </div>
            <input
              id="boro-url"
              value={fetchingToken ? 'Generando URL con token…' : url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={submitting || fetchingToken}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}
              placeholder={SIGNAL_TYPES.find((s) => s.value === signalType)?.placeholder || ''}
            />
            {tokenError && (
              <span className="hint" style={{ color: 'var(--warn)' }}>{tokenError}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="boro-zone">Zona / Probe</label>
            <select
              id="boro-zone"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              disabled={submitting || fetchingToken}
            >
              {BORO_ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn-ghost" onClick={onClose} disabled={submitting}>Cancelar</button>
          <button
            className="btn-primary"
            onClick={() => onSubmit({ zone, signalType, url: url.trim() })}
            disabled={submitting || !canSubmit}
          >
            {submitting ? <Icon.Loader /> : <Icon.Upload />}
            {submitting ? 'Subiendo…' : 'Subir a Boro'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Boro task list ----------------------------- */

const BORO_PROBE_IDS = {
  'CO - Boro': '8552',
  'BR-SaoPaulo-Sensay': '4933',
  'CL-VMSensay': '4957',
  'EU-EC2 Boro (Spain)': '7892',
  'PE-EC2-Lima': '9593',
  'US-EC2-Boro': '8566',
  'US-Link-SRT': '6308',
};

function BoroTaskList({ tasks, loading, onRefresh, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(null);

  return (
    <div className="boro-tasks">
      <div className="boro-tasks-header">
          <span className="results-info">
          <b>{tasks.length}</b> live{tasks.length !== 1 ? 's' : ''} cargado{tasks.length !== 1 ? 's' : ''}
        </span>
        <button className="btn-ghost" onClick={onRefresh} disabled={loading}>
          {loading ? <Icon.Loader /> : <Icon.Refresh />}
          {loading ? 'Cargando…' : 'Refrescar'}
        </button>
      </div>

      {loading ? (
        <div className="empty">
          <Icon.Loader style={{ width: 28, height: 28, marginBottom: 12 }} />
          <br />Cargando lives subidos…
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty">
          No hay lives cargados.
          <br />Subí una señal desde la pestaña Live Streams.
        </div>
      ) : (
        <div className="boro-task-grid">
          {tasks.map((t, i) => (
            <div key={i} className="boro-task-card">
              <div className="boro-task-info">
                <div className="boro-task-name">{t.name}</div>
                <div className="boro-task-meta">
                  <span className="boro-task-zone">{t.zone}</span>
                  <span className="sep" />
                  <span className={`boro-task-status ${t.status?.toLowerCase() === 'active' ? 'status-active' : ''}`}>
                    {t.status}
                  </span>
                </div>
              </div>
              <div className="boro-task-actions">
                {confirmDelete === i ? (
                  <div className="confirm-delete">
                    <span>¿Eliminar?</span>
                    <button className="btn-danger" onClick={() => {
                      const probeId = BORO_PROBE_IDS[t.zone];
                      if (probeId) {
                        onDelete(t.name, probeId, t.zone);
                      }
                      setConfirmDelete(null);
                    }}>
                      <Icon.Trash /> Confirmar
                    </button>
                    <button className="btn-ghost" onClick={() => setConfirmDelete(null)}>No</button>
                  </div>
                ) : (
                  <button className="act act-danger" onClick={() => setConfirmDelete(i)} title="Eliminar tarea">
                    <Icon.Trash /> Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  Icon, ToastTray, LiveCard, Sidebar, AddAccountModal, BoroModal, BoroTaskList,
  ACCOUNT_COLORS,
});
