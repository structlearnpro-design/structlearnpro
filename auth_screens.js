// ================================================================
// auth_screens.js — All authentication UI screens
// Injected into StructLearnPro.html
// ================================================================

// ── INDIAN STATES LIST ────────────────────────────────────────────
const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu & Kashmir','Ladakh','Chandigarh','Puducherry'
]

// ── SCREEN: LOGIN ─────────────────────────────────────────────────
function screenLogin() {
  const app = document.getElementById('app')
  if (!app) return
  app.innerHTML = `
<div style="min-height:100vh;background:#0a0f1e;display:flex;align-items:center;justify-content:center;padding:20px;font-family:'JetBrains Mono',monospace">
  <div style="width:100%;max-width:420px">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:36px;margin-bottom:8px">🏗</div>
      <div style="font-size:22px;font-weight:900;color:#e2e8f0;letter-spacing:-0.5px">StructLearn Pro</div>
      <div style="font-size:12px;color:#475569;margin-top:4px">Structural Design · IS 456 · IS 1893</div>
    </div>

    <!-- Login card -->
    <div style="background:#0f172a;border:1px solid #1e3a8a;border-radius:16px;padding:32px">
      <div style="font-size:16px;font-weight:700;color:#e2e8f0;margin-bottom:6px">Welcome back</div>
      <div style="font-size:12px;color:#64748b;margin-bottom:24px">Enter your mobile number to continue</div>

      <!-- Mobile input -->
      <div style="margin-bottom:16px">
        <label style="font-size:11px;color:#94a3b8;display:block;margin-bottom:6px;font-weight:600">MOBILE NUMBER</label>
        <div style="display:flex;gap:0;border:1.5px solid #1e3a8a;border-radius:10px;overflow:hidden;transition:border-color 0.2s" id="mobileInputWrap">
          <div style="padding:12px 14px;background:#1e293b;color:#64748b;font-size:14px;font-weight:700;border-right:1px solid #1e3a8a;flex-shrink:0">+91</div>
          <input
            id="mobileInput"
            type="tel"
            placeholder="98765 43210"
            maxlength="10"
            inputmode="numeric"
            style="flex:1;padding:12px 14px;background:transparent;border:none;outline:none;color:#e2e8f0;font-size:15px;font-family:'JetBrains Mono',monospace;letter-spacing:1px"
            oninput="this.value=this.value.replace(/\\D/g,'').slice(0,10)"
            onkeydown="if(event.key==='Enter')authSendOTP()"
            onfocus="document.getElementById('mobileInputWrap').style.borderColor='#3b82f6'"
            onblur="document.getElementById('mobileInputWrap').style.borderColor='#1e3a8a'"
          />
        </div>
      </div>

      <!-- Error message -->
      <div id="authError" style="display:none;margin-bottom:12px;padding:10px 14px;background:rgba(248,113,113,0.1);border:1px solid #f87171;border-radius:8px;font-size:12px;color:#f87171"></div>

      <!-- Send OTP button -->
      <button
        id="sendOTPBtn"
        onclick="authSendOTP()"
        style="width:100%;padding:13px;background:linear-gradient(135deg,#1d4ed8,#2563eb);border:none;border-radius:10px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:'JetBrains Mono',monospace;letter-spacing:0.5px;transition:opacity 0.2s"
        onmouseover="this.style.opacity='0.9'"
        onmouseout="this.style.opacity='1'"
      >
        Send OTP →
      </button>

      <!-- Divider -->
      <div style="display:flex;align-items:center;gap:12px;margin:20px 0">
        <div style="flex:1;height:1px;background:#1e3a8a"></div>
        <div style="font-size:11px;color:#334155">First time here?</div>
        <div style="flex:1;height:1px;background:#1e3a8a"></div>
      </div>

      <!-- New user note -->
      <div style="text-align:center;font-size:12px;color:#64748b;line-height:1.6">
        New users are registered automatically.<br>
        Just enter your number and get the OTP.
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:20px;font-size:11px;color:#334155">
      Educational software · Never build without licensed structural engineer review
    </div>
  </div>
</div>`
  // Focus mobile input
  setTimeout(() => document.getElementById('mobileInput')?.focus(), 100)
}

