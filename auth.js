/* ============================================================
   PhoneCorp Solutions — auth.js
   Modal compartido de Login / Registro
   Incluir en index.html y postventa.html con:
   <script src="auth.js"></script>
   ============================================================ */

(function () {

    // ── ESTADO DE SESIÓN ──
    let authUser = null;
    try {
        const saved = sessionStorage.getItem('pc_auth_user');
        if (saved) authUser = JSON.parse(saved);
    } catch(e) {}

    // ── INYECTAR HTML DEL MODAL ──
    const modalHTML = `
    <div id="auth-overlay" onclick="authCloseOnOverlay(event)"></div>
    <div id="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">

        <!-- Header -->
        <div id="auth-modal-header">
            <div id="auth-modal-logo">PhoneCorp</div>
            <button id="auth-modal-close" onclick="closeAuthModal()" aria-label="Cerrar">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
            </button>
        </div>

        <!-- Tabs -->
        <div id="auth-tabs">
            <button class="auth-tab active" id="auth-tab-login" onclick="authSwitchTab('login')">Iniciar Sesión</button>
            <button class="auth-tab" id="auth-tab-register" onclick="authSwitchTab('register')">Crear Cuenta</button>
            <div id="auth-tab-indicator"></div>
        </div>

        <!-- ── PANEL LOGIN ── -->
        <div id="auth-panel-login" class="auth-panel">
            <p class="auth-subtitle">Bienvenido de nuevo</p>

            <div class="auth-field">
                <label>Correo electrónico</label>
                <input type="email" id="auth-login-email" placeholder="juan@email.com" autocomplete="email">
            </div>
            <div class="auth-field">
                <label>Contraseña</label>
                <div class="auth-pass-wrap">
                    <input type="password" id="auth-login-pass" placeholder="••••••••" autocomplete="current-password">
                    <button class="auth-toggle-pass" onclick="authTogglePass('auth-login-pass', this)" tabindex="-1">
                        <svg class="eye-show" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                        <svg class="eye-hide" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            style="display:none">
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div id="auth-login-error" class="auth-error" style="display:none;"></div>

            <button class="auth-btn-primary" onclick="authDoLogin()">
                <span>Iniciar Sesión</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
            </button>

            <p class="auth-switch-text">
                ¿No tienes cuenta?
                <button onclick="authSwitchTab('register')">Crear una ahora</button>
            </p>
        </div>

        <!-- ── PANEL REGISTRO ── -->
        <div id="auth-panel-register" class="auth-panel" style="display:none;">
            <p class="auth-subtitle">Crea tu cuenta gratis</p>

            <div class="auth-form-row">
                <div class="auth-field">
                    <label>Nombres</label>
                    <input type="text" id="auth-reg-nombres" placeholder="Juan Carlos" autocomplete="given-name">
                </div>
                <div class="auth-field">
                    <label>Apellidos</label>
                    <input type="text" id="auth-reg-apellidos" placeholder="García López" autocomplete="family-name">
                </div>
            </div>
            <div class="auth-field">
                <label>Correo electrónico</label>
                <input type="email" id="auth-reg-email" placeholder="juan@email.com" autocomplete="email">
            </div>
            <div class="auth-field">
                <label>Contraseña</label>
                <div class="auth-pass-wrap">
                    <input type="password" id="auth-reg-pass" placeholder="Mínimo 8 caracteres"
                        autocomplete="new-password" oninput="authCheckPassStrength(this.value)">
                    <button class="auth-toggle-pass" onclick="authTogglePass('auth-reg-pass', this)" tabindex="-1">
                        <svg class="eye-show" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                        <svg class="eye-hide" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            style="display:none">
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>
                        </svg>
                    </button>
                </div>
                <div id="auth-pass-strength" class="auth-pass-strength" style="display:none;">
                    <div id="auth-pass-bar"><div id="auth-pass-fill"></div></div>
                    <span id="auth-pass-label"></span>
                </div>
            </div>
            <div class="auth-field">
                <label>Confirmar Contraseña</label>
                <div class="auth-pass-wrap">
                    <input type="password" id="auth-reg-pass2" placeholder="Repite tu contraseña" autocomplete="new-password">
                    <button class="auth-toggle-pass" onclick="authTogglePass('auth-reg-pass2', this)" tabindex="-1">
                        <svg class="eye-show" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                        <svg class="eye-hide" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            style="display:none">
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div id="auth-reg-error" class="auth-error" style="display:none;"></div>

            <button class="auth-btn-primary" onclick="authDoRegister()">
                <span>Crear Cuenta</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
            </button>

            <p class="auth-switch-text">
                ¿Ya tienes cuenta?
                <button onclick="authSwitchTab('login')">Inicia sesión</button>
            </p>
        </div>

        <!-- ── PANEL SESIÓN ACTIVA ── -->
        <div id="auth-panel-loggedin" class="auth-panel" style="display:none;">
            <div id="auth-user-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
            </div>
            <p id="auth-user-greeting" class="auth-user-greeting"></p>
            <p id="auth-user-email-label" class="auth-user-email-label"></p>

            <div class="auth-user-actions">
                <a href="postventa.html" class="auth-action-link" onclick="closeAuthModal()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    Mis pedidos
                </a>
                <a href="postventa.html" class="auth-action-link" onclick="closeAuthModal()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Soporte / Postventa
                </a>
            </div>

            <button class="auth-btn-logout" onclick="authDoLogout()">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Cerrar Sesión
            </button>
        </div>

    </div>`;

    // ── INYECTAR CSS ──
    const css = `
    #auth-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.85);
        backdrop-filter: blur(6px);
        z-index: 10000;
    }
    #auth-overlay.open { display: block; }

    #auth-modal {
        display: block;
        visibility: hidden;
        pointer-events: none;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -48%) scale(0.97);
        width: min(440px, 94vw);
        background: #0e0e0e;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 18px;
        z-index: 10001;
        opacity: 0;
        transition: transform 0.25s cubic-bezier(.4,0,.2,1), opacity 0.25s ease;
        box-shadow: 0 32px 80px rgba(0,0,0,0.8);
    }
    #auth-modal.open {
        visibility: visible;
        pointer-events: auto;
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }

    #auth-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.2rem 1.5rem 0;
    }
    #auth-modal-logo {
        font-family: 'Archivo', sans-serif;
        font-size: 1rem;
        font-weight: 900;
        letter-spacing: -0.03em;
        color: #fff;
    }
    #auth-modal-close {
        background: none;
        border: none;
        color: #555;
        cursor: pointer;
        padding: 6px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s, background 0.2s;
    }
    #auth-modal-close:hover { color: #fff; background: rgba(255,255,255,0.06); }

    #auth-tabs {
        display: flex;
        position: relative;
        padding: 1rem 1.5rem 0;
        gap: 0;
        border-bottom: 1px solid rgba(255,255,255,0.07);
        margin-top: 0.8rem;
    }
    .auth-tab {
        flex: 1;
        background: none;
        border: none;
        color: #555;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.88rem;
        font-weight: 600;
        padding: 0.6rem 0;
        cursor: pointer;
        transition: color 0.2s;
        position: relative;
        z-index: 1;
    }
    .auth-tab.active { color: #fff; }
    #auth-tab-indicator {
        position: absolute;
        bottom: -1px;
        left: 1.5rem;
        width: calc(50% - 1.5rem);
        height: 2px;
        background: #fff;
        border-radius: 2px 2px 0 0;
        transition: transform 0.25s cubic-bezier(.4,0,.2,1);
    }
    #auth-tab-indicator.right {
        transform: translateX(100%);
    }

    .auth-panel {
        padding: 1.5rem;
    }
    .auth-subtitle {
        font-size: 0.85rem;
        color: #666;
        margin-bottom: 1.4rem;
        font-family: 'DM Sans', sans-serif;
    }
    .auth-form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.8rem;
    }
    .auth-field {
        display: flex;
        flex-direction: column;
        gap: 5px;
        margin-bottom: 1rem;
    }
    .auth-field label {
        font-size: 0.72rem;
        font-weight: 700;
        color: #666;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        font-family: 'DM Sans', sans-serif;
    }
    .auth-field input {
        background: #161616;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 8px;
        padding: 0.65rem 0.85rem;
        color: #fff;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.88rem;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
        width: 100%;
        box-sizing: border-box;
    }
    .auth-field input:focus {
        border-color: rgba(255,255,255,0.28);
        box-shadow: 0 0 0 3px rgba(255,255,255,0.04);
    }
    .auth-pass-wrap {
        position: relative;
    }
    .auth-pass-wrap input { padding-right: 2.8rem; }
    .auth-toggle-pass {
        position: absolute;
        right: 0.7rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #555;
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 4px;
        transition: color 0.2s;
    }
    .auth-toggle-pass:hover { color: #aaa; }

    .auth-pass-strength {
        margin-top: 6px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    #auth-pass-bar {
        flex: 1;
        height: 3px;
        background: rgba(255,255,255,0.08);
        border-radius: 2px;
        overflow: hidden;
    }
    #auth-pass-fill {
        height: 100%;
        border-radius: 2px;
        width: 0%;
        transition: width 0.3s, background 0.3s;
    }
    #auth-pass-label {
        font-size: 0.72rem;
        color: #555;
        font-family: 'DM Sans', sans-serif;
        white-space: nowrap;
    }

    .auth-error {
        background: rgba(248,113,113,0.08);
        border: 1px solid rgba(248,113,113,0.25);
        border-radius: 8px;
        padding: 0.6rem 0.9rem;
        font-size: 0.82rem;
        color: #f87171;
        margin-bottom: 1rem;
        font-family: 'DM Sans', sans-serif;
    }
    .auth-btn-primary {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 0.75rem 1rem;
        background: #fff;
        color: #000;
        border: none;
        border-radius: 9px;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.9rem;
        font-weight: 700;
        cursor: pointer;
        transition: opacity 0.2s, transform 0.15s;
        margin-bottom: 1.1rem;
    }
    .auth-btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
    .auth-btn-primary:active { transform: translateY(0); }

    .auth-switch-text {
        text-align: center;
        font-size: 0.82rem;
        color: #555;
        font-family: 'DM Sans', sans-serif;
        padding-bottom: 0.3rem;
    }
    .auth-switch-text button {
        background: none;
        border: none;
        color: #aaa;
        font-size: 0.82rem;
        font-family: 'DM Sans', sans-serif;
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 2px;
        transition: color 0.2s;
    }
    .auth-switch-text button:hover { color: #fff; }

    /* ── Panel sesión activa ── */
    #auth-user-avatar {
        width: 64px;
        height: 64px;
        background: #1a1a1a;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        margin: 0 auto 1rem;
    }
    .auth-user-greeting {
        font-family: 'Archivo', sans-serif;
        font-size: 1.1rem;
        font-weight: 700;
        color: #fff;
        text-align: center;
        margin-bottom: 4px;
    }
    .auth-user-email-label {
        font-size: 0.82rem;
        color: #555;
        text-align: center;
        margin-bottom: 1.4rem;
        font-family: 'DM Sans', sans-serif;
    }
    .auth-user-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1.2rem;
    }
    .auth-action-link {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 0.75rem 1rem;
        background: #161616;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 9px;
        color: #aaa;
        text-decoration: none;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.88rem;
        font-weight: 500;
        transition: border-color 0.2s, color 0.2s, background 0.2s;
    }
    .auth-action-link:hover {
        border-color: rgba(255,255,255,0.2);
        color: #fff;
        background: #1e1e1e;
    }
    .auth-btn-logout {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 0.7rem 1rem;
        background: transparent;
        color: #666;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 9px;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
        transition: color 0.2s, border-color 0.2s;
    }
    .auth-btn-logout:hover { color: #f87171; border-color: rgba(248,113,113,0.3); }

    @media (max-width: 480px) {
        #auth-modal { border-radius: 14px 14px 0 0; top: auto; bottom: 0; transform: translate(-50%, 0) scale(1); left: 50%; }
        #auth-modal.open { transform: translate(-50%, 0) scale(1); }
        .auth-form-row { grid-template-columns: 1fr; }
    }
    `;

    // Esperar a que el DOM esté listo antes de inyectar
    function inject() {
        // Estilos
        const style = document.createElement('style');
        style.id = 'auth-styles';
        style.textContent = css;
        document.head.appendChild(style);

        // HTML
        const wrapper = document.createElement('div');
        wrapper.id = 'auth-root';
        wrapper.innerHTML = modalHTML;
        document.body.appendChild(wrapper);

        // Actualizar botones "Mi Cuenta" para que abran el modal
        document.querySelectorAll('.btn.btn-primary, .btn-primary').forEach(btn => {
            if (btn.textContent.trim() === 'Mi Cuenta') {
                btn.addEventListener('click', openAuthModal);
            }
        });

        // Actualizar UI según sesión existente
        authUpdateAccountButtons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
    } else {
        inject();
    }

    // ── FUNCIONES PÚBLICAS ──

    window.openAuthModal = function(tab) {
        if (authUser) {
            authShowPanel('loggedin');
            document.getElementById('auth-tabs').style.display = 'none';
            const greet = document.getElementById('auth-user-greeting');
            const emailLabel = document.getElementById('auth-user-email-label');
            if (greet) greet.textContent = '¡Hola, ' + authUser.nombres + '!';
            if (emailLabel) emailLabel.textContent = authUser.email;
        } else {
            document.getElementById('auth-tabs').style.display = 'flex';
            authSwitchTab(tab || 'login');
        }
        document.getElementById('auth-overlay').classList.add('open');
        const modal = document.getElementById('auth-modal');
        // Hacer visible temporalmente sin transición para medir altura real
        modal.style.transition = 'none';
        modal.style.visibility = 'visible';
        modal.getBoundingClientRect(); // fuerza reflow con contenido real
        modal.style.visibility = '';
        modal.style.transition = '';
        // Ahora sí añadir la clase con animación correcta
        requestAnimationFrame(() => modal.classList.add('open'));
        document.body.style.overflow = 'hidden';
    };

    window.closeAuthModal = function() {
        const modal = document.getElementById('auth-modal');
        const overlay = document.getElementById('auth-overlay');
        modal.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    };

    window.authCloseOnOverlay = function(e) {
        if (e.target.id === 'auth-overlay') closeAuthModal();
    };

    window.authSwitchTab = function(tab) {
        document.getElementById('auth-tab-login').classList.toggle('active', tab === 'login');
        document.getElementById('auth-tab-register').classList.toggle('active', tab === 'register');
        document.getElementById('auth-tab-indicator').classList.toggle('right', tab === 'register');
        authShowPanel(tab);
        // Limpiar errores al cambiar de tab
        ['auth-login-error','auth-reg-error'].forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.style.display = 'none'; el.textContent = ''; }
        });
    };

    function authShowPanel(name) {
        ['login','register','loggedin'].forEach(p => {
            const el = document.getElementById('auth-panel-' + p);
            if (el) el.style.display = p === name ? 'block' : 'none';
        });
    }

    window.authTogglePass = function(inputId, btn) {
        const input = document.getElementById(inputId);
        const isText = input.type === 'text';
        input.type = isText ? 'password' : 'text';
        btn.querySelector('.eye-show').style.display = isText ? 'block' : 'none';
        btn.querySelector('.eye-hide').style.display = isText ? 'none' : 'block';
    };

    window.authCheckPassStrength = function(val) {
        const wrap = document.getElementById('auth-pass-strength');
        const fill = document.getElementById('auth-pass-fill');
        const label = document.getElementById('auth-pass-label');
        if (!val) { wrap.style.display = 'none'; return; }
        wrap.style.display = 'flex';
        let score = 0;
        if (val.length >= 8)  score++;
        if (val.length >= 12) score++;
        if (/[A-Z]/.test(val)) score++;
        if (/[0-9]/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;
        const levels = [
            { w:'20%', bg:'#ef4444', txt:'Muy débil' },
            { w:'40%', bg:'#f97316', txt:'Débil' },
            { w:'60%', bg:'#eab308', txt:'Regular' },
            { w:'80%', bg:'#84cc16', txt:'Buena' },
            { w:'100%',bg:'#22c55e', txt:'Muy segura' },
        ];
        const lv = levels[Math.min(score, 4)];
        fill.style.width = lv.w;
        fill.style.background = lv.bg;
        label.textContent = lv.txt;
        label.style.color = lv.bg;
    };

    window.authDoLogin = function() {
        const email = document.getElementById('auth-login-email').value.trim();
        const pass  = document.getElementById('auth-login-pass').value;
        const errEl = document.getElementById('auth-login-error');

        if (!email || !pass) {
            authShowError(errEl, 'Completa todos los campos.'); return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            authShowError(errEl, 'Ingresa un correo válido.'); return;
        }

        // Verificar contra usuarios registrados en sessionStorage
        const users = JSON.parse(sessionStorage.getItem('pc_users') || '[]');
        const found = users.find(u => u.email === email && u.pass === pass);
        if (!found) {
            authShowError(errEl, 'Correo o contraseña incorrectos.'); return;
        }

        authSetSession(found);
        authShowSuccessAndClose('¡Bienvenido de nuevo, ' + found.nombres + '!');
    };

    window.authDoRegister = function() {
        const nombres   = document.getElementById('auth-reg-nombres').value.trim();
        const apellidos = document.getElementById('auth-reg-apellidos').value.trim();
        const email     = document.getElementById('auth-reg-email').value.trim();
        const pass      = document.getElementById('auth-reg-pass').value;
        const pass2     = document.getElementById('auth-reg-pass2').value;
        const errEl     = document.getElementById('auth-reg-error');

        if (!nombres || !apellidos || !email || !pass || !pass2) {
            authShowError(errEl, 'Completa todos los campos.'); return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            authShowError(errEl, 'Ingresa un correo válido.'); return;
        }
        if (pass.length < 8) {
            authShowError(errEl, 'La contraseña debe tener al menos 8 caracteres.'); return;
        }
        if (pass !== pass2) {
            authShowError(errEl, 'Las contraseñas no coinciden.'); return;
        }

        const users = JSON.parse(sessionStorage.getItem('pc_users') || '[]');
        if (users.find(u => u.email === email)) {
            authShowError(errEl, 'Ya existe una cuenta con ese correo.'); return;
        }

        const newUser = { nombres, apellidos, email, pass };
        users.push(newUser);
        sessionStorage.setItem('pc_users', JSON.stringify(users));

        authSetSession(newUser);
        authShowSuccessAndClose('¡Cuenta creada! Bienvenido, ' + nombres + '.');
    };

    window.authDoLogout = function() {
        authUser = null;
        sessionStorage.removeItem('pc_auth_user');
        authUpdateAccountButtons();
        closeAuthModal();
    };

    function authSetSession(user) {
        authUser = user;
        sessionStorage.setItem('pc_auth_user', JSON.stringify(user));
        authUpdateAccountButtons();
    }

    function authShowError(el, msg) {
        el.textContent = msg;
        el.style.display = 'block';
        el.style.animation = 'none';
        requestAnimationFrame(() => { el.style.animation = 'authShake 0.3s ease'; });
    }

    function authShowSuccessAndClose(msg) {
        closeAuthModal();
        // Toast de éxito
        const toast = document.createElement('div');
        toast.style.cssText = `
            position:fixed; bottom:2rem; left:50%; transform:translateX(-50%) translateY(20px);
            background:#161616; border:1px solid rgba(34,197,94,0.4); border-radius:10px;
            padding:0.75rem 1.4rem; color:#fff; font-family:'DM Sans',sans-serif; font-size:0.88rem;
            font-weight:500; z-index:99999; display:flex; align-items:center; gap:9px;
            box-shadow:0 8px 32px rgba(0,0,0,0.6); opacity:0;
            transition:opacity 0.3s ease, transform 0.3s ease;
        `;
        toast.innerHTML = `<span style="color:#22c55e;">✓</span> ${msg}`;
        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.style.opacity = '1';
                toast.style.transform = 'translateX(-50%) translateY(0)';
            });
        });
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(10px)';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    function authUpdateAccountButtons() {
        document.querySelectorAll('.btn.btn-primary, .btn-primary').forEach(btn => {
            if (btn.textContent.trim() === 'Mi Cuenta' ||
                btn.textContent.trim().startsWith('Mi Cuenta') ||
                btn.textContent.trim().startsWith('👤')) {
                if (authUser) {
                    btn.textContent = '👤 ' + authUser.nombres;
                } else {
                    btn.textContent = 'Mi Cuenta';
                }
            }
        });
    }

    // Shake keyframe
    const shakeStyle = document.createElement('style');
    shakeStyle.textContent = `@keyframes authShake {
        0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 60%{transform:translateX(6px)}
    }`;
    document.head.appendChild(shakeStyle);

    // Cerrar con Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('auth-modal');
            if (modal && modal.classList.contains('open')) closeAuthModal();
        }
    });

})();