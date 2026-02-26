/* ============================================================
   AUTOTECH MÉXICO — JavaScript principal
   Módulos: AOS, Navbar, Hamburger, Filtros de catálogo,
            Contadores animados, Formulario Formspree
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────────────────────
   LOGO LOOP — Adaptación vanilla del componente React LogoLoop
   ─────────────────────────────────────────────────────────────
   Física idéntica al original:
   · Suavizado exponencial con SMOOTH_TAU (easing por deltaTime)
   · Copias dinámicas calculadas con ResizeObserver
   · Detección de carga de imágenes antes de iniciar animación
   · Pausa suave al hover (desaceleración física, no corte brusco)
   · Loop seamless por módulo del ancho de la secuencia
────────────────────────────────────────────────────────────── */
class LogoLoop {
  // Configuración replicada del original React
  static SMOOTH_TAU    = 0.25;  // constante de tiempo del suavizado exponencial
  static MIN_COPIES    = 2;     // mínimo de copias siempre presentes
  static COPY_HEADROOM = 2;     // copias extra sobre las necesarias para llenar

  /**
   * @param {HTMLElement} container  - El div#hero-logo-loop del DOM
   * @param {object}      opts
   * @param {Array}       opts.logos       - [{ src, alt }, ...]
   * @param {number}      opts.speed       - px/s (positivo = izquierda)
   * @param {number}      opts.gap         - espacio entre logos en px
   * @param {number}      opts.logoHeight  - alto del logo en px
   * @param {boolean}     opts.pauseOnHover
   */
  constructor(container, opts = {}) {
    this.container   = container;
    this.logos       = opts.logos       ?? [];
    this.speed       = opts.speed       ?? 90;
    this.gap         = opts.gap         ?? 56;
    this.logoHeight  = opts.logoHeight  ?? 30;
    this.pauseOnHover= opts.pauseOnHover ?? true;

    // Estado de animación
    this.offset      = 0;          // posición actual del desplazamiento (px)
    this.velocity    = 0;          // velocidad actual (px/s) — se suaviza
    this.seqWidth    = 0;          // ancho medido de UNA copia de la lista
    this.isHovered   = false;
    this.rafId       = null;
    this.lastTs      = null;

    // Referencias DOM
    this.track  = null;
    this.seqRef = null;  // primera copia (referencia para medir)

    this._build();
    this._bindHover();
    this._observeResize();
    this._waitImages();
  }

  /* ── Construcción del DOM ─────────────────────────────────── */
  _build() {
    // Variables CSS para gap y altura
    this.container.style.setProperty('--ll-gap',    `${this.gap}px`);
    this.container.style.setProperty('--ll-height', `${this.logoHeight}px`);

    this.track = document.createElement('div');
    this.track.className = 'logoloop__track';
    this.container.appendChild(this.track);

    // Crear el mínimo de copias iniciales
    for (let i = 0; i < LogoLoop.MIN_COPIES; i++) {
      const list = this._makeList(i);
      if (i === 0) this.seqRef = list;
      this.track.appendChild(list);
    }
  }

  /* Crea un <ul> con todos los logos */
  _makeList(copyIndex) {
    const ul = document.createElement('ul');
    ul.className = 'logoloop__list';
    ul.setAttribute('role', 'list');
    if (copyIndex > 0) ul.setAttribute('aria-hidden', 'true');

    this.logos.forEach(({ src, alt }) => {
      const li  = document.createElement('li');
      li.className = 'logoloop__item';

      const img = document.createElement('img');
      img.src      = src;
      img.alt      = alt ?? '';
      img.loading  = 'lazy';
      img.decoding = 'async';
      img.draggable = false;

      li.appendChild(img);
      ul.appendChild(li);
    });

    return ul;
  }

  /* ── Hover: pausa con desaceleración suave ────────────────── */
  _bindHover() {
    if (!this.pauseOnHover) return;
    this.track.addEventListener('mouseenter', () => { this.isHovered = true;  });
    this.track.addEventListener('mouseleave', () => { this.isHovered = false; });
  }

  /* ── ResizeObserver: copias dinámicas ────────────────────── */
  _updateCopies() {
    const sw = this.seqRef ? this.seqRef.getBoundingClientRect().width : 0;
    if (sw === 0) return;

    this.seqWidth = Math.ceil(sw);
    const cw      = this.container.clientWidth;
    const needed  = Math.ceil(cw / this.seqWidth) + LogoLoop.COPY_HEADROOM;
    const target  = Math.max(LogoLoop.MIN_COPIES, needed);
    const current = this.track.querySelectorAll('.logoloop__list').length;

    if (current < target) {
      for (let i = current; i < target; i++) {
        this.track.appendChild(this._makeList(i));
      }
    } else if (current > target) {
      const lists = this.track.querySelectorAll('.logoloop__list');
      for (let i = target; i < current; i++) lists[i]?.remove();
    }
  }