// ── SCREEN: OTP VERIFY ────────────────────────────────────────────
function screenOTP(mobile) {
  const display = mobile.slice(-10)
  const masked  = display.slice(0,5) + 'XXXXX'
  const app = document.getElementById('app')
  app.innerHTML = `
<div style="min-height:100vh;background:#0a0f1e;display:flex;align-items:center;justify-content:center;padding:20px;font-family:'JetBrains Mono',monospace">
  <div style="width:100%;max-width:420px">

    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:36px;margin-bottom:8px">🏗</div>
      <div style="font-size:22px;font-weight:900;color:#e2e8f0">StructLearn Pro</div>
    </div>

    <div style="background:#0f172a;border:1px solid #1e3a8a;border-radius:16px;padding:32px">
      <div style="font-size:16px;font-weight:700;color:#e2e8f0;margin-bottom:6px">Enter OTP</div>
      <div style="font-size:12px;color:#64748b;margin-bottom:4px">OTP sent to +91 ${masked}</div>
      <div style="font-size:11px;color:#334155;margin-bottom:24px">Valid for 10 minutes</div>

      <!-- 6 OTP boxes -->
      <div style="display:flex;gap:10px;justify-content:center;margin-bottom:20px" id="otpBoxes">
        ${[0,1,2,3,4,5].map(i=>`
          <input
            id="otp${i}"
            type="tel"
            maxlength="1"
            inputmode="numeric"
            style="width:48px;height:56px;text-align:center;background:#0a0f1e;border:2px solid #1e3a8a;border-radius:10px;color:#e2e8f0;font-size:22px;font-weight:700;font-family:'JetBrains Mono',monospace;outline:none;transition:border-color 0.2s"
            oninput="otpInput(this,${i})"
            onkeydown="otpKeyDown(event,${i})"
            onfocus="this.style.borderColor='#3b82f6'"
            onblur="this.style.borderColor='#1e3a8a'"
          />`).join('')}
      </div>

      <!-- Timer -->
      <div style="text-align:center;margin-bottom:16px">
        <span style="font-size:12px;color:#64748b">Expires in </span>
        <span id="otpTimer" style="font-size:12px;color:#34d399;font-weight:700">10:00</span>
      </div>

      <!-- Error -->
      <div id="otpError" style="display:none;margin-bottom:12px;padding:10px 14px;background:rgba(248,113,113,0.1);border:1px solid #f87171;border-radius:8px;font-size:12px;color:#f87171"></div>

      <!-- Verify button -->
      <button
        id="verifyBtn"
        onclick="authVerifyOTP('${mobile}')"
        style="width:100%;padding:13px;background:linear-gradient(135deg,#065f46,#059669);border:none;border-radius:10px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:'JetBrains Mono',monospace;margin-bottom:12px"
      >
        Verify OTP ✓
      </button>

      <!-- Resend -->
      <div style="text-align:center">
        <button
          id="resendBtn"
          onclick="authResendOTP('${mobile}')"
          disabled
          style="background:none;border:none;color:#334155;font-size:12px;cursor:not-allowed;font-family:'JetBrains Mono',monospace"
        >
          Resend OTP (wait <span id="resendTimer">30s</span>)
        </button>
      </div>

      <!-- Back -->
      <div style="text-align:center;margin-top:16px">
        <button onclick="screenLogin()" style="background:none;border:none;color:#475569;font-size:12px;cursor:pointer;font-family:'JetBrains Mono',monospace">
          ← Change number
        </button>
      </div>
    </div>
  </div>
</div>`

  // Focus first box
  setTimeout(() => document.getElementById('otp0')?.focus(), 100)

  // Start countdown timer (10 min)
  let secs = 600
  const timerEl = document.getElementById('otpTimer')
  const otpCountdown = setInterval(() => {
    secs--
    if (timerEl) timerEl.textContent = Math.floor(secs/60)+':'+(secs%60).toString().padStart(2,'0')
    if (secs <= 0) {
      clearInterval(otpCountdown)
      if (timerEl) { timerEl.textContent = 'Expired'; timerEl.style.color = '#f87171' }
    }
  }, 1000)

  // Resend timer (30s)
  let resendSecs = 30
  const resendEl = document.getElementById('resendTimer')
  const resendBtn = document.getElementById('resendBtn')
  const resendCountdown = setInterval(() => {
    resendSecs--
    if (resendEl) resendEl.textContent = resendSecs + 's'
    if (resendSecs <= 0) {
      clearInterval(resendCountdown)
      if (resendBtn) {
        resendBtn.disabled = false
        resendBtn.style.color = '#3b82f6'
        resendBtn.style.cursor = 'pointer'
        resendBtn.textContent = 'Resend OTP'
      }
    }
  }, 1000)
}

