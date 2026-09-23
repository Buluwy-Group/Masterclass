/* ==========================================================================
   BULUWY ACADEMY · Masterclass de Lógica de Programação
   script.js

   Índice
   1. CONFIGURAÇÃO  ← o único bloco que precisas de editar
   2. Utilitários
   3. Navegação mobile
   4. Editor Visualg (interativo e offline)
   5. Contagem decrescente
   6. FAQ (accordion)
   7. CTA fixo (mobile)
   8. Ligações de WhatsApp
   9. Arranque

   Regra do projecto: o CONTEÚDO (textos, mensagens de erro) vive no HTML.
   Aqui ficam apenas a configuração e o comportamento.
   ========================================================================== */
'use strict';


/* ==========================================================================
   1. CONFIGURAÇÃO
   ========================================================================== */
const CONFIG = {

  /* Mensagem pré-escrita que abre no WhatsApp (o link e o número estão no index.html,
     nos elementos com data-whatsapp-link). Deixa vazio ('') para abrir a conversa sem texto. */
  WHATSAPP_MESSAGE: 'Olá! Quero mais detalhes sobre a Masterclass de Lógica de Programação (3 de Outubro de 2026) e fazer parte do grupo.',

  /* Início da masterclass: sábado, 3 de Outubro de 2026, 10:00 (hora de Maputo = UTC+2). Usado na contagem decrescente. */
  EVENT_START: '2026-10-03T10:00:00+02:00'
};


/* ==========================================================================
   2. UTILITÁRIOS
   ========================================================================== */
const $  = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


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
   4. EDITOR VISUALG (interativo e 100% offline)
   1) as linhas de código aparecem;
   2) a consola pede o nome;
   3) ao executar (Enter ou botão), as linhas escreva → leia → escreval acendem
      uma a uma e a saudação aparece. Nada é enviado nem guardado.
   ========================================================================== */
function initEditorDemo() {
  const editor = $('#editor');
  const form = $('#consoleForm');
  const input = $('#nameInput');
  const output = $('#consoleOut');
  const outputName = output && $('[data-out-name]', output);
  const hint = $('#consoleHint');
  const runBtn = $('#runBtn');
  if (!editor || !form || !input || !output || !outputName || !hint || !runBtn) return;

  const codeLines = $$('.line', editor);
  const stepLines = $$('.line[data-step]', editor);   // escreva, leia, escreval
  const prompt = form;

  // Com JS: ativa o campo, limpa o exemplo estático e esconde o resultado
  input.disabled = false;
  input.value = '';
  runBtn.disabled = false;
  output.hidden = true;

  const showEverything = () => {
    codeLines.forEach((line) => line.classList.add('is-shown'));
    prompt.classList.add('is-shown');
  };

  let running = false;

  async function run() {
    const name = input.value.trim().replace(/\s+/g, ' ');
    if (!name) {
      hint.textContent = 'Escreve o teu nome para executar o programa.';
      input.focus();
      return;
    }
    hint.textContent = '';
    running = true;
    runBtn.disabled = true;
    output.hidden = true;

    // Mostra que linha está a ser executada (saltado com movimento reduzido)
    if (!prefersReducedMotion) {
      for (const line of stepLines) {
        line.classList.add('is-running');
        await sleep(320);
        line.classList.remove('is-running');
      }
    }

    outputName.textContent = name;   // textContent: nunca interpreta HTML
    output.hidden = false;
    running = false;
    runBtn.disabled = false;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!running) run();
  });

  input.addEventListener('input', () => { hint.textContent = ''; });

  async function playIntro() {
    if (prefersReducedMotion) { showEverything(); return; }
    await sleep(500);
    for (const line of codeLines) {
      line.classList.add('is-shown');
      await sleep(130);
    }
    await sleep(250);
    prompt.classList.add('is-shown');
  }

  // Se a animação falhar a meio, mostra tudo em vez de deixar o código escondido
  playIntro().catch((error) => {
    console.error('[Buluwy] Animação do editor falhou:', error);
    showEverything();
    running = false;
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
  const daysPartEl = $('[data-cd="days-part"]', box);
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
    daysPartEl.hidden = days === 0;   // no próprio dia, só horas e minutos
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
   Os links (https://wa.me/…) estão no HTML e funcionam sem JavaScript.
   Aqui só acrescentamos a mensagem pré-escrita: a do próprio link
   (atributo data-whatsapp-message, ex.: presencial ou online) ou, se não
   tiver, a mensagem geral CONFIG.WHATSAPP_MESSAGE.
   ========================================================================== */
function initWhatsappLinks() {
  $$('[data-whatsapp-link]').forEach((link) => {
    const message = link.dataset.whatsappMessage || CONFIG.WHATSAPP_MESSAGE;
    if (!message) return;
    const base = link.href.split('?')[0];
    link.href = `${base}?text=${encodeURIComponent(message)}`;
  });
}


/* ==========================================================================
   9. ARRANQUE
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
});