  _observeResize() {
    if (window.ResizeObserver) {
      this._ro = new ResizeObserver(() => this._updateCopies());
      this._ro.observe(this.container);
      if (this.seqRef) this._ro.observe(this.seqRef);
    } else {
      window.addEventListener('resize', () => this._updateCopies());
    }
    this._updateCopies();
  }

  /* ── Esperar a que las imágenes carguen ──────────────────── */
  _waitImages() {
    const imgs = this.seqRef ? [...this.seqRef.querySelectorAll('img')] : [];
    if (imgs.length === 0) { this._start(); return; }

    let remaining = imgs.length;
    const onLoad = () => {
      if (--remaining === 0) { this._updateCopies(); this._start(); }
    };

    imgs.forEach(img => {
      if (img.complete) { onLoad(); }
      else {
        img.addEventListener('load',  onLoad, { once: true });
        img.addEventListener('error', onLoad, { once: true });
      }
    });
  }

  /* ── Bucle de animación (física idéntica al React original) ─ */
  _start() {
    if (this.rafId) return;

    const animate = (ts) => {
      if (this.lastTs === null) this.lastTs = ts;

      // deltaTime en segundos (igual que el original)
      const dt = Math.max(0, ts - this.lastTs) / 1000;
      this.lastTs = ts;

      // Velocidad objetivo: 0 si hover (pausa suave), speed si no
      const target = this.isHovered ? 0 : this.speed;

      // Suavizado exponencial — fórmula exacta del React original:
      // velocity += (target - velocity) * (1 - e^(-dt/tau))
      const alpha = 1 - Math.exp(-dt / LogoLoop.SMOOTH_TAU);
      this.velocity += (target - this.velocity) * alpha;

      if (this.seqWidth > 0) {
        // Avanzar y mantener en rango [0, seqWidth) para loop seamless
        let next = this.offset + this.velocity * dt;
        next = ((next % this.seqWidth) + this.seqWidth) % this.seqWidth;
        this.offset = next;
        this.track.style.transform = `translate3d(${-this.offset}px, 0, 0)`;
      }

      this.rafId = requestAnimationFrame(animate);
    };

    this.rafId = requestAnimationFrame(animate);
  }

  /* Detener y limpiar */
  destroy() {
    if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; }
    this._ro?.disconnect();
  }
}

/* ── Inicialización del LogoLoop en el hero ─────────────────── */
const logoLoopEl = document.getElementById('hero-logo-loop');

if (logoLoopEl) {
  new LogoLoop(logoLoopEl, {
    logos: [
      { src: 'logos/fanuc.png',             alt: 'Fanuc'         },
      { src: 'logos/siemens.png',           alt: 'Siemens'       },
      { src: 'logos/mitsubishi.png',        alt: 'Mitsubishi'    },
      { src: 'logos/Allen_Bradley_Logo.png',alt: 'Allen-Bradley' },
      { src: 'logos/abb.png',               alt: 'ABB'           },
      { src: 'logos/omron.png',             alt: 'Omron'         },
      { src: 'logos/mazak.png',             alt: 'Mazak'         },
      { src: 'logos/okuma.png',             alt: 'Okuma'         },
    ],
    speed:        90,    // px/s — ajusta a gusto
    gap:          64,    // px entre logos
    logoHeight:   30,    // px de alto de cada logo
    pauseOnHover: true,  // desaceleración suave al pasar el cursor
  });
}

/* ──────────────────────────────────────────────────────────────
   1. AOS — Animaciones en scroll
────────────────────────────────────────────────────────────── */
AOS.init({
  duration: 650,
  easing:   'ease-out-cubic',
  once:     true,
  offset:   70,
  disable:  window.matchMedia('(prefers-reduced-motion: reduce)').matches
});


/* ──────────────────────────────────────────────────────────────
   2. NAVBAR — Sombra al hacer scroll
────────────────────────────────────────────────────────────── */
const navbar = document.getElementById('navbar');

function actualizarNavbar() {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}

window.addEventListener('scroll', actualizarNavbar, { passive: true });
actualizarNavbar();


/* ──────────────────────────────────────────────────────────────
   3. HAMBURGER — Menú móvil
────────────────────────────────────────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const navLinks   = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  const abierto = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', abierto);
  hamburger.setAttribute('aria-expanded', abierto);
  document.body.style.overflow = abierto ? 'hidden' : '';
});

// Cerrar al hacer clic en un enlace
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Cerrar con tecla Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});


/* ──────────────────────────────────────────────────────────────
   4. CONTADORES DE CATEGORÍAS — actualiza el contador en cada tarjeta
────────────────────────────────────────────────────────────── */