// OTP box input handler
function otpInput(el, idx) {
  el.value = el.value.replace(/\D/g,'').slice(0,1)
  if (el.value && idx < 5) document.getElementById('otp'+(idx+1))?.focus()
  // Auto-verify when all 6 filled
  const allFilled = [0,1,2,3,4,5].every(i => document.getElementById('otp'+i)?.value)
  if (allFilled) {
    const mobile = document.getElementById('verifyBtn')
      ?.getAttribute('onclick')?.match(/'([^']+)'/)?.[1]
    if (mobile) authVerifyOTP(mobile)
  }
}

function otpKeyDown(event, idx) {
  if (event.key === 'Backspace' && !event.target.value && idx > 0) {
    document.getElementById('otp'+(idx-1))?.focus()
  }
}

// ── SCREEN: ROLE SELECTION ────────────────────────────────────────
function screenRegisterRole(userId, mobile) {
  const app = document.getElementById('app')
  app.innerHTML = `
<div style="min-height:100vh;background:#0a0f1e;display:flex;align-items:center;justify-content:center;padding:20px;font-family:'JetBrains Mono',monospace">
  <div style="width:100%;max-width:460px">

    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:22px;font-weight:900;color:#e2e8f0">🏗 StructLearn Pro</div>
      <div style="font-size:13px;color:#64748b;margin-top:6px">Welcome! Tell us who you are</div>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      ${[
        { role:'student',  icon:'🎓', title:'Student',              sub:'B.Tech / M.Tech / Diploma Civil Engineering',   color:'#3b82f6' },
        { role:'lecturer', icon:'👨‍🏫', title:'Lecturer / Professor',  sub:'Teaching civil or structural engineering',       color:'#8b5cf6' },
        { role:'engineer', icon:'🏗',  title:'Structural Engineer',   sub:'Working in practice, consultancy or government', color:'#f59e0b' },
      ].map(r => `
        <button
          onclick="screenRegisterDetails('${r.role}','${userId}','${mobile}')"
          style="display:flex;align-items:center;gap:16px;padding:20px;background:#0f172a;border:1.5px solid #1e3a8a;border-radius:14px;cursor:pointer;text-align:left;width:100%;transition:all 0.2s;font-family:'JetBrains Mono',monospace"
          onmouseover="this.style.borderColor='${r.color}';this.style.background='${r.color}11'"
          onmouseout="this.style.borderColor='#1e3a8a';this.style.background='#0f172a'"
        >
          <div style="font-size:28px;flex-shrink:0">${r.icon}</div>
          <div>
            <div style="font-size:14px;font-weight:700;color:#e2e8f0;margin-bottom:3px">${r.title}</div>
            <div style="font-size:11px;color:#64748b">${r.sub}</div>
          </div>
          <div style="margin-left:auto;color:#334155;font-size:18px">→</div>
        </button>`).join('')}
    </div>

    <div style="text-align:center;margin-top:16px;font-size:11px;color:#334155">
      Mobile: +91 ${mobile.slice(-10)}
    </div>
  </div>
</div>`
}

