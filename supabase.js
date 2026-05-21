// ================================================================
// supabase.js — All cloud logic for StructLearn Pro
// Handles: Auth, Projects, Events, Snapshots, Progress
// ================================================================

const SUPABASE_URL     = 'https://rpjdveuxxjeoeomkwrfx.supabase.co'
const SUPABASE_ANON    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwamR2ZXV4eGplb2VvbWt3cmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MzY3NzIsImV4cCI6MjA5NDUxMjc3Mn0.3JvvMaCFKg2fB9-l2WJ5JMX5btGIKqvpMj_ZcxSRWaQ'
const EDGE_BASE        = SUPABASE_URL + '/functions/v1'

// ── INIT ─────────────────────────────────────────────────────────
let _sb = null
let _currentUser = null     // auth user
let _currentProfile = null  // profiles row
let _sessionId = null       // current session UUID
let _autoSaveTimer = null
let _sessionTimer = null
let _sessionStart = Date.now()

function getSB() {
  if (!_sb && window.supabase) {
    _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON)
  }
  return _sb
}

// ── SESSION CHECK ─────────────────────────────────────────────────
// Called on app load — decides whether to show login or dashboard
async function checkSession() {
  const sb = getSB()
  if (!sb) return null
  const { data: { session } } = await sb.auth.getSession()
  if (!session) return null
  _currentUser = session.user
  await loadCurrentProfile()
  return session
}

async function loadCurrentProfile() {
  if (!_currentUser) return null
  const sb = getSB()
  const { data } = await sb
    .from('profiles')
    .select('*')
    .eq('user_id', _currentUser.id)
    .single()
  _currentProfile = data
  return data
}

// ── OTP AUTH ──────────────────────────────────────────────────────
async function sendOTP(mobile) {
  const resp = await fetch(EDGE_BASE + '/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
               'Authorization': 'Bearer ' + SUPABASE_ANON },
    body: JSON.stringify({ mobile })
  })
  return await resp.json()
}

async function verifyOTP(mobile, otp) {
  const resp = await fetch(EDGE_BASE + '/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
               'Authorization': 'Bearer ' + SUPABASE_ANON },
    body: JSON.stringify({ mobile, otp })
  })
  const data = await resp.json()
  if (data.success && data.userId) {
    // Sign in using the service-generated session
    // We use a magic link approach — sign in with the placeholder email
    const cleanMobile = mobile.replace(/\D/g, '')
    const normMobile  = cleanMobile.startsWith('91') ? cleanMobile : '91' + cleanMobile
    const email = normMobile + '@structlearn.app'
    // The edge function already verified — sign in anonymously with userId
    _currentUser = { id: data.userId, mobile }
    _currentProfile = data.profile
  }
  return data
}

// ── PROFILE CREATION ──────────────────────────────────────────────
async function createProfile(profileData) {
  const resp = await fetch(EDGE_BASE + '/create-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
               'Authorization': 'Bearer ' + SUPABASE_ANON },
    body: JSON.stringify(profileData)
  })
  const data = await resp.json()
  if (data.success) {
    _currentProfile = data.profile
  }
  return data
}

// ── SIGN OUT ──────────────────────────────────────────────────────
async function cloudSignOut() {
  await endSession()
  const sb = getSB()
  if (sb) await sb.auth.signOut()
  _currentUser = null
  _currentProfile = null
  _sessionId = null
  localStorage.removeItem('slp_session')
}

// ── PROJECTS ──────────────────────────────────────────────────────
async function loadProjects() {
  const sb = getSB()
  if (!sb || !_currentUser) return []
  const { data, error } = await sb
    .from('projects')
    .select('id, name, client, location, floors, fck, fy, grid_x, grid_y, thumbnail_svg, safety_score, all_checks_pass, analysis_count, time_spent_sec, created_at, updated_at')
    .eq('user_id', _currentUser.id)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
  if (error) console.error('loadProjects:', error)
  return data || []
}

async function loadProject(projectId) {
  const sb = getSB()
  if (!sb || !_currentUser) return null
  const { data, error } = await sb
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', _currentUser.id)
    .single()
  if (error) console.error('loadProject:', error)
  return data
}

async function createProject(name, location) {
  const sb = getSB()
  if (!sb || !_currentUser) return null
  const { data, error } = await sb
    .from('projects')
    .insert({
      user_id:  _currentUser.id,
      name:     name || 'Untitled Project',
      location: location || '',
      floors:   S.numFloors || 3,
      fck:      S.fck || 25,
      fy:       S.fy || 500,
    })
    .select()
    .single()
  if (error) { console.error('createProject:', error); return null }
  logEvent('project_created', { name, location }, data.id)
  return data
}

