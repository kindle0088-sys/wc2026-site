/**
 * WC2026 v3 — Real-time Data Engine
 * Fetches live scores from ESPN API, merges with static data, renders all pages.
 * Pure static — works on GitHub Pages / Pinme, no backend needed.
 */

const WCApp = {
  // === State ===
  data: null,           // Working data (data.js initial → ESPN-merged)
  espnData: null,       // Raw ESPN API response cache
  espnStatus: {         // ESPN fetch status
    lastFetch: null,    // ISO timestamp of last successful ESPN fetch
    hasLiveData: false, // Whether any match is currently live/in-progress
    error: null,
    dateMap: {}         // date string -> ESPN team abbr -> score info
  },
  refreshTimer: null,
  REFRESH_INTERVAL: 300000, // 5 minutes
  ESPN_DATES: [],       // Tournament date range

  // Map ESPN status types to our status
  STATUS_MAP: {
    'STATUS_FINAL': 'completed',
    'STATUS_FULL_TIME': 'completed',
    'STATUS_END_OF_MATCH': 'completed',
    'STATUS_WHISTLE': 'completed',
    'STATUS_IN_PROGRESS': 'live',
    'STATUS_HALFTIME': 'live',
    'STATUS_FIRST_HALF': 'live',
    'STATUS_SECOND_HALF': 'live',
    'STATUS_SCHEDULED': 'upcoming',
    'STATUS_PRE_GAME': 'upcoming',
    'STATUS_POSTPONED': 'upcoming',
    'STATUS_CANCELLED': 'upcoming'
  },

  // Map ESPN status type to our status
  _mapESPNStatus(typeId) {
    const n = parseInt(typeId);
    // ESPN numeric IDs: 1=scheduled, 26=in-progress (half/live), 28=full-time/final
    if (n === 28) return 'completed';
    if (n === 26) return 'live';
    return 'upcoming';
  },

  // === Initialization ===
  async init() {
    // Merge groups + knockout data into WC_DATA
    if (typeof WC_GROUPS !== 'undefined' && typeof WC_KNOCKOUT !== 'undefined') {
      this.data = JSON.parse(JSON.stringify({ ...WC_GROUPS, ...WC_KNOCKOUT }));
    } else if (typeof WC_DATA !== 'undefined') {
      this.data = JSON.parse(JSON.stringify(WC_DATA));
    } else {
      console.error('[WCApp] data files not loaded — cannot render');
      return;
    }
    if (!this.data) {
      console.error('[WCApp] no data — cannot render');
      return;
    }

    // Generate tournament date range
    this._buildDateRange();

    // Sort teams by standings criteria and compute stats on initial data
    this._recomputeStandings();
    this._recomputeStats();

    // Render immediately with cached data.js
    this.renderAll();

    // Inject ESPN live-data UI (status bar, auto-refresh)
    this._injectLiveUI();

    // Fetch ESPN data in background
    await this.fetchESPN();

    // Start auto-refresh
    this._startAutoRefresh();

    // Tab hash handling
    this._handleTabHash();
  },

  // === ESPN Data Fetching ===
  async fetchESPN() {
    try {
      this._setESPNStatus('fetching', null, 'Fetching live data from ESPN...');
      const allEvents = [];
      const fullDateMap = {};

      // Fetch all tournament dates
      const fetchPromises = this.ESPN_DATES.map(async (dateStr) => {
        try {
          const resp = await fetch(
            `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateStr}`,
            { headers: { 'User-Agent': 'WC2026-v3/1.0' } }
          );
          if (!resp.ok) return;
          const json = await resp.json();
          const events = json.events || [];
          events.forEach(ev => {
            // Build date mapping
            const comp = ev.competitions?.[0];
            if (!comp) return;
            const statusType = comp.status?.type?.id || '';
            const competitors = comp.competitors || [];
            if (competitors.length < 2) return;
            const tA = competitors[0], tB = competitors[1];
            const abbrA = tA.team?.abbreviation || '';
            const abbrB = tB.team?.abbreviation || '';
            if (!abbrA || !abbrB) return;

            const isHomeA = tA.homeAway === 'home';
            const isHomeB = tB.homeAway === 'home';
            const homeAbbr = isHomeA ? abbrA : abbrB;
            const awayAbbr = isHomeA ? abbrB : abbrA;
            const homeTeamId = isHomeA ? tA.team?.id : tB.team?.id;
            const awayTeamId = isHomeA ? tB.team?.id : tA.team?.id;
            const homeScore = parseInt(isHomeA ? (tA.score || '0') : (tB.score || '0'));
            const awayScore = parseInt(isHomeA ? (tB.score || '0') : (tA.score || '0'));

            // For upcoming matches, keep scores as null
            const finalStatus = this._mapESPNStatus(statusType);
            const finalHomeScore = finalStatus === 'upcoming' ? null : homeScore;
            const finalAwayScore = finalStatus === 'upcoming' ? null : awayScore;

            const status = finalStatus;
            const date = ev.date?.slice(0, 10) || '';

            if (!fullDateMap[date]) fullDateMap[date] = {};
            const key = `${homeAbbr}-${awayAbbr}`;
            fullDateMap[date][key] = {
              home: homeAbbr, away: awayAbbr,
              homeTeamId, awayTeamId,
              homeScore: finalHomeScore, awayScore: finalAwayScore,
              status, eventId: ev.id,
              hasDetails: comp.details && comp.details.length > 0,
              details: comp.details || []
            };
          });
          allEvents.push(...events);
        } catch (e) {
          // Individual date failure is non-fatal
        }
      });

      await Promise.allSettled(fetchPromises);

      if (Object.keys(fullDateMap).length === 0) {
        this._setESPNStatus('error', null, 'No ESPN data received');
        return;
      }

      this.espnData = allEvents;
      this.espnStatus.dateMap = fullDateMap;
      const now = new Date().toISOString();
      this.espnStatus.lastFetch = now;

      // Merge ESPN data into working data
      const updated = this._mergeESPNData();
      if (updated) {
        // Sync back to global WC_DATA for inline scripts (teams, news pages)
        if (typeof WC_DATA !== 'undefined') {
          WC_DATA.groups = this.data.groups;
          WC_DATA.stats = this.data.stats;
          WC_DATA.knockout = this.data.knockout;
          // topScorers are NOT overwritten from scoreboard — they stay as data.js static values
        }
      }
      // Always update timestamps with ESPN fetch time
      this.renderAll();

      // Check for live matches
      this._checkLiveMatches();

      this._setESPNStatus('ok', now, null);
    } catch (e) {
      console.error('[WCApp] ESPN fetch error:', e);
      this._setESPNStatus('error', null, e.message);
    }
  },

  // === Data Merging ===
  _mergeESPNData() {
    if (!this.data || !this.data.groups) return false;
    let changed = false;
    const dateMap = this.espnStatus.dateMap;

    // Iterate through all groups and their matches
    const groupKeys = Object.keys(this.data.groups);
    for (const gk of groupKeys) {
      const group = this.data.groups[gk];
      const matches = group.matches || [];

      for (let i = 0; i < matches.length; i++) {
        const m = matches[i];
        const homeCode = m.home;
        const awayCode = m.away;

        // Find this match in ESPN data
        const espnMatch = this._findESPNMatch(homeCode, awayCode);
        if (!espnMatch) continue;

        const espnScore = espnMatch.homeScore !== undefined ? espnMatch.homeScore : null;
        const espnAwayScore = espnMatch.awayScore !== undefined ? espnMatch.awayScore : null;
        const espnStatus = espnMatch.status || m.status;

        // Check if anything changed
        if (m.homeScore !== espnScore || m.awayScore !== espnAwayScore || m.status !== espnStatus) {
          m.homeScore = espnScore;
          m.awayScore = espnAwayScore;
          m.status = espnStatus;
          changed = true;
        }
      }
    }

    // Always recompute standings and stats (ensures proper sorting even without score changes)
    this._recomputeStandings();
    this._recomputeStats();
    // NOTE: Do NOT call _extractScorers() here — scoreboard details are incomplete
    // (misses ~10 goals including Messi's 6th). topScorers/topAssisters come from
    // data.js (generated by refresh_data.py via ESPN summary API) as static fallback.

    return changed;
  },

  _findESPNMatch(homeCode, awayCode) {
    const dateMap = this.espnStatus.dateMap;
    // Try each date in the map
    for (const date of Object.keys(dateMap)) {
      const dayMatches = dateMap[date];
      // Try exact order
      const key1 = `${homeCode}-${awayCode}`;
      if (dayMatches[key1]) return dayMatches[key1];
      // Try swapped
      const key2 = `${awayCode}-${homeCode}`;
      if (dayMatches[key2]) {
        // Swapped: ESPN has it away-home, flip scores
        const m = dayMatches[key2];
        return { ...m, home: m.away, away: m.home, homeScore: m.awayScore, awayScore: m.homeScore, homeTeamId: m.awayTeamId, awayTeamId: m.homeTeamId };
      }
    }
    return null;
  },

  _recomputeStandings() {
    const groupKeys = Object.keys(this.data.groups);
    for (const gk of groupKeys) {
      const group = this.data.groups[gk];
      const teams = group.teams || [];
      const matches = group.matches || [];

      // Reset all stats
      const stats = {};
      for (const t of teams) {
        stats[t.code] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
      }

      // Calculate from completed matches
      for (const m of matches) {
        if (m.status !== 'completed' || m.homeScore === null || m.awayScore === null) continue;
        const h = m.home, a = m.away;
        if (!stats[h] || !stats[a]) continue;

        const hs = m.homeScore, as = m.awayScore;
        stats[h].played++; stats[a].played++;
        stats[h].gf += hs; stats[h].ga += as;
        stats[a].gf += as; stats[a].ga += hs;

        if (hs > as) {
          stats[h].won++; stats[h].pts += 3;
          stats[a].lost++;
        } else if (as > hs) {
          stats[a].won++; stats[a].pts += 3;
          stats[h].lost++;
        } else {
          stats[h].drawn++; stats[h].pts++;
          stats[a].drawn++; stats[a].pts++;
        }
      }

      // Compute goal difference after all matches processed
      for (const tCode of Object.keys(stats)) {
        stats[tCode].gd = stats[tCode].gf - stats[tCode].ga;
      }

      // Apply to teams
      for (const t of teams) {
        const s = stats[t.code];
        if (!s) continue;
        t.played = s.played;
        t.won = s.won;
        t.drawn = s.drawn;
        t.lost = s.lost;
        t.gf = s.gf;
        t.ga = s.ga;
        t.gd = s.gd;
        t.pts = s.pts;
      }

      // Sort teams by pts > gd > gf
      teams.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.gf - a.gf;
      });

      // Update status (top 2 = qualifying, bottom 2 = eliminated after at least 1 match)
      const hasCompleted = teams.some(t => t.played > 0);
      if (hasCompleted) {
        teams.forEach((t, i) => {
          if (i < 2 && t.played > 0) t.status = 'qualifying';
          else if (i >= 2 && t.played > 0) t.status = 'eliminated';
          // Keep default 'qualifying' for teams with 0 matches played
        });
      }
    }
  },

    _recomputeStats() {
    const data = this.data;
    let totalMatches = 0, totalGoals = 0, cleanSheets = 0, draws = 0;
    let homeWins = 0, awayWins = 0;
    let biggestGD = -1, biggestWinText = '';
    let mostGoalsMatch = 0, mostGoalsText = '';

    // Count group stage matches
    for (const gk of Object.keys(data.groups)) {
      for (const m of data.groups[gk].matches) {
        if (m.status !== 'completed' || m.homeScore === null || m.awayScore === null) continue;
        const hs = m.homeScore, as = m.awayScore;
        totalMatches++;
        totalGoals += hs + as;

        if (hs === 0 || as === 0) cleanSheets++;
        if (hs === as) draws++;
        else if (hs > as) homeWins++;
        else awayWins++;

        const gd = Math.abs(hs - as);
        if (gd > biggestGD) {
          biggestGD = gd;
          biggestWinText = `${this._getTeamName(m.home)} ${hs}-${as} ${this._getTeamName(m.away)} (+${gd})`;
        }
        if ((hs + as) > mostGoalsMatch) {
          mostGoalsMatch = hs + as;
          mostGoalsText = `${this._getTeamName(m.home)} ${hs}-${as} ${this._getTeamName(m.away)} (${hs+as} goals)`;
        }
      }
    }

    // Count knockout matches too
    if (data.knockout) {
      const koRounds = ['roundOf32', 'roundOf16', 'quarterFinals', 'semiFinals'];
      for (const roundKey of koRounds) {
        const matches = data.knockout[roundKey] || [];
        for (const m of matches) {
          if (m.status !== 'completed' || m.homeScore === null || m.awayScore === null) continue;
          const hs = m.homeScore, as = m.awayScore;
          totalMatches++;
          totalGoals += hs + as;

          if (hs === 0 || as === 0) cleanSheets++;
          if (hs === as) draws++;
          else if (hs > as) homeWins++;
          else awayWins++;

          const gd = Math.abs(hs - as);
          if (gd > biggestGD) {
            biggestGD = gd;
            biggestWinText = `${this._getTeamName(m.home)} ${hs}-${as} ${this._getTeamName(m.away)} (+${gd})`;
          }
          if ((hs + as) > mostGoalsMatch) {
            mostGoalsMatch = hs + as;
            mostGoalsText = `${this._getTeamName(m.home)} ${hs}-${as} ${this._getTeamName(m.away)} (${hs+as} goals)`;
          }
        }
      }
      // Also check thirdPlace and final
      for (const m of [data.knockout.thirdPlace, data.knockout.final]) {
        if (!m || m.status !== 'completed' || m.homeScore === null || m.awayScore === null) continue;
        const hs = m.homeScore, as = m.awayScore;
        totalMatches++;
        totalGoals += hs + as;
        if (hs === 0 || as === 0) cleanSheets++;
        if (hs === as) draws++;
        else if (hs > as) homeWins++;
        else awayWins++;
        const gd = Math.abs(hs - as);
        if (gd > biggestGD) { biggestGD = gd; biggestWinText = `${this._getTeamName(m.home)} ${hs}-${as} ${this._getTeamName(m.away)} (+${gd})`; }
        if ((hs + as) > mostGoalsMatch) { mostGoalsMatch = hs + as; mostGoalsText = `${this._getTeamName(m.home)} ${hs}-${as} ${this._getTeamName(m.away)} (${hs+as} goals)`; }
      }
    }

    data.stats = {
      totalMatches,
      totalGoals,
      avgGoalsPerMatch: totalMatches > 0 ? +(totalGoals / totalMatches).toFixed(2) : 0,
      mostGoalsMatch: mostGoalsText,
      biggestWin: biggestWinText,
      cleanSheets,
      draws,
      homeWins,
      awayWins
    };
  },

  _getTeamName(code) {
    if (!this.data) return code;
    for (const gk of Object.keys(this.data.groups)) {
      const t = this.data.groups[gk].teams.find(t => t.code === code);
      if (t) return t.name;
    }
    return code;
  },

  // === Live Match Detection ===
  _checkLiveMatches() {
    this.espnStatus.hasLiveData = false;
    if (!this.data) return;

    for (const gk of Object.keys(this.data.groups)) {
      for (const m of this.data.groups[gk].matches) {
        if (m.status === 'live') {
          this.espnStatus.hasLiveData = true;
          return;
        }
      }
    }
  },

  // === UI Injection ===
  _injectLiveUI() {
    // Remove old server-dependent FAB if present
    const oldFab = document.getElementById('wc-update-fab');
    if (oldFab) oldFab.remove();
    const oldToast = document.getElementById('wc-update-toast');
    if (oldToast) oldToast.remove();

    // Inject live status bar on all pages (if not already there)
    if (document.getElementById('wc-live-bar')) return;

    const bar = document.createElement('div');
    bar.id = 'wc-live-bar';
    bar.className = 'live-bar hidden';
    bar.innerHTML = `
      <div class="live-bar-inner">
        <span class="live-indicator">
          <span class="live-dot ${this.espnStatus.hasLiveData ? 'pulse' : ''}"></span>
          <span id="liveStatusText">⚡ ESPN Live</span>
        </span>
        <span class="live-time" id="liveTimeText"></span>
      </div>
    `;
    document.body.appendChild(bar);

    // Add some minimal CSS for the live bar
    if (!document.getElementById('wc-live-style')) {
      const style = document.createElement('style');
      style.id = 'wc-live-style';
      style.textContent = `
        .live-bar {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: rgba(10,14,26,0.92);
          backdrop-filter: blur(8px);
          border-top: 1px solid var(--border-light);
          z-index: 999;
          padding: 0.4rem 1rem;
          transition: transform 0.3s;
        }
        .live-bar.hidden { transform: translateY(100%); }
        .live-bar-inner {
          max-width: 1400px; margin: 0 auto;
          display: flex; justify-content: space-between; align-items: center;
          font-size: 0.75rem; color: var(--text-secondary);
        }
        .live-indicator { display: flex; align-items: center; gap: 0.4rem; }
        .live-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--text-muted); display: inline-block;
        }
        .live-dot.pulse {
          background: var(--accent-green);
          animation: livePulse 2s infinite;
        }
        @keyframes livePulse {
          0% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50% { opacity: 0.8; box-shadow: 0 0 0 6px rgba(34,197,94,0); }
          100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
        .espn-badge {
          display: inline-block;
          background: rgba(34,197,94,0.12);
          color: var(--accent-green);
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          font-size: 0.7rem;
          margin-left: 0.5rem;
          vertical-align: middle;
        }
        .espn-badge.offline {
          background: rgba(100,116,139,0.12);
          color: var(--text-muted);
        }
        .match-item .match-status.live {
          background: rgba(239,68,68,0.2);
          color: #ef4444;
          animation: livePulse 2s infinite;
          font-weight: 700;
        }
      `;
      document.head.appendChild(style);
    }

    // Show bar when there's data
    this._updateLiveBar();
  },

  _updateLiveBar() {
    const bar = document.getElementById('wc-live-bar');
    if (!bar) return;
    const timeText = document.getElementById('liveTimeText');
    const statusText = document.getElementById('liveStatusText');
    const dot = bar.querySelector('.live-dot');

    if (this.espnStatus.lastFetch) {
      bar.classList.remove('hidden');
      const lastFetch = new Date(this.espnStatus.lastFetch);
      const now = new Date();
      const diff = Math.floor((now - lastFetch) / 1000);
      const timeAgo = diff < 60 ? `${diff}s ago` : diff < 3600 ? `${Math.floor(diff / 60)}m ago` : `${Math.floor(diff / 3600)}h ago`;

      if (this.espnStatus.hasLiveData) {
        dot.className = 'live-dot pulse';
        statusText.textContent = '🔴 LIVE — Match in progress';
      } else {
        dot.className = 'live-dot';
        statusText.textContent = '⚡ ESPN Live';
      }
      timeText.textContent = `Updated ${timeAgo} · auto-refresh every 5 min`;
    } else if (this.espnStatus.error) {
      bar.classList.remove('hidden');
      dot.className = 'live-dot';
      statusText.textContent = '📡 Using cached data (ESPN offline)';
      timeText.textContent = '';
    }
  },

  _setESPNStatus(state, timestamp, error) {
    if (state === 'ok') this.espnStatus.lastFetch = timestamp;
    else if (state === 'error') this.espnStatus.error = error;
    this._updateLiveBar();
  },

  _startAutoRefresh() {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    this.refreshTimer = setInterval(async () => {
      await this.fetchESPN();
    }, this.REFRESH_INTERVAL);
  },

  _buildDateRange() {
    const start = new Date('2026-06-11');
    const end = new Date('2026-07-19');
    const dates = [];
    const current = new Date(start);
    while (current <= end) {
      const ds = current.toISOString().slice(0, 10).replace(/-/g, '');
      dates.push(ds);
      current.setDate(current.getDate() + 1);
    }
    this.ESPN_DATES = dates;
  },

  // === Tab Routing ===
  _handleTabHash() {
    if (location.hash) {
      const targetTab = document.querySelector(`.tab-btn[data-tab="${location.hash.slice(1)}"]`);
      if (targetTab) setTimeout(() => targetTab.click(), 100);
    }
  },

  // === Master Render ===
  renderAll() {
    // Common: update footer timestamps
    this._updateTimestamps();

    // Per-page rendering based on available containers
    this.renderBracket();
    this.renderDashboardStats();
    this.renderTopScorers();
    this.renderTopAssisters();
    this.renderHighlights();
    this.renderAllGroupsTable();
    this.renderGroupCards();

    // Update live bar after render
    this._updateLiveBar();

    // Parse emoji via Twemoji (renders flag emoji on all browsers)
    if (typeof twemoji !== 'undefined') {
      try { twemoji.parse(document.body, { folder: 'svg', ext: '.svg' }); } catch(e) {}
    }
  },

  _updateTimestamps() {
    const ts = document.querySelectorAll('.update-note');
    const lastUpdated = this.espnStatus.lastFetch
      ? new Date(this.espnStatus.lastFetch)
      : null;

    ts.forEach(el => {
      if (lastUpdated) {
        const dateStr = lastUpdated.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const timeStr = lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        el.textContent = `ESPN Live Data · Updated ${dateStr} at ${timeStr}`;
        if (!el.querySelector('.espn-badge')) {
          const badge = document.createElement('span');
          badge.className = 'espn-badge';
          badge.textContent = '🌐 LIVE';
          el.appendChild(badge);
        }
      } else if (this.data?.lastUpdated) {
        // Show cached timestamp from data.js (before ESPN fetch)
        const cached = this.data.lastUpdated;
        const monthDay = cached.split(' at ')[0];
        el.textContent = `Data updated ${monthDay} · Group stage in progress`;
      }
    });
  },

  // ===========================================
  // RENDERERS (preserved & adapted from v2)
  // ===========================================

  // --- Bracket Renderer: Top/Bottom half side-by-side ---
  renderBracket() {
    const container = document.getElementById('knockout-bracket');
    if (!container || !this.data?.knockout) return;
    const ko = this.data.knockout;

    container.innerHTML = '';
    const bracketWrapper = document.createElement('div');
    bracketWrapper.className = 'bracket-wrapper';

    // Helper: render a single match card
    const renderMatch = (m, cssClass) => {
      const card = document.createElement('div');
      card.className = `bracket-match ${m.status || 'pending'} ${cssClass}`;
      if (m.home && m.away) card.classList.add('winner');

      const homePens = m.homePens !== undefined ? `<span class="bracket-pens">(${m.homePens})</span> ` : '';
      const awayPens = m.awayPens !== undefined ? ` <span class="bracket-pens">(${m.awayPens})</span>` : '';
      card.innerHTML = `
        <div class="bracket-teams">
          <div class="bracket-team">
            <span class="team-info">${m.home ? this._teamDisplay(m.home) : '<span style="color:var(--text-muted)">TBD</span>'}${homePens}</span>
            <span class="bracket-score">${m.homeScore !== null ? m.homeScore : '—'}</span>
          </div>
          <div class="bracket-team">
            <span class="team-info">${m.away ? this._teamDisplay(m.away) : '<span style="color:var(--text-muted)">TBD</span>'}${awayPens}</span>
            <span class="bracket-score">${m.awayScore !== null ? m.awayScore : '—'}</span>
          </div>
        </div>
        ${m.venue ? `<div class="bracket-meta">${m.date} · ${m.venue}</div>` : ''}
      `;
      return card;
    };

    // === TOP HALF (R32-1~8 → R16-1~4 → QF-1~2 → SF-1) ===
    const topHalf = document.createElement('div');
    topHalf.className = 'bracket-half';

    const topRounds = [
      { key: 'roundOf32', label: 'Round of 32', slice: [0, 8] },
      { key: 'roundOf16', label: 'Round of 16', slice: [0, 4] },
      { key: 'quarterFinals', label: 'Quarter-finals', slice: [0, 2] },
      { key: 'semiFinals', label: 'Semi-finals', slice: [0, 1] },
    ];

    topRounds.forEach(r => {
      const col = document.createElement('div');
      col.className = 'bracket-round';
      col.innerHTML = `<div class="bracket-round-label">${r.label}</div>`;
      const matches = (ko[r.key] || []).slice(r.slice[0], r.slice[1]);
      matches.forEach(m => col.appendChild(renderMatch(m)));
      topHalf.appendChild(col);
    });

    // === CENTER: Final + 3rd Place ===
    const centerCol = document.createElement('div');
    centerCol.className = 'bracket-center';

    const f = ko.final || {};
    const finalCard = document.createElement('div');
    finalCard.className = `bracket-match bracket-final ${f.status || 'pending'}`;
    finalCard.innerHTML = `
      <div class="bracket-round-label" style="color:#fff;border-bottom-color:var(--accent-gold)">🏆 Final</div>
      <div class="bracket-teams">
        <div class="bracket-team">
          <span class="team-info">${f.home ? this._teamDisplay(f.home) : '<span style="color:var(--text-muted)">SF Winner 1</span>'}</span>
          <span class="bracket-score">${f.homeScore !== null ? f.homeScore : '—'}</span>
        </div>
        <div class="bracket-team">
          <span class="team-info">${f.away ? this._teamDisplay(f.away) : '<span style="color:var(--text-muted)">SF Winner 2</span>'}</span>
          <span class="bracket-score">${f.awayScore !== null ? f.awayScore : '—'}</span>
        </div>
      </div>
      <div class="bracket-meta">${f.date || ''} · ${f.venue || ''}</div>
    `;
    centerCol.appendChild(finalCard);

    // 3rd place
    const third = ko.thirdPlace || {};
    const thirdCard = document.createElement('div');
    thirdCard.className = `bracket-match ${third.status || 'pending'}`;
    thirdCard.innerHTML = `
      <div class="bracket-round-label" style="font-size:0.65rem;border-bottom:none;padding:0.25rem;margin-bottom:0">🥉 3rd Place</div>
      <div class="bracket-teams">
        <div class="bracket-team">
          <span class="team-info">${third.home ? this._teamDisplay(third.home) : '<span style="color:var(--text-muted)">SF Loser 1</span>'}</span>
          <span class="bracket-score">${third.homeScore !== null ? third.homeScore : '—'}</span>
        </div>
        <div class="bracket-team">
          <span class="team-info">${third.away ? this._teamDisplay(third.away) : '<span style="color:var(--text-muted)">SF Loser 2</span>'}</span>
          <span class="bracket-score">${third.awayScore !== null ? third.awayScore : '—'}</span>
        </div>
      </div>
      <div class="bracket-meta">${third.date || ''} · ${third.venue || ''}</div>
    `;
    centerCol.appendChild(thirdCard);

    // === BOTTOM HALF (R32-9~16 → R16-5~8 → QF-3~4 → SF-2) ===
    const bottomHalf = document.createElement('div');
    bottomHalf.className = 'bracket-half';

    const bottomRounds = [
      { key: 'semiFinals', label: 'Semi-finals', slice: [1, 2] },
      { key: 'quarterFinals', label: 'Quarter-finals', slice: [2, 4] },
      { key: 'roundOf16', label: 'Round of 16', slice: [4, 8] },
      { key: 'roundOf32', label: 'Round of 32', slice: [8, 16] },
    ];

    bottomRounds.forEach(r => {
      const col = document.createElement('div');
      col.className = 'bracket-round';
      col.innerHTML = `<div class="bracket-round-label">${r.label}</div>`;
      const matches = (ko[r.key] || []).slice(r.slice[0], r.slice[1]);
      matches.forEach(m => col.appendChild(renderMatch(m)));
      bottomHalf.appendChild(col);
    });

    bracketWrapper.appendChild(topHalf);
    bracketWrapper.appendChild(centerCol);
    bracketWrapper.appendChild(bottomHalf);
    container.appendChild(bracketWrapper);
  },

  _teamDisplay(code) {
    const t = this._findTeam(code);
    return t ? `${t.flag} ${t.name}` : code;
  },

  _findTeam(code) {
    if (!this.data) return null;
    for (const gk of Object.keys(this.data.groups)) {
      const t = this.data.groups[gk].teams.find(t => t.code === code);
      if (t) return t;
    }
    return null;
  },

  // --- Dashboard Stats ---
  renderDashboardStats() {
    const container = document.getElementById('stats-bar');
    if (!container || !this.data?.stats) return;
    const s = this.data.stats;

    const items = [
      { value: s.totalMatches, label: 'Matches Played' },
      { value: s.totalGoals, label: 'Total Goals' },
      { value: s.avgGoalsPerMatch.toFixed(2), label: 'Avg Goals/Match' },
      { value: s.biggestWin ? s.biggestWin.split('(')[0].trim() : '—', label: 'Biggest Win' },
      { value: s.cleanSheets, label: 'Clean Sheets' },
      { value: s.draws, label: 'Draws' }
    ];

    container.innerHTML = items.map(item => `
      <div class="stat-card">
        <div class="stat-value">${item.value}</div>
        <div class="stat-label">${item.label}</div>
      </div>
    `).join('');
  },

  renderTopScorers() {
    const container = document.getElementById('top-scorers');
    if (!container || !this.data?.topScorers) return;

    const scorers = this.data.topScorers.filter(s => s.goals > 0);

    container.innerHTML = `
      <div class="scorers-table-wrap">
        <table class="scorers-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>Team</th>
              <th>Goals</th>
              <th>Matches</th>
            </tr>
          </thead>
          <tbody>
            ${scorers.map((s, i) => `
              <tr>
                <td>${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : s.rank}</td>
                <td>
                  <div class="player-info">
                    <span class="player-name">${s.name}</span>
                    ${s.goals >= 3 ? '<span class="golden-boot">👟</span>' : ''}
                  </div>
                </td>
                <td><span class="player-team">${s.flag} ${s.team}</span></td>
                <td><strong>${s.goals}</strong></td>
                <td>${s.matches}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // --- Top Assisters ---
  renderTopAssisters() {
    const container = document.getElementById('top-assisters');
    if (!container) return;

    // Use offline data as base, or runtime-computed if available
    const assisters = (this.data?.topAssisters || []).filter(s => s.assists > 0);

    if (assisters.length === 0) {
      container.innerHTML = '<p class="no-data">No assist data available yet</p>';
      return;
    }

    container.innerHTML = `
      <div class="scorers-table-wrap">
        <table class="scorers-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>Team</th>
              <th>Assists</th>
              <th>Matches</th>
            </tr>
          </thead>
          <tbody>
            ${assisters.map((s, i) => `
              <tr>
                <td>${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : s.rank}</td>
                <td>
                  <div class="player-info">
                    <span class="player-name">${s.name}</span>
                    ${s.assists >= 3 ? '<span class="golden-boot">👟</span>' : ''}
                  </div>
                </td>
                <td><span class="player-team">${s.flag} ${s.team}</span></td>
                <td><strong>${s.assists}</strong></td>
                <td>${s.matches}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // --- Highlights ---
  renderHighlights() {
    const container = document.getElementById('highlights');
    if (!container || !this.data?.highlights) return;

    container.innerHTML = this.data.highlights.map(h => `
      <div class="highlight-card">
        <div class="hl-type ${h.type}">${h.label}</div>
        <div class="hl-match">${h.match}</div>
        <div class="hl-desc">${h.description}</div>
        <div class="hl-meta">${h.date} · ${h.group ? 'Group ' + h.group : ''}</div>
      </div>
    `).join('');
  },

  // --- All Groups Table (Dashboard) ---
  renderAllGroupsTable() {
    const container = document.getElementById('all-groups-table');
    if (!container || !this.data?.groups) return;

    let html = '<div class="all-groups-table"><table><thead><tr><th>Group</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr></thead><tbody>';

    Object.entries(this.data.groups).forEach(([key, group]) => {
      html += `<tr class="group-divider"><td colspan="10">${group.name}</td></tr>`;
      group.teams.forEach(t => {
        const statusClass = t.status === 'qualifying' && t.played > 0 ? 'qualify-row' : (t.status === 'eliminated' ? 'eliminate-row' : '');
        const gdClass = t.gd > 0 ? 'gd-pos' : t.gd < 0 ? 'gd-neg' : '';
        html += `<tr class="${statusClass}">
          <td></td>
          <td>${t.flag} ${t.name}</td>
          <td>${t.played}</td>
          <td>${t.won}</td>
          <td>${t.drawn}</td>
          <td>${t.lost}</td>
          <td>${t.gf}</td>
          <td>${t.ga}</td>
          <td class="${gdClass}">${t.gd > 0 ? '+' : ''}${t.gd}</td>
          <td><strong>${t.pts}</strong></td>
        </tr>`;
      });
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
  },

  // --- Group Cards (Match Page) ---
  renderGroupCards() {
    const container = document.getElementById('group-cards');
    if (!container || !this.data?.groups) return;

    container.innerHTML = Object.entries(this.data.groups).map(([key, group]) => {
      const hasCompleted = group.teams.some(t => t.played > 0);
      const statusTag = hasCompleted
        ? '<span class="status-tag" style="background:rgba(34,197,94,0.15);color:var(--accent-green)">Active</span>'
        : '<span class="status-tag" style="background:rgba(100,116,139,0.2);color:var(--text-muted)">Upcoming</span>';

      return `
        <div class="group-card">
          <div class="group-card-header">
            <h3>${group.name}</h3>
            ${statusTag}
          </div>
          <div class="group-card-body">
            <table class="standings-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Team</th>
                  <th>P</th>
                  <th>W</th>
                  <th>D</th>
                  <th>L</th>
                  <th>GF</th>
                  <th>GA</th>
                  <th>GD</th>
                  <th>Pts</th>
                </tr>
              </thead>
              <tbody>
                ${group.teams.map((t, i) => `
                  <tr>
                    <td class="rank">${i + 1}</td>
                    <td>
                      <div class="team-cell">
                        <span class="team-flag">${t.flag}</span>
                        <span class="team-name">${t.name}</span>
                        ${t.played > 0 && t.status === 'qualifying' && i < 2
                          ? '<span class="qualify-dot green"></span>'
                          : t.played > 0 && t.status === 'eliminated'
                            ? '<span class="qualify-dot red"></span>'
                            : ''}
                      </div>
                    </td>
                    <td>${t.played}</td>
                    <td>${t.won}</td>
                    <td>${t.drawn}</td>
                    <td>${t.lost}</td>
                    <td>${t.gf}</td>
                    <td>${t.ga}</td>
                    <td class="${t.gd > 0 ? 'gd-pos' : t.gd < 0 ? 'gd-neg' : ''}">${t.gd > 0 ? '+' : ''}${t.gd}</td>
                    <td class="pts">${t.pts}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="group-matches">
            ${[1, 2, 3].map(rn => {
              const roundMatches = group.matches.filter(m => m.round === rn);
              if (roundMatches.length === 0) return '';
              return `
                <div class="round-group">
                  <div class="round-label">R${rn}</div>
                  ${roundMatches.map(m => {
                    const home = group.teams.find(t => t.code === m.home);
                    const away = group.teams.find(t => t.code === m.away);
                    const statusClass = m.status;
                    const statusLabel = m.status === 'completed'
                      ? 'FT'
                      : m.status === 'live'
                        ? 'LIVE'
                        : m.date.replace('Jun ', '');
                    const score = m.homeScore !== null
                      ? `<strong class="match-score">${m.homeScore} - ${m.awayScore}</strong>`
                      : '<strong class="match-score vs">vs</strong>';
                    return `
                      <div class="match-item">
                        <span class="match-teams">
                          ${home?.flag || ''}
                          ${score}
                          ${away?.flag || ''}
                          <span class="match-status ${statusClass}">${statusLabel}</span>
                        </span>
                      </div>
                    `;
                  }).join('')}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');
  }
};

// === Init on DOM ready ===
document.addEventListener('DOMContentLoaded', () => {
  WCApp.init();

  // ===== Mobile Nav Toggle (from v2) =====
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  // ===== Tab Switching (from v2) =====
  document.querySelectorAll('.tab-bar').forEach(bar => {
    const btns = bar.querySelectorAll('.tab-btn');
    const parent = bar.closest('.tab-wrapper') || bar.parentElement;
    const contents = parent.querySelectorAll('.tab-content');

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        contents.forEach(c => {
          c.classList.toggle('active', c.id === target);
        });
        if (target) history.replaceState(null, '', '#' + target);
      });
    });
  });
});