// ── SCREEN: REGISTER DETAILS ──────────────────────────────────────
function screenRegisterDetails(role, userId, mobile) {
  const isStudent  = role === 'student'
  const isLecturer = role === 'lecturer'
  const isEngineer = role === 'engineer'

  const stateOptions = INDIAN_STATES.map(s => `<option value="${s}">${s}</option>`).join('')

  const courseOptions = [
    'B.Tech Civil Engineering',
    'B.Tech Structural Engineering',
    'M.Tech Structural Engineering',
    'M.Tech Geotechnical Engineering',
    'Diploma Civil Engineering',
    'B.Tech Civil + M.Tech (Integrated)',
    'Other Civil / Construction Course',
  ].map(c => `<option value="${c}">${c}</option>`).join('')

  const designationOptions = [
    'Assistant Professor',
    'Associate Professor',
    'Professor',
    'HOD (Head of Department)',
    'Lab Instructor / Teaching Assistant',
  ].map(d => `<option value="${d}">${d}</option>`).join('')

  const roleOptions = [
    'Junior Structural Engineer',
    'Senior Structural Engineer',
    'Principal / Partner',
    'Site Engineer',
    'Project Manager',
    'Consultant (Self-employed)',
  ].map(r => `<option value="${r}">${r}</option>`).join('')

  const expOptions = [
    '0-2 years (Fresher)',
    '3-5 years',
    '6-10 years',
    '10+ years',
  ].map(e => `<option value="${e}">${e}</option>`).join('')

  const app = document.getElementById('app')
  app.innerHTML = `
<div style="min-height:100vh;background:#0a0f1e;display:flex;align-items:center;justify-content:center;padding:20px;font-family:'JetBrains Mono',monospace">
  <div style="width:100%;max-width:480px">

    <div style="text-align:center;margin-bottom:20px">
      <div style="font-size:22px;font-weight:900;color:#e2e8f0">🏗 StructLearn Pro</div>
      <div style="font-size:12px;color:#64748b;margin-top:4px">
        ${isStudent ? '🎓 Student Details' : isLecturer ? '👨‍🏫 Lecturer Details' : '🏗 Engineer Details'}
      </div>
    </div>

    <div style="background:#0f172a;border:1px solid #1e3a8a;border-radius:16px;padding:28px">

      ${field('Full Name *', 'regName', 'text', 'Rohan Kumar Sharma')}

      ${isStudent ? `
        ${field('College / University *', 'regCollege', 'text', 'MSIT Delhi')}
        ${selectField('Course *', 'regCourse', courseOptions)}
        ${selectField('Year of Study *', 'regYear', [1,2,3,4].map(y=>`<option value="${y}">${y}${y===1?'st':y===2?'nd':y===3?'rd':'th'} Year</option>`).join('')+'<option value="PG">Post Graduate</option>')}
        ${field('Batch / Section', 'regBatch', 'text', '2022-26 / Section B', false)}
      ` : ''}

      ${isLecturer ? `
        ${field('College / Institution *', 'regCollege', 'text', 'MSIT Delhi')}
        ${field('Department *', 'regDept', 'text', 'Civil Engineering')}
        ${selectField('Designation *', 'regDesignation', designationOptions)}
      ` : ''}

      ${isEngineer ? `
        ${field('Firm / Company *', 'regFirm', 'text', 'M-Structures Consultants (or "Freelance")')}
        ${selectField('Your Role *', 'regRoleTitle', roleOptions)}
        ${selectField('Experience *', 'regExp', expOptions)}
      ` : ''}

      ${field('City *', 'regCity', 'text', 'New Delhi')}
      ${selectField('State *', 'regState', '<option value="">Select state...</option>' + stateOptions)}
      ${field('Email (optional — for receiving reports)', 'regEmail', 'email', 'rohan@msit.edu.in', false)}

      <!-- Error -->
      <div id="regError" style="display:none;margin-bottom:12px;padding:10px 14px;background:rgba(248,113,113,0.1);border:1px solid #f87171;border-radius:8px;font-size:12px;color:#f87171"></div>

      <button
        id="createAccBtn"
        onclick="authCreateProfile('${role}','${userId}','${mobile}')"
        style="width:100%;padding:13px;background:linear-gradient(135deg,#065f46,#059669);border:none;border-radius:10px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:'JetBrains Mono',monospace;margin-top:8px"
      >
        Create My Account →
      </button>
    </div>

    <div style="text-align:center;margin-top:12px">
      <button onclick="screenRegisterRole('${userId}','${mobile}')" style="background:none;border:none;color:#475569;font-size:12px;cursor:pointer;font-family:'JetBrains Mono',monospace">
        ← Change role
      </button>
    </div>
  </div>
</div>`
}

