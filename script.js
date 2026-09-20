/* ==========================================================================
   BULUWY ACADEMY · Masterclass de Lógica de Programação
   script.js

   Índice
   1. CONFIGURAÇÃO  ← o único bloco que precisas de editar
   2. Utilitários
   3. Navegação mobile
   4. Editor Visualg (demonstração animada do hero)
   5. Contagem decrescente
   6. FAQ (accordion)
   7. CTA fixo (mobile)
   8. Ligações de WhatsApp
   9. Formulário de inscrição
   10. Arranque

   Regra do projecto: o CONTEÚDO (textos, mensagens de erro) vive no HTML.
   Aqui ficam apenas a configuração e o comportamento.
   ========================================================================== */
'use strict';


/* ==========================================================================
   1. CONFIGURAÇÃO
   ========================================================================== */
const CONFIG = {

  /* --------------------------------------------------------------
     REGISTRATION_ENDPOINT
     URL do backend que vai receber as inscrições (método POST, JSON).
     Enquanto estiver vazio, o formulário NÃO envia dados a lado nenhum
     (ver "modos de envio" mais abaixo).

     Corpo enviado (JSON):
       {
         event:       "masterclass-logica-programacao-2026-09-30",
         fullName:    "…",
         whatsapp:    "+258…",
         email:       "…",
         hasComputer: "sim" | "nao",
         source:      "Instagram" | "WhatsApp" | "Amigo ou colega" | "Outro" | "",
         submittedAt: "2026-09-19T10:00:00.000Z",
         page:        "https://…"
       }
     A resposta deve ter status 2xx para a página mostrar sucesso.
     -------------------------------------------------------------- */
  REGISTRATION_ENDPOINT: '',

  /* Número oficial de WhatsApp, só dígitos com indicativo (ex.: '258XXXXXXXXX').
     Quando preenchido:
       - o contacto aparece na secção "Fala connosco";
       - se REGISTRATION_ENDPOINT estiver vazio, o formulário abre o WhatsApp
         com os dados já escritos (alternativa temporária, sem backend). */
  WHATSAPP_NUMBER: '',

  /* Início da masterclass (14:00, hora de Maputo = UTC+2). Usado na contagem decrescente. */
  EVENT_START: '2026-09-30T14:00:00+02:00',

  /* Identificador do evento enviado ao backend */
  EVENT_ID: 'masterclass-logica-programacao-2026-09-30',

  /* Tempo máximo de espera pelo backend (ms) */
  REQUEST_TIMEOUT_MS: 15000,

  /* Texto pré-preenchido na mensagem de WhatsApp */
  WHATSAPP_INTRO: 'Olá! Quero reservar a minha vaga na Masterclass de Lógica de Programação (30 de Setembro de 2026).'
};


/* ==========================================================================
   2. UTILITÁRIOS
   ========================================================================== */
const $  = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Só dígitos do número de WhatsApp configurado. */
const whatsappDigits = () => String(CONFIG.WHATSAPP_NUMBER || '').replace(/\D/g, '');


/* ==========================================================================
   3. NAVEGAÇÃO MOBILE
   ========================================================================== */
function initNav() {
  const toggle = $('.nav-toggle');
  const nav = $('#primary-nav');
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('is-open', open);
  };
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  toggle.addEventListener('click', () => setOpen(!isOpen()));

  // Fecha ao escolher uma ligação
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  // Fecha com Escape (devolve o foco ao botão)
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Fecha ao clicar fora
  document.addEventListener('click', (event) => {
    if (isOpen() && !nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
  });

  // Reinicia o estado quando o ecrã passa a desktop
  window.matchMedia('(min-width: 900px)').addEventListener('change', () => setOpen(false));
}


/* ==========================================================================
   4. EDITOR VISUALG (demonstração animada do hero)
   Sequência: linhas de código aparecem → o programa "executa" → resultado.
   O botão "Executar" repete a execução.
   ========================================================================== */
function initEditorDemo() {
  const editor = $('#editor');
  const runBtn = $('#runBtn');
  if (!editor || !runBtn) return;

  const codeLines = $$('.line', editor);
  const consoleLines = $$('.console-line', editor);
  const typedEl = $('.typed', editor);
  const typedText = typedEl ? typedEl.textContent : '';

  const showEverything = () => {
    codeLines.forEach((line) => line.classList.add('is-shown'));
    consoleLines.forEach((line) => line.classList.add('is-shown'));
    if (typedEl) typedEl.textContent = typedText;
    runBtn.textContent = 'Executar novamente';
  };

  // Movimento reduzido: mostra tudo já, sem animação
  if (prefersReducedMotion) {
    showEverything();
    runBtn.addEventListener('click', showEverything);
    return;
  }

  let runId = 0;

  async function run() {
    const myRun = ++runId;
    runBtn.disabled = true;
    runBtn.textContent = 'A executar…';
    consoleLines.forEach((line) => line.classList.remove('is-shown'));
    if (typedEl) typedEl.textContent = '';

    await sleep(350);
    if (myRun !== runId) return;

    // Linha 1 da consola (pergunta)
    consoleLines[0].classList.add('is-shown');
    await sleep(600);

    // O utilizador "escreve" o nome
    for (const char of typedText) {
      if (myRun !== runId) return;
      typedEl.textContent += char;
      await sleep(150);
    }

    await sleep(350);
    consoleLines[1].classList.add('is-shown'); // resultado

    runBtn.disabled = false;
    runBtn.textContent = 'Executar novamente';
  }

  async function playIntro() {
    await sleep(500);
    for (const line of codeLines) {
      line.classList.add('is-shown');
      await sleep(130);
    }
    await sleep(400);
    await run();
  }

  runBtn.addEventListener('click', () => {
    if (!runBtn.disabled) run();
  });

  // Se a animação falhar a meio, mostra tudo em vez de deixar o código escondido
  playIntro().catch((error) => {
    console.error('[Buluwy] Animação do editor falhou:', error);
    showEverything();
    runBtn.disabled = false;
  });
}


/* ==========================================================================
   5. CONTAGEM DECRESCENTE (dados reais: data e hora do evento)
   Fica escondida se a data for inválida ou já tiver passado.
   ========================================================================== */
function initCountdown() {
  const box = $('#countdown');
  if (!box) return;

  const target = new Date(CONFIG.EVENT_START).getTime();
  if (Number.isNaN(target)) return;

  const daysEl = $('[data-cd="days"]', box);
  const daysLabelEl = $('[data-cd="days-label"]', box);
  const hoursEl = $('[data-cd="hours"]', box);
  const minutesEl = $('[data-cd="minutes"]', box);
  const pad = (n) => String(n).padStart(2, '0');
  let timerId = null;

  const tick = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      box.hidden = true;
      if (timerId) clearInterval(timerId);
      return;
    }
    const totalMinutes = Math.floor(diff / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    daysEl.textContent = String(days);
    daysLabelEl.textContent = days === 1 ? 'dia' : 'dias';
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    box.hidden = false;
  };

  tick();
  timerId = setInterval(tick, 30000);
}


/* ==========================================================================
   6. FAQ (accordion: abre um de cada vez)
   ========================================================================== */
function initFaq() {
  const buttons = $$('.faq-q');
  if (!buttons.length) return;

  const setOpen = (button, open) => {
    button.setAttribute('aria-expanded', String(open));
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    if (panel) panel.classList.toggle('is-open', open);
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const wasOpen = button.getAttribute('aria-expanded') === 'true';
      buttons.forEach((other) => setOpen(other, false));
      if (!wasOpen) setOpen(button, true);
    });
  });
}


/* ==========================================================================
   7. CTA FIXO (mobile)
   Visível depois do hero e escondido enquanto o formulário está no ecrã.
   ========================================================================== */
function initStickyCta() {
  const bar = $('#stickyCta');
  const heroActions = $('#heroActions');
  const form = $('#inscricao');
  if (!bar || !heroActions || !form || !('IntersectionObserver' in window)) return;

  let heroVisible = true;
  let formVisible = false;
  const update = () => bar.classList.toggle('is-visible', !heroVisible && !formVisible);

  new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; update(); })
    .observe(heroActions);
  new IntersectionObserver(([entry]) => { formVisible = entry.isIntersecting; update(); }, { threshold: 0.1 })
    .observe(form);
}


/* ==========================================================================
   8. LIGAÇÕES DE WHATSAPP
   Preenche o contacto quando CONFIG.WHATSAPP_NUMBER está definido.
   ========================================================================== */
function initWhatsappLinks() {
  const digits = whatsappDigits();
  if (!digits) return;

  $$('[data-whatsapp-link]').forEach((link) => {
    link.href = `https://wa.me/${digits}`;
    link.target = '_blank';
    link.rel = 'noopener';
    link.removeAttribute('aria-disabled');
  });
  $$('[data-whatsapp-text]').forEach((el) => { el.textContent = `+${digits}`; });
}


/* ==========================================================================
   9. FORMULÁRIO DE INSCRIÇÃO

   Modos de envio (escolhidos automaticamente pela configuração):
     A) REGISTRATION_ENDPOINT definido  → POST JSON para o backend.
     B) só WHATSAPP_NUMBER definido     → abre o WhatsApp com os dados.
     C) nada definido                   → pré-visualização: avisa que
                                          nenhum dado foi enviado.
   Nunca mostramos "sucesso" quando os dados não foram enviados a lado nenhum.
   ========================================================================== */
function initRegistrationForm() {
  const form = $('#registrationForm');
  if (!form) return;

  const statusBox = $('#formStatus');
  const successBox = $('#formSuccess');
  const submitBtn = $('#submitBtn');

  /* ---------- Validação ---------- */
  const validators = {
    fullName(value) {
      const clean = value.trim().replace(/\s+/g, ' ');
      if (!clean) return 'required';
      if (clean.length < 5 || clean.split(' ').length < 2) return 'invalid';
      return '';
    },
    whatsapp(value) {
      const compact = value.replace(/[\s().\-]/g, '');
      if (!compact) return 'required';
      if (!/^\+?\d{8,15}$/.test(compact)) return 'invalid';
      return '';
    },
    email(value) {
      const clean = value.trim();
      if (!clean) return 'required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)) return 'invalid';
      return '';
    },
    hasComputer() {
      return form.elements.hasComputer.value ? '' : 'required';
    }
  };

  const fieldValue = (name) => {
    const el = form.elements[name];
    return el && typeof el.value === 'string' ? el.value : '';
  };

  /** Mostra ou limpa o erro de um campo. Mensagens vêm dos data-msg-* do HTML. */
  function setFieldError(name, code) {
    const wrapper = $(`[data-field="${name}"]`, form);
    const errorEl = $(`#err-${name}`, form);
    const controls = $$(`[name="${name}"]`, form);
    if (!wrapper || !errorEl) return;

    let message = '';
    if (code) {
      const source = name === 'hasComputer' ? errorEl : $(`[name="${name}"]`, form);
      message = source.getAttribute(`data-msg-${code}`) || source.getAttribute('data-msg-required') || '';
    }

    errorEl.textContent = message;
    wrapper.classList.toggle('has-error', Boolean(code));
    controls.forEach((control) => {
      if (code) control.setAttribute('aria-invalid', 'true');
      else control.removeAttribute('aria-invalid');
    });
  }

  function validateField(name) {
    const code = validators[name](fieldValue(name));
    setFieldError(name, code);
    return code;
  }

  /** Valida tudo. Devolve o nome do primeiro campo inválido (ou null). */
  function validateAll() {
    let firstInvalid = null;
    Object.keys(validators).forEach((name) => {
      if (validateField(name) && !firstInvalid) firstInvalid = name;
    });
    return firstInvalid;
  }

  // Valida ao sair do campo; limpa o erro assim que a pessoa corrige
  Object.keys(validators).forEach((name) => {
    $$(`[name="${name}"]`, form).forEach((control) => {
      if (control.type !== 'radio') control.addEventListener('blur', () => validateField(name));
      control.addEventListener('input', () => {
        if ($(`[data-field="${name}"]`, form).classList.contains('has-error')) validateField(name);
      });
      control.addEventListener('change', () => {
        if ($(`[data-field="${name}"]`, form).classList.contains('has-error')) validateField(name);
      });
    });
  });

  /* ---------- Estado visual ---------- */
  function showStatus(type, message) {
    statusBox.textContent = message;
    statusBox.dataset.type = type;
    statusBox.hidden = false;
  }
  function clearStatus() {
    statusBox.hidden = true;
    statusBox.textContent = '';
    delete statusBox.dataset.type;
  }
  function setLoading(loading) {
    submitBtn.disabled = loading;
    submitBtn.classList.toggle('is-loading', loading);
    submitBtn.setAttribute('aria-busy', String(loading));
  }
  function showSuccess(mode, firstName) {
    $$('[data-mode]', successBox).forEach((block) => { block.hidden = block.dataset.mode !== mode; });
    $$('[data-fill="firstName"]', successBox).forEach((el) => { el.textContent = firstName; });
    form.hidden = true;
    successBox.hidden = false;
    successBox.focus();
  }

  /* ---------- Dados ---------- */
  function collectData() {
    return {
      event: CONFIG.EVENT_ID,
      fullName: fieldValue('fullName').trim().replace(/\s+/g, ' '),
      whatsapp: fieldValue('whatsapp').trim(),
      email: fieldValue('email').trim(),
      hasComputer: fieldValue('hasComputer'),
      source: fieldValue('source'),
      submittedAt: new Date().toISOString(),
      page: window.location.href
    };
  }

  function buildWhatsappUrl(data) {
    const lines = [
      CONFIG.WHATSAPP_INTRO,
      '',
      `Nome: ${data.fullName}`,
      `WhatsApp: ${data.whatsapp}`,
      `Email: ${data.email}`,
      `Tenho computador: ${data.hasComputer === 'sim' ? 'Sim' : 'Não'}`
    ];
    if (data.source) lines.push(`Como conheci a Masterclass: ${data.source}`);
    return `https://wa.me/${whatsappDigits()}?text=${encodeURIComponent(lines.join('\n'))}`;
  }

  async function sendToEndpoint(data) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(CONFIG.REGISTRATION_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } finally {
      clearTimeout(timeout);
    }
  }

  /* ---------- Submissão ---------- */
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearStatus();

    const firstInvalid = validateAll();
    if (firstInvalid) {
      showStatus('error', form.dataset.msgInvalid);
      const target = $(`[name="${firstInvalid}"]`, form);
      if (target) target.focus();
      return;
    }

    const data = collectData();
    const firstName = data.fullName.split(' ')[0];

    // Anti-spam: se o campo-armadilha vier preenchido, não envia nada
    if (fieldValue('website')) return;

    /* Modo A: backend */
    if (CONFIG.REGISTRATION_ENDPOINT) {
      setLoading(true);
      try {
        await sendToEndpoint(data);
        showSuccess('endpoint', firstName);
      } catch (error) {
        console.error('[Buluwy] Falha ao enviar a inscrição:', error);
        showStatus('error', form.dataset.msgNetwork);
      } finally {
        setLoading(false);
      }
      return;
    }

    /* Modo B: WhatsApp (window.open tem de acontecer de imediato, antes de qualquer await) */
    if (whatsappDigits()) {
      const url = buildWhatsappUrl(data);
      window.open(url, '_blank', 'noopener');
      const reopen = $('[data-whatsapp-open]', successBox);
      if (reopen) reopen.href = url;
      showSuccess('whatsapp', firstName);
      return;
    }

    /* Modo C: pré-visualização (nada configurado) */
    console.warn('[Buluwy] Formulário sem integração. Define CONFIG.REGISTRATION_ENDPOINT (ou CONFIG.WHATSAPP_NUMBER) em script.js.', data);
    showStatus('preview', form.dataset.msgPreview);
  });
}


/* ==========================================================================
   10. ARRANQUE
   Cada módulo corre isolado: se um falhar, os outros continuam a funcionar.
   ========================================================================== */
function safeInit(name, fn) {
  try {
    fn();
  } catch (error) {
    console.error(`[Buluwy] Erro em "${name}":`, error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  safeInit('navegação', initNav);
  safeInit('editor', initEditorDemo);
  safeInit('contagem', initCountdown);
  safeInit('faq', initFaq);
  safeInit('cta fixo', initStickyCta);
  safeInit('whatsapp', initWhatsappLinks);
  safeInit('formulário', initRegistrationForm);
});
