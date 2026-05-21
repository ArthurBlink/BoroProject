// Boro · Live Streams — main app (connected to real APIs)
const { useState, useEffect, useMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark"
}/*EDITMODE-END*/;

const LS_KEY = 'boro_accounts';

function loadAccounts() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveAccounts(accounts) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(accounts)); } catch {}
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [accounts, setAccounts] = useState(loadAccounts);
  const [activeAccountId, setActiveAccountId] = useState(() => loadAccounts()[0]?.id || null);
  const [streamsByAccount, setStreamsByAccount] = useState({});
  const [loadingStreams, setLoadingStreams] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [boroTarget, setBoroTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [toasts, setToasts] = useState([]);

  const activeAccount = accounts.find((a) => a.id === activeAccountId) || null;
  const streams = streamsByAccount[activeAccountId] || [];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', t.theme || 'dark');
  }, [t.theme]);

  useEffect(() => {
    if (activeAccount) fetchStreams(activeAccount);
  }, [activeAccountId]);

  async function fetchStreams(account) {
    if (!account?.token) return;
    setLoadingStreams(true);
    try {
      const res = await fetch('/api/live-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: account.token }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const mapped = (data.data || []).map((s) => ({
        id: s._id || s.id,
        name: s.name || 'Sin nombre',
        status: (s.monitor?.status || s.status || 'offline').toLowerCase(),
        region: account.region || 'GLOBAL',
        key: s.key || null,
        stream_url: s.stream_url || s.streamUrl || null,
        publish_point: s.publish_point || s.publishPoint || null,
        thumbType: /radio|audio/i.test(s.name || '') ? 'audio' : 'video',
      }));
      setStreamsByAccount((prev) => ({ ...prev, [account.id]: mapped }));
    } catch (e) {
      pushToast(`Error cargando streams: ${e.message}`, 'error');
    } finally {
      setLoadingStreams(false);
    }
  }

  const ALL_REGIONS = ['LATAM', 'US', 'EU', 'BR', 'CO', 'PE', 'CL', 'MX', 'AR', 'GLOBAL'];
  const regions = ['all', ...ALL_REGIONS];

  const counts = useMemo(() => ({
    all: streams.length,
    online: streams.filter((l) => l.status === 'online').length,
    offline: streams.filter((l) => l.status === 'offline').length,
  }), [streams]);

  const filtered = useMemo(() => streams.filter((l) => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (regionFilter !== 'all' && l.region !== regionFilter) return false;
    if (query.trim() && !l.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
    return true;
  }), [streams, query, statusFilter, regionFilter]);

  function pushToast(msg, type = 'ok') {
    const id = Date.now() + Math.random();
    setToasts((ts) => [...ts, { id, msg, type }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), type === 'error' ? 6000 : 2600);
  }

  function copyTo(text, msg) {
    try { navigator.clipboard?.writeText(text); } catch {}
    pushToast(msg);
  }

  async function handleBoroSubmit({ zone, signalType, url }) {
    if (!boroTarget) return;
    const target = boroTarget;
    setBoroTarget(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/submit-to-boro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamName: target.name, streamUrl: url, zone, signalType }),
      });
      const { jobId, position } = await res.json();

      const posLabel = position > 0 ? ` · posición ${position + 1} en cola` : '';
      pushToast(`En cola: "${target.name}" [${signalType}] → ${zone}${posLabel}`, 'info');

      let done = false;
      while (!done) {
        const poll = await fetch(`/api/job/${jobId}`);
        const data = await poll.json();
        if (data.status === 'done') {
          done = true;
          if (data.success) {
            pushToast(`✓ "${target.name}" subido a ${zone} exitosamente`);
          } else {
            pushToast(`Error en Boro: ${data.error}`, 'error');
          }
        }
      }
    } catch (e) {
      pushToast(`Error de red: ${e.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function handleAddSave(account) {
    const initials = account.name
      .replace(/[^A-Za-z0-9]/g, ' ')
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '??';
    const newAccount = { id: Date.now().toString(36), initials, ...account };
    const updated = [...accounts, newAccount];
    setAccounts(updated);
    saveAccounts(updated);
    setShowAdd(false);
    setActiveAccountId(newAccount.id);
    pushToast(`Cuenta "${account.name}" conectada`);
  }

  function handleEditSave(updated) {
    const initials = updated.name
      .replace(/[^A-Za-z0-9]/g, ' ')
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '??';
    const updatedAccounts = accounts.map((a) =>
      a.id === editingAccount.id ? { ...a, ...updated, initials } : a
    );
    setAccounts(updatedAccounts);
    saveAccounts(updatedAccounts);
    setEditingAccount(null);
    pushToast(`Cuenta "${updated.name}" actualizada`);
  }

  function handleDeleteAccount(id) {
    const updatedAccounts = accounts.filter((a) => a.id !== id);
    setAccounts(updatedAccounts);
    saveAccounts(updatedAccounts);
    if (activeAccountId === id) {
      setActiveAccountId(updatedAccounts[0]?.id || null);
    }
    setEditingAccount(null);
    pushToast('Cuenta eliminada', 'info');
  }

  function handleSelectAccount(id) {
    setActiveAccountId(id);
    setStatusFilter('all');
    setRegionFilter('all');
    setQuery('');
  }

  const toggleTheme = () => setTweak('theme', t.theme === 'dark' ? 'light' : 'dark');

  const accountsWithMeta = accounts.map((a) => ({
    ...a,
    meta: `${(streamsByAccount[a.id] || []).length} señales · ${a.region || 'GLOBAL'}`,
  }));

  return (
    <div className="app" data-sidebar={sidebarOpen ? 'open' : 'closed'}>
      {sidebarOpen && (
        <Sidebar
          accounts={accountsWithMeta}
          activeId={activeAccountId}
          onSelect={handleSelectAccount}
          onAdd={() => setShowAdd(true)}
          onEdit={(id) => setEditingAccount(accounts.find((a) => a.id === id) || null)}
        />
      )}

      <main className="main">
        <header className="topbar">
          <button className="hamburger" onClick={() => setSidebarOpen((s) => !s)} aria-label="Menú">
            <Icon.Menu />
          </button>
          <div className="page-title">
            <h1>Live Streams</h1>
            <div className="breadcrumb">
              {activeAccount
                ? <><b>{activeAccount.name}</b> · Señales activas</>
                : 'Agrega una cuenta para comenzar'
              }
            </div>
          </div>

          <div className="search">
            <Icon.Search />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre…"
            />
            <span className="kbd">⌘ K</span>
          </div>

          <div className="top-actions">
            <button className="btn-ghost" onClick={toggleTheme} aria-label="Cambiar tema">
              {t.theme === 'dark' ? <Icon.Sun /> : <Icon.Moon />}
              <span style={{ fontSize: 12 }}>{t.theme === 'dark' ? 'Claro' : 'Oscuro'}</span>
            </button>
            <button
              className="btn-ghost"
              onClick={() => activeAccount && fetchStreams(activeAccount)}
              disabled={loadingStreams || !activeAccount}
            >
              {loadingStreams ? <Icon.Loader /> : <Icon.Refresh />}
              {loadingStreams ? 'Cargando…' : 'Refrescar'}
            </button>
          </div>
        </header>

        <div className="filter-bar">
          <div className="filter-group" role="tablist" aria-label="Estado">
            {[
              { key: 'all',     label: 'Todos',   count: counts.all },
              { key: 'online',  label: 'En vivo', count: counts.online,  dot: 'var(--online)' },
              { key: 'offline', label: 'Offline', count: counts.offline, dot: 'var(--offline)' },
            ].map(({ key, label, count, dot }) => (
              <button key={key} className="chip" data-active={statusFilter === key} onClick={() => setStatusFilter(key)}>
                {dot && <span className="dot-mini" style={{ background: dot }} />}
                {label}
                <span className="pill-count">{count}</span>
              </button>
            ))}
          </div>

          {regions.length > 1 && (
            <div className="filter-group" role="tablist" aria-label="Región">
              {regions.map((r) => (
                <button key={r} className="chip" data-active={regionFilter === r} onClick={() => setRegionFilter(r)}>
                  {r === 'all' ? 'Todas las regiones' : r}
                </button>
              ))}
            </div>
          )}

          <div className="results-info">
            <span><b>{filtered.length}</b> de {streams.length} señales</span>
          </div>
        </div>

        <section className="grid">
          {loadingStreams ? (
            <div className="empty">
              <Icon.Loader style={{ width: 28, height: 28, marginBottom: 12 }} />
              <br />Cargando streams…
            </div>
          ) : !activeAccount ? (
            <div className="empty">
              Agrega una cuenta de Mediastream para ver sus señales en vivo.
              <br />
              <button className="btn-primary" onClick={() => setShowAdd(true)} style={{ marginTop: 16 }}>
                <Icon.Plus /> Agregar cuenta
              </button>
            </div>
          ) : streams.length === 0 ? (
            <div className="empty">
              No se encontraron streams para esta cuenta.
              <br />Verifica que el token JWT sea válido.
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">No hay señales que coincidan con esos filtros.</div>
          ) : (
            filtered.map((live) => (
              <LiveCard
                key={live.id}
                live={live}
                onCopy={copyTo}
                onUpload={(live) => setBoroTarget({
                  id: live.id,
                  name: live.name,
                  stream_url: live.stream_url || null,
                  apiKey: activeAccount?.apiKey || null,
                })}
                submitting={submitting}
              />
            ))
          )}
        </section>
      </main>

      {showAdd && (
        <AddAccountModal
          onClose={() => setShowAdd(false)}
          onSave={handleAddSave}
          existingCount={accounts.length}
        />
      )}

      {editingAccount && (
        <AddAccountModal
          onClose={() => setEditingAccount(null)}
          onSave={handleEditSave}
          initialData={editingAccount}
          onDelete={handleDeleteAccount}
        />
      )}

      {boroTarget && (
        <BoroModal
          target={boroTarget}
          onClose={() => setBoroTarget(null)}
          onSubmit={handleBoroSubmit}
          submitting={submitting}
        />
      )}

      <ToastTray toasts={toasts} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Apariencia" />
        <TweakRadio
          label="Tema"
          value={t.theme}
          options={[{ label: 'Oscuro', value: 'dark' }, { label: 'Claro', value: 'light' }]}
          onChange={(v) => setTweak('theme', v)}
        />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