// Form field helpers
function field(label, id, type='text', placeholder='', required=true) {
  return `
    <div style="margin-bottom:14px">
      <label style="font-size:11px;color:#94a3b8;display:block;margin-bottom:5px;font-weight:600">${label.toUpperCase()}</label>
      <input id="${id}" type="${type}" placeholder="${placeholder}"
        style="width:100%;padding:11px 14px;background:#0a0f1e;border:1.5px solid #1e3a8a;border-radius:8px;color:#e2e8f0;font-size:13px;font-family:'JetBrains Mono',monospace;outline:none;box-sizing:border-box"
        onfocus="this.style.borderColor='#3b82f6'"
        onblur="this.style.borderColor='#1e3a8a'"
      />
    </div>`
}

function selectField(label, id, options) {
  return `
    <div style="margin-bottom:14px">
      <label style="font-size:11px;color:#94a3b8;display:block;margin-bottom:5px;font-weight:600">${label.toUpperCase()}</label>
      <select id="${id}"
        style="width:100%;padding:11px 14px;background:#0a0f1e;border:1.5px solid #1e3a8a;border-radius:8px;color:#e2e8f0;font-size:13px;font-family:'JetBrains Mono',monospace;outline:none;box-sizing:border-box"
        onfocus="this.style.borderColor='#3b82f6'"
        onblur="this.style.borderColor='#1e3a8a'"
      >
        ${options}
      </select>
    </div>`
}

// ── SCREEN: WELCOME (shows unique ID) ─────────────────────────────
function screenWelcome(profile) {
  const app = document.getElementById('app')
  const roleLabel = {
    student:  'Student',
    lecturer: 'Lecturer',
    engineer: 'Structural Engineer',
    admin:    'Administrator',
  }[profile.role] || 'User'

  app.innerHTML = `
<div style="min-height:100vh;background:#0a0f1e;display:flex;align-items:center;justify-content:center;padding:20px;font-family:'JetBrains Mono',monospace">
  <div style="width:100%;max-width:440px;text-align:center">

    <div style="font-size:48px;margin-bottom:16px">✅</div>
    <div style="font-size:20px;font-weight:900;color:#34d399;margin-bottom:4px">Welcome to StructLearn Pro!</div>
    <div style="font-size:13px;color:#64748b;margin-bottom:32px">Hi ${profile.full_name.split(' ')[0]} 👋  Your account is ready</div>

    <!-- Unique ID card -->
    <div style="background:#0f172a;border:2px solid #1d4ed8;border-radius:16px;padding:28px;margin-bottom:24px;position:relative;overflow:hidden">
      <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#1d4ed8,#3b82f6,#60a5fa)"></div>
      <div style="font-size:11px;color:#64748b;font-weight:600;letter-spacing:1px;margin-bottom:12px">YOUR UNIQUE ${roleLabel.toUpperCase()} ID</div>
      <div id="uniqueIdDisplay" style="font-size:22px;font-weight:900;color:#60a5fa;letter-spacing:2px;margin-bottom:16px;word-break:break-all">
        ${profile.unique_id}
      </div>
      <div style="display:flex;gap:10px;justify-content:center">
        <button
          onclick="copyUniqueId('${profile.unique_id}')"
          style="padding:8px 16px;background:#1e3a8a;border:1px solid #3b82f6;border-radius:8px;color:#60a5fa;font-size:12px;cursor:pointer;font-family:'JetBrains Mono',monospace"
        >📋 Copy ID</button>
        <button
          onclick="saveIdAsImage('${profile.unique_id}','${profile.full_name}','${roleLabel}')"
          style="padding:8px 16px;background:#1e3a8a;border:1px solid #3b82f6;border-radius:8px;color:#60a5fa;font-size:12px;cursor:pointer;font-family:'JetBrains Mono',monospace"
        >🖼 Save Image</button>
      </div>
    </div>

    <div style="background:#0f172a;border:1px solid #1e3a8a;border-radius:12px;padding:16px;margin-bottom:24px;text-align:left">
      <div style="font-size:12px;color:#64748b;line-height:2">
        <div>📌 This ID appears on all your reports</div>
        <div>👨‍🏫 Share with your lecturer to join their batch</div>
        <div>📱 Always visible in your Profile section</div>
        <div>🔒 Permanent — never changes</div>
      </div>
    </div>

    <button
      onclick="goToDashboard()"
      style="width:100%;padding:14px;background:linear-gradient(135deg,#1d4ed8,#2563eb);border:none;border-radius:12px;color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:'JetBrains Mono',monospace;letter-spacing:0.5px"
    >
      Go to My Dashboard →
    </button>
  </div>
</div>`
}