/** Actualiza los contadores de cada categoría en el index */
function actualizarContadoresCategorias() {
  const data = window.__INVENTARIO__;
  if (!data || !data.productos) return;

  const conteos = { cnc: 0, plc: 0, refacciones: 0, accesorios: 0 };

  data.productos.forEach(p => {
    if (conteos[p.categoria] !== undefined) {
      conteos[p.categoria]++;
    }
  });

  Object.keys(conteos).forEach(cat => {
    const el = document.querySelector(`.categoria-count[data-cat="${cat}"]`);
    if (el) {
      el.textContent = `${conteos[cat].toLocaleString('es-MX')} equipos`;
    }
  });
}

// Ejecutar al cargar (solo si estamos en index.html)
if (document.querySelector('.categorias-grid')) {
  actualizarContadoresCategorias();
}


/* ──────────────────────────────────────────────────────────────
   5. CONTADORES ANIMADOS — Sección "Nosotros"
      Activa al entrar al viewport con easing exponencial
      y efectos visuales de estado (is-counting / counted)
────────────────────────────────────────────────────────────── */

// Easing: arranque rápido, frenado dramático al final
function easeOutExpo(t) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function animarContador(el) {
  const objetivo  = parseInt(el.dataset.target, 10);
  const duracion  = 2000; // ms
  const inicio    = performance.now();
  const bloque    = el.closest('.stat-block');

  // Estado inicial
  el.textContent = '0';
  bloque.classList.remove('counted');
  bloque.classList.add('is-counting');
  bloque.style.setProperty('--count-progress', '0');

  function actualizar(ahora) {
    const transcurrido = ahora - inicio;
    const progreso     = Math.min(transcurrido / duracion, 1);
    const suavizado    = easeOutExpo(progreso);
    const actual       = Math.round(suavizado * objetivo);

    el.textContent = actual;
    bloque.style.setProperty('--count-progress', suavizado.toFixed(4));

    if (progreso < 1) {
      requestAnimationFrame(actualizar);
    } else {
      // Finalizar
      el.textContent = objetivo;
      bloque.style.setProperty('--count-progress', '1');
      bloque.classList.remove('is-counting');
      bloque.classList.add('counted');
    }
  }

  requestAnimationFrame(actualizar);
}

// Observar la sección de estadísticas
const seccionNosotros = document.getElementById('nosotros');

if (seccionNosotros) {
  const observadorContadores = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Activar con retardo escalonado para efecto en cascada
          entry.target.querySelectorAll('.stat-number').forEach((el, i) => {
            setTimeout(() => animarContador(el), i * 150);
          });
          observadorContadores.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  observadorContadores.observe(seccionNosotros);
}


/* ──────────────────────────────────────────────────────────────
   6. FORMULARIO DE COTIZACIÓN — Envío async a Formspree
────────────────────────────────────────────────────────────── */
const formulario   = document.getElementById('cotizacion-form');
const btnEnviar    = document.getElementById('submit-btn');
const msgExito     = document.getElementById('form-exito');
const msgError     = document.getElementById('form-error');

if (formulario) {
  formulario.addEventListener('submit', async e => {
    e.preventDefault();

    // Ocultar mensajes previos
    msgExito.hidden = true;
    msgError.hidden = true;

    // Estado de carga en el botón
    const textoOriginal   = btnEnviar.innerHTML;
    btnEnviar.disabled    = true;
    btnEnviar.innerHTML   = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando…';

    try {
      const respuesta = await fetch(formulario.action, {
        method:  'POST',
        body:    new FormData(formulario),
        headers: { Accept: 'application/json' }
      });

      if (respuesta.ok) {
        // Éxito
        msgExito.hidden = false;
        formulario.reset();
        msgExito.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        // Error del servidor
        msgError.hidden = false;
        msgError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } catch {
      // Error de red
      msgError.hidden = false;
      msgError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } finally {
      btnEnviar.disabled  = false;
      btnEnviar.innerHTML = textoOriginal;
    }
  });
}


/* ──────────────────────────────────────────────────────────────
   7. AÑO ACTUAL en el footer
────────────────────────────────────────────────────────────── */
const anioEl = document.getElementById('anio');
if (anioEl) anioEl.textContent = new Date().getFullYear();


/* ──────────────────────────────────────────────────────────────
   8. ENLACE ACTIVO en navbar según sección visible
────────────────────────────────────────────────────────────── */
const secciones   = document.querySelectorAll('section[id], .hero[id]');
const enlaces     = document.querySelectorAll('.nav-link');

const observadorSecciones = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        enlaces.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
);

secciones.forEach(s => observadorSecciones.observe(s));