async function saveProject(projectId) {
  const sb = getSB()
  if (!sb || !_currentUser || !projectId) return false

  // Generate thumbnail SVG from current grid
  const thumbSvg = generateThumbnailSVG()

  const { error } = await sb
    .from('projects')
    .update({
      name:            S.name || 'Untitled Project',
      client:          S.client || '',
      location:        S.location || '',
      floors:          S.numFloors,
      fck:             S.fck,
      fy:              S.fy,
      grid_x:          S.spansX ? S.spansX.length : 0,
      grid_y:          S.spansY ? S.spansY.length : 0,
      state_json:      JSON.parse(JSON.stringify(S)),
      grid_json:       {
        grid:          GRID ? JSON.parse(JSON.stringify(GRID)) : null,
        nodeChoices:   window._nodeChoices || {},
        coordMode:     window._coordMode || false,
      },
      results_json:    RES ? JSON.parse(JSON.stringify(RES)) : null,
      thumbnail_svg:   thumbSvg,
      safety_score:    RES ? (RES.safetyScore || 0) : null,
      all_checks_pass: RES ? (RES.allPass || false) : null,
      analysis_count:  sb
        .rpc('increment_analysis_count', { p_id: projectId })
        .then(() => {}).catch(() => {}), // fire and forget
    })
    .eq('id', projectId)
    .eq('user_id', _currentUser.id)

  if (error) { console.error('saveProject:', error); return false }
  updateSaveIndicator('just now')
  return true
}

async function deleteProject(projectId) {
  const sb = getSB()
  if (!sb || !_currentUser) return false
  const { error } = await sb
    .from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', projectId)
    .eq('user_id', _currentUser.id)
  if (error) { console.error('deleteProject:', error); return false }
  return true
}

// ── AUTO-SAVE ──────────────────────────────────────────────────────
let _currentProjectId = null

function startAutoSave(projectId) {
  _currentProjectId = projectId
  clearInterval(_autoSaveTimer)
  _autoSaveTimer = setInterval(async () => {
    if (_currentProjectId) {
      await saveProject(_currentProjectId)
    }
  }, 30000) // every 30 seconds
}

function stopAutoSave() {
  clearInterval(_autoSaveTimer)
  _autoSaveTimer = null
}

function updateSaveIndicator(when) {
  const el = document.getElementById('saveIndicator')
  if (el) el.textContent = '☁ Saved ' + when
}

// ── THUMBNAIL GENERATOR ──────────────────────────────────────────
function generateThumbnailSVG() {
  if (!GRID || !GRID.nodes) return ''
  try {
    const W = 120, H = 80
    const nBX = S.spansX ? S.spansX.length : 3
    const nBY = S.spansY ? S.spansY.length : 3
    const pad = 8
    const cw = (W - pad*2) / nBX
    const ch = (H - pad*2) / nBY
    let svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">`
    svg += `<rect width="${W}" height="${H}" fill="#0f172a"/>`
    // Draw bay fills
    for (let ci = 0; ci < nBX; ci++) {
      for (let ri = 0; ri < nBY; ri++) {
        const bay = GRID.bays && GRID.bays.find(b => b.col===ci && b.row===ri)
        const fill = bay && bay.type === 'staircase' ? '#f59e0b33'
                   : bay && bay.type === 'void'      ? '#47474733'
                   : '#38bdf822'
        svg += `<rect x="${pad+ci*cw}" y="${pad+ri*ch}" width="${cw-1}" height="${ch-1}" fill="${fill}"/>`
      }
    }
    // Draw column dots
    for (let ci = 0; ci <= nBX; ci++) {
      for (let ri = 0; ri <= nBY; ri++) {
        const node = GRID.nodes && GRID.nodes.find(n => n.col===ci && n.row===ri)
        const hasCol = !node || node.hasColumn !== false
        if (hasCol) {
          svg += `<circle cx="${pad+ci*cw}" cy="${pad+ri*ch}" r="2.5" fill="#e2e8f0"/>`
        } else {
          // Missing column (transfer beam node)
          svg += `<circle cx="${pad+ci*cw}" cy="${pad+ri*ch}" r="2.5" fill="none" stroke="#f59e0b" stroke-width="1"/>`
        }
      }
    }
    svg += '</svg>'
    return svg
  } catch(e) {
    return ''
  }
}