// ── AUTH ACTIONS ───────────────────────────────────────────────────
async function authSendOTP() {
  const mobile = document.getElementById('mobileInput')?.value?.trim()
  if (!mobile || mobile.length !== 10) {
    showAuthError('Please enter a valid 10-digit mobile number')
    return
  }
  const btn = document.getElementById('sendOTPBtn')
  btn.disabled = true
  btn.textContent = 'Sending...'

  const result = await sendOTP(mobile)
  if (result.success) {
    screenOTP(mobile)
    // Dev mode — auto-fill OTP if returned
    if (result.dev_otp) {
      setTimeout(() => {
        result.dev_otp.split('').forEach((d, i) => {
          const el = document.getElementById('otp'+i)
          if (el) el.value = d
        })
        console.log('Dev OTP auto-filled:', result.dev_otp)
      }, 500)
    }
  } else {
    btn.disabled = false
    btn.textContent = 'Send OTP →'
    showAuthError(result.error || 'Failed to send OTP. Please try again.')
  }
}

async function authVerifyOTP(mobile) {
  const otp = [0,1,2,3,4,5].map(i => document.getElementById('otp'+i)?.value || '').join('')
  if (otp.length !== 6) {
    showOTPError('Please enter all 6 digits')
    return
  }
  const btn = document.getElementById('verifyBtn')
  btn.disabled = true
  btn.textContent = 'Verifying...'

  const result = await verifyOTP(mobile, otp)
  if (result.success) {
    if (result.isNewUser) {
      screenRegisterRole(result.userId, mobile)
    } else {
      // Existing user — go straight to dashboard
      await startSession()
      goToDashboard()
    }
  } else {
    btn.disabled = false
    btn.textContent = 'Verify OTP ✓'
    showOTPError(result.error || 'Invalid OTP. Please try again.')
  }
}

async function authResendOTP(mobile) {
  const result = await sendOTP(mobile)
  if (result.success) {
    screenOTP(mobile)
  } else {
    showOTPError(result.error || 'Failed to resend OTP')
  }
}

