(function(){
  const SUPABASE_URL = 'https://cnlmfivtdbaokbphxkrn.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_6x82gamZZ4r41eVag9Nmrg_sElZHtHS';

  if (!window.supabase || !window.supabase.createClient) {
    console.warn('Supabase client library did not load.');
    return;
  }

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage
    }
  });

  const listeners = [];
  let currentUser = null;
  let authReady = false;

  window.PatternDeskAuth = {
    supabase: client,
    getUser: async function(){
      const { data } = await client.auth.getUser();
      currentUser = data && data.user ? data.user : null;
      return currentUser;
    },
    getSession: async function(){
      const { data } = await client.auth.getSession();
      return data ? data.session : null;
    },
    onAuthReady: function(fn){
      if (typeof fn !== 'function') return;
      listeners.push(fn);
      if (authReady) fn(currentUser);
    },
    open: function(mode){ openModal(mode || 'login'); },
    signOut: async function(){ await client.auth.signOut(); }
  };

  function notify(user){
    currentUser = user || null;
    authReady = true;
    listeners.forEach(function(fn){
      try { fn(currentUser); } catch(e){ console.warn(e); }
    });
  }

  function injectControls(){
    const headrow = document.querySelector('.headrow');
    if (!headrow || document.getElementById('authWidget')) return;

    const widget = document.createElement('div');
    widget.className = 'auth-widget';
    widget.id = 'authWidget';
    widget.innerHTML = `
      <a class="auth-profile" id="authProfile" href="profile.html" style="display:none;">Profile</a>
      <button class="auth-btn" id="authLoginOpen" type="button">Log in</button>
      <button class="auth-btn signup" id="authSignupOpen" type="button">Sign up</button>
      <button class="auth-btn ghost" id="authOut" type="button" style="display:none;">Log out</button>
    `;
    headrow.appendChild(widget);

    document.getElementById('authLoginOpen').addEventListener('click', function(){ openModal('login'); });
    document.getElementById('authSignupOpen').addEventListener('click', function(){ openModal('signup'); });
    document.getElementById('authOut').addEventListener('click', function(){ client.auth.signOut(); });
  }

  function injectModal(){
    if (document.getElementById('authModal')) return;
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.id = 'authModal';
    modal.setAttribute('aria-hidden','true');
    modal.innerHTML = `
      <div class="auth-card" role="dialog" aria-modal="true" aria-labelledby="authTitle">
        <button class="auth-close" id="authClose" type="button" aria-label="Close">×</button>
        <p class="auth-kicker">PatternDesk account</p>
        <h2 id="authTitle">Log in</h2>
        <p class="auth-copy" id="authCopy">Log in to continue tracking your quiz history and trading game progress.</p>

        <div class="auth-tabs" role="tablist" aria-label="Account options">
          <button class="auth-tab active" id="authTabLogin" type="button" role="tab" aria-selected="true">Log in</button>
          <button class="auth-tab" id="authTabSignup" type="button" role="tab" aria-selected="false">Create account</button>
        </div>

        <div class="auth-panel" id="loginPanel">
          <label for="authLoginEmail">Email</label>
          <input class="auth-input" id="authLoginEmail" type="email" autocomplete="email" placeholder="you@example.com">
          <label for="authLoginPassword">Password</label>
          <input class="auth-input" id="authLoginPassword" type="password" autocomplete="current-password" placeholder="Your password">
          <button class="auth-submit full" id="authLogin" type="button">Log in</button>
        </div>

        <div class="auth-panel" id="signupPanel" style="display:none;">
          <label for="authSignupName">Display name</label>
          <input class="auth-input" id="authSignupName" type="text" autocomplete="nickname" placeholder="Your player name">
          <label for="authSignupEmail">Email</label>
          <input class="auth-input" id="authSignupEmail" type="email" autocomplete="email" placeholder="you@example.com">
          <label for="authSignupPassword">Create password</label>
          <input class="auth-input" id="authSignupPassword" type="password" autocomplete="new-password" placeholder="Minimum 6 characters">
          <label for="authSignupPassword2">Confirm password</label>
          <input class="auth-input" id="authSignupPassword2" type="password" autocomplete="new-password" placeholder="Repeat password">
          <button class="auth-submit secondary full" id="authSignup" type="button">Create account</button>
        </div>

        <p class="auth-message" id="authMessage"></p>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('authClose').addEventListener('click', closeModal);
    modal.addEventListener('click', function(e){ if (e.target === modal) closeModal(); });
    document.getElementById('authTabLogin').addEventListener('click', function(){ setMode('login'); });
    document.getElementById('authTabSignup').addEventListener('click', function(){ setMode('signup'); });
    document.getElementById('authLogin').addEventListener('click', login);
    document.getElementById('authSignup').addEventListener('click', signup);
    document.getElementById('authLoginPassword').addEventListener('keydown', function(e){ if(e.key === 'Enter') login(); });
    document.getElementById('authSignupPassword2').addEventListener('keydown', function(e){ if(e.key === 'Enter') signup(); });
  }

  function setMode(mode){
    const loginMode = mode !== 'signup';
    const title = document.getElementById('authTitle');
    const copy = document.getElementById('authCopy');
    const tabLogin = document.getElementById('authTabLogin');
    const tabSignup = document.getElementById('authTabSignup');
    const loginPanel = document.getElementById('loginPanel');
    const signupPanel = document.getElementById('signupPanel');
    if (!title || !copy || !tabLogin || !tabSignup || !loginPanel || !signupPanel) return;

    title.textContent = loginMode ? 'Log in' : 'Create your account';
    copy.textContent = loginMode
      ? 'Log in to continue tracking your quiz history and trading game progress.'
      : 'Create a free account so PatternDesk can save your progress across devices.';
    tabLogin.classList.toggle('active', loginMode);
    tabSignup.classList.toggle('active', !loginMode);
    tabLogin.setAttribute('aria-selected', loginMode ? 'true' : 'false');
    tabSignup.setAttribute('aria-selected', !loginMode ? 'true' : 'false');
    loginPanel.style.display = loginMode ? 'block' : 'none';
    signupPanel.style.display = loginMode ? 'none' : 'block';
    setMessage('');
    setTimeout(function(){
      const first = loginMode ? document.getElementById('authLoginEmail') : document.getElementById('authSignupName');
      if (first) first.focus();
    }, 50);
  }

  function openModal(mode){
    injectModal();
    setMode(mode || 'login');
    const modal = document.getElementById('authModal');
    modal.classList.add('show');
    modal.setAttribute('aria-hidden','false');
  }

  function closeModal(){
    const modal = document.getElementById('authModal');
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden','true');
  }

  function setMessage(text, isError){
    const msg = document.getElementById('authMessage');
    if (!msg) return;
    msg.textContent = text || '';
    msg.classList.toggle('error', !!isError);
  }

  async function login(){
    const email = (document.getElementById('authLoginEmail').value || '').trim();
    const password = document.getElementById('authLoginPassword').value || '';
    if (!email || !password) return setMessage('Enter your email and password.', true);
    setMessage('Logging in…');
    const { error } = await client.auth.signInWithPassword({ email: email, password: password });
    if (error) return setMessage(error.message, true);
    setMessage('Logged in. Your progress will now save.');
    setTimeout(closeModal, 700);
  }

  async function signup(){
    const displayName = (document.getElementById('authSignupName').value || '').trim();
    const email = (document.getElementById('authSignupEmail').value || '').trim();
    const password = document.getElementById('authSignupPassword').value || '';
    const password2 = document.getElementById('authSignupPassword2').value || '';
    if (!email || !password) return setMessage('Enter your email and create a password.', true);
    if (password.length < 6) return setMessage('Password must be at least 6 characters.', true);
    if (password !== password2) return setMessage('Passwords do not match.', true);
    setMessage('Creating account…');
    const { error } = await client.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: 'https://patterndesk.co.uk/profile.html',
        data: { display_name: displayName || email.split('@')[0] }
      }
    });
    if (error) return setMessage(error.message, true);
    setMessage('Account created. Check your email, confirm it, then log in.');
    setMode('login');
  }

  function updateControls(user){
    const loginOpen = document.getElementById('authLoginOpen');
    const signupOpen = document.getElementById('authSignupOpen');
    const out = document.getElementById('authOut');
    const profile = document.getElementById('authProfile');
    if (!loginOpen || !signupOpen || !out || !profile) return;
    if (user) {
      loginOpen.style.display = 'none';
      signupOpen.style.display = 'none';
      out.style.display = 'inline-flex';
      profile.style.display = 'inline-flex';
    } else {
      loginOpen.style.display = 'inline-flex';
      signupOpen.style.display = 'inline-flex';
      out.style.display = 'none';
      profile.style.display = 'none';
    }
  }

  async function init(){
    injectControls();
    injectModal();

    const { data } = await client.auth.getSession();
    const user = data && data.session ? data.session.user : null;
    updateControls(user);
    notify(user);

    client.auth.onAuthStateChange(function(event, session){
      const user = session ? session.user : null;
      updateControls(user);
      notify(user);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