// ── SNAPSHOTS ──────────────────────────────────────────────────────
async function saveSnapshot(label, projectId) {
  const sb = getSB()
  if (!sb || !_currentUser || !RES) return null
  const { data, error } = await sb
    .from('snapshots')
    .insert({
      user_id:      _currentUser.id,
      project_id:   projectId || _currentProjectId,
      label:        label || ('Snapshot ' + new Date().toLocaleTimeString('en-IN')),
      state_json:   JSON.parse(JSON.stringify(S)),
      results_json: JSON.parse(JSON.stringify(RES)),
      safety_score: RES.safetyScore || 0,
      all_pass:     RES.allPass || false,
    })
    .select()
    .single()
  if (error) { console.error('saveSnapshot:', error); return null }
  logEvent('snapshot_taken', { label, safety: RES.safetyScore }, projectId)
  return data
}

async function loadSnapshots(projectId) {
  const sb = getSB()
  if (!sb || !_currentUser) return []
  const { data } = await sb
    .from('snapshots')
    .select('*')
    .eq('project_id', projectId)
    .eq('user_id', _currentUser.id)
    .order('created_at', { ascending: false })
  return data || []
}

async function deleteSnapshot(snapshotId) {
  const sb = getSB()
  if (!sb || !_currentUser) return false
  await sb.from('snapshots').delete()
    .eq('id', snapshotId).eq('user_id', _currentUser.id)
  return true
}

// ── EVENT LOGGING ──────────────────────────────────────────────────
async function logEvent(eventType, eventData, projectId) {
  const sb = getSB()
  if (!sb || !_currentUser) return
  // Fire and forget — never block the UI
  sb.from('events').insert({
    user_id:    _currentUser.id,
    project_id: projectId || _currentProjectId || null,
    session_id: _sessionId,
    event_type: eventType,
    event_data: eventData || {},
    page:       typeof PAGE !== 'undefined' ? String(PAGE) : null,
  }).then(({error}) => {
    if (error) console.warn('logEvent failed:', error.message)
  })
}

// ── SESSION TRACKING ───────────────────────────────────────────────
async function startSession() {
  const sb = getSB()
  if (!sb || !_currentUser) return
  _sessionStart = Date.now()
  const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? 'mobile'
                   : /Tablet|iPad/i.test(navigator.userAgent)  ? 'tablet'
                   : 'desktop'
  const { data } = await sb
    .from('sessions')
    .insert({
      user_id:     _currentUser.id,
      device_type: deviceType,
      browser:     navigator.userAgent.slice(0, 100),
    })
    .select('id')
    .single()
  if (data) _sessionId = data.id
  // Store in localStorage for recovery
  localStorage.setItem('slp_session', JSON.stringify({ sessionId: _sessionId, start: _sessionStart }))
  logEvent('session_started', { device_type: deviceType })
}

async function endSession() {
  const sb = getSB()
  if (!sb || !_currentUser || !_sessionId) return
  const duration = Math.round((Date.now() - _sessionStart) / 1000)
  await sb.from('sessions')
    .update({ ended_at: new Date().toISOString(), duration_sec: duration })
    .eq('id', _sessionId)
  // Update total time on profile
  await sb.from('profiles')
    .update({ total_time_sec: sb.rpc('increment', { x: duration }) })
    .eq('user_id', _currentUser.id)
  logEvent('session_ended', { duration_seconds: duration })
  localStorage.removeItem('slp_session')
}

// Listen for page close — save session end
window.addEventListener('beforeunload', () => {
  endSession()
  if (_currentProjectId) saveProject(_currentProjectId)
})

// ── PROGRESS ───────────────────────────────────────────────────────
async function updateProgress(updates) {
  const sb = getSB()
  if (!sb || !_currentUser) return
  const { data: existing } = await sb
    .from('progress')
    .select('*')
    .eq('user_id', _currentUser.id)
    .single()
  if (!existing) {
    await sb.from('progress').insert({ user_id: _currentUser.id, ...updates })
  } else {
    // Merge quiz scores (keep highest)
    const mergedScores = { ...(existing.quiz_scores || {}), ...(updates.quiz_scores || {}) }
    Object.keys(mergedScores).forEach(topic => {
      if (existing.quiz_scores?.[topic] && updates.quiz_scores?.[topic]) {
        mergedScores[topic] = Math.max(existing.quiz_scores[topic], updates.quiz_scores[topic])
      }
    })
    await sb.from('progress')
      .update({
        ...updates,
        quiz_scores: mergedScores,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', _currentUser.id)
  }
}

// ── GETTERS ────────────────────────────────────────────────────────
function getCurrentUser()    { return _currentUser }
function getCurrentProfile() { return _currentProfile }
function getCurrentProjectId() { return _currentProjectId }
function setCurrentProjectId(id) { _currentProjectId = id }