async function authCreateProfile(role, userId, mobile) {
  const btn = document.getElementById('createAccBtn')
  const fullName = document.getElementById('regName')?.value?.trim()
  if (!fullName) { showRegError('Full name is required'); return }

  const city  = document.getElementById('regCity')?.value?.trim()
  const state = document.getElementById('regState')?.value
  if (!city)  { showRegError('City is required'); return }
  if (!state) { showRegError('State is required'); return }

  btn.disabled = true
  btn.textContent = 'Creating account...'

  const profileData = {
    userId,
    mobile,
    role,
    fullName,
    email:       document.getElementById('regEmail')?.value?.trim() || null,
    college:     document.getElementById('regCollege')?.value?.trim() || null,
    course:      document.getElementById('regCourse')?.value || null,
    yearOfStudy: parseInt(document.getElementById('regYear')?.value) || null,
    batch:       document.getElementById('regBatch')?.value?.trim() || null,
    department:  document.getElementById('regDept')?.value?.trim() || null,
    designation: document.getElementById('regDesignation')?.value || null,
    firmName:    document.getElementById('regFirm')?.value?.trim() || null,
    roleTitle:   document.getElementById('regRoleTitle')?.value || null,
    experience:  document.getElementById('regExp')?.value || null,
    city,
    state,
  }

  const result = await createProfile(profileData)
  if (result.success) {
    await startSession()
    logEvent('account_created', { role, college: profileData.college })
    screenWelcome(result.profile)
  } else {
    btn.disabled = false
    btn.textContent = 'Create My Account →'
    showRegError(result.error || 'Failed to create account. Please try again.')
  }
}

// ── ID UTILITIES ───────────────────────────────────────────────────
function copyUniqueId(id) {
  navigator.clipboard.writeText(id).then(() => {
    const btn = event.target
    const orig = btn.textContent
    btn.textContent = '✅ Copied!'
    setTimeout(() => btn.textContent = orig, 2000)
  })
}

function saveIdAsImage(uniqueId, fullName, roleLabel) {
  const canvas = document.createElement('canvas')
  canvas.width = 800; canvas.height = 400
  const ctx = canvas.getContext('2d')
  // Background
  ctx.fillStyle = '#0a0f1e'
  ctx.fillRect(0, 0, 800, 400)
  // Border
  ctx.strokeStyle = '#1d4ed8'
  ctx.lineWidth = 3
  ctx.strokeRect(20, 20, 760, 360)
  // Top gradient bar
  const grad = ctx.createLinearGradient(20, 20, 780, 20)
  grad.addColorStop(0, '#1d4ed8')
  grad.addColorStop(1, '#60a5fa')
  ctx.fillStyle = grad
  ctx.fillRect(20, 20, 760, 5)
  // Logo text
  ctx.fillStyle = '#60a5fa'
  ctx.font = 'bold 28px monospace'
  ctx.fillText('🏗 StructLearn Pro', 50, 90)
  // Name
  ctx.fillStyle = '#e2e8f0'
  ctx.font = 'bold 36px monospace'
  ctx.fillText(fullName, 50, 150)
  // Role
  ctx.fillStyle = '#64748b'
  ctx.font = '20px monospace'
  ctx.fillText(roleLabel, 50, 185)
  // ID label
  ctx.fillStyle = '#475569'
  ctx.font = '16px monospace'
  ctx.fillText('UNIQUE ID', 50, 250)
  // ID value
  ctx.fillStyle = '#60a5fa'
  ctx.font = 'bold 42px monospace'
  ctx.fillText(uniqueId, 50, 310)
  // Footer
  ctx.fillStyle = '#334155'
  ctx.font = '16px monospace'
  ctx.fillText('structlearnpro.vercel.app', 50, 360)
  // Download
  const a = document.createElement('a')
  a.download = uniqueId + '_StructLearnPro.png'
  a.href = canvas.toDataURL()
  a.click()
}

// ── ERROR HELPERS ──────────────────────────────────────────────────
function showAuthError(msg) {
  const el = document.getElementById('authError')
  if (el) { el.textContent = msg; el.style.display = 'block' }
}
function showOTPError(msg) {
  const el = document.getElementById('otpError')
  if (el) { el.textContent = msg; el.style.display = 'block' }
}
function showRegError(msg) {
  const el = document.getElementById('regError')
  if (el) { el.textContent = msg; el.style.display = 'block' }
}
