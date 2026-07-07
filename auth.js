(function(){
  const SUPABASE_URL = 'https://cnlmfivtdbaokbphxkrn.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_6x82gamZZ4r41eVag9Nmrg_sElZHtHS';

  if (!window.supabase || !window.supabase.createClient) {
    console.warn('Supabase client library did not load.');
    return;
  }

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const listeners = [];
  let currentUser = null;

  window.PatternDeskAuth = {
    supabase: client,
    getUser: async function(){
      const { data } = await client.auth.getUser();
      currentUser = data && data.user ? data.user : null;
      return currentUser;
    },
    onAuthReady: function(fn){ if (typeof fn === 'function') listeners.push(fn); },
    open: function(){ openModal(); },
    signOut: async function(){ await client.auth.signOut(); }
  };

  function notify(user){
    currentUser = user || null;
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
      <button class="auth-btn" id="authOpen" type="button">Log in</button>
      <button class="auth-btn ghost" id="authOut" type="button" style="display:none;">Log out</button>
    `;
    headrow.appendChild(widget);

    document.getElementById('authOpen').addEventListener('click', openModal);
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
        <h2 id="authTitle">Save your progress</h2>
        <p class="auth-copy">Log in or create a free account to keep your quiz history and game results across devices.</p>
        <label>Email</label>
        <input class="auth-input" id="authEmail" type="email" autocomplete="email" placeholder="you@example.com">
        <label>Password</label>
        <input class="auth-input" id="authPassword" type="password" autocomplete="current-password" placeholder="Minimum 6 characters">
        <label>Display name <span class="auth-optional">optional</span></label>
        <input class="auth-input" id="authName" type="text" autocomplete="nickname" placeholder="Your player name">
        <div class="auth-actions">
          <button class="auth-submit" id="authLogin" type="button">Log in</button>
          <button class="auth-submit secondary" id="authSignup" type="button">Create account</button>
        </div>
        <p class="auth-message" id="authMessage"></p>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('authClose').addEventListener('click', closeModal);
    modal.addEventListener('click', function(e){ if (e.target === modal) closeModal(); });
    document.getElementById('authLogin').addEventListener('click', login);
    document.getElementById('authSignup').addEventListener('click', signup);
  }

  function openModal(){
    injectModal();
    const modal = document.getElementById('authModal');
    modal.classList.add('show');
    modal.setAttribute('aria-hidden','false');
    setMessage('');
    setTimeout(function(){ document.getElementById('authEmail').focus(); }, 50);
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

  function formValues(){
    return {
      email: (document.getElementById('authEmail').value || '').trim(),
      password: document.getElementById('authPassword').value || '',
      displayName: (document.getElementById('authName').value || '').trim()
    };
  }

  async function login(){
    const v = formValues();
    if (!v.email || !v.password) return setMessage('Enter your email and password.', true);
    setMessage('Logging in…');
    const { error } = await client.auth.signInWithPassword({ email: v.email, password: v.password });
    if (error) return setMessage(error.message, true);
    setMessage('Logged in. Your progress will now save.');
    setTimeout(closeModal, 700);
  }

  async function signup(){
    const v = formValues();
    if (!v.email || !v.password) return setMessage('Enter your email and password.', true);
    if (v.password.length < 6) return setMessage('Password must be at least 6 characters.', true);
    setMessage('Creating account…');
    const { error } = await client.auth.signUp({
      email: v.email,
      password: v.password,
      options: { data: { display_name: v.displayName || v.email.split('@')[0] } }
    });
    if (error) return setMessage(error.message, true);
    setMessage('Account created. Check your email if confirmation is required, then log in.');
  }

  function updateControls(user){
    const open = document.getElementById('authOpen');
    const out = document.getElementById('authOut');
    const profile = document.getElementById('authProfile');
    if (!open || !out || !profile) return;
    if (user) {
      open.textContent = user.email ? user.email.split('@')[0] : 'Account';
      open.style.display = 'none';
      out.style.display = 'inline-flex';
      profile.style.display = 'inline-flex';
    } else {
      open.textContent = 'Log in';
      open.style.display = 'inline-flex';
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
