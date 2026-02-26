/* ============================================================
   AUTOTECH MÉXICO — JavaScript para páginas de categoría
   Maneja filtros, búsqueda, paginación y renderizado de productos
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────────────────────
   CONFIGURACIÓN
────────────────────────────────────────────────────────────── */
// Mostrar todos los productos sin paginación
const MOSTRAR_TODOS = true;

// Mapeo de logos por marca
const LOGOS_MARCA = {
  'fanuc':         'logos/fanuc.png',
  'siemens':       'logos/siemens.png',
  'mitsubishi':    'logos/mitsubishi.png',
  'allen-bradley': 'logos/Allen_Bradley_Logo.png',
  'allen bradley': 'logos/Allen_Bradley_Logo.png',
  'abb':           'logos/abb.png',
  'omron':         'logos/omron.png',
  'mazak':         'logos/mazak.png',
  'okuma':         'logos/okuma.png',
};

// Labels y clases por categoría
const CAT_META = {
  cnc:         { label: 'CNC',       cls: '',      nombre: 'Máquinas CNC' },
  plc:         { label: 'PLC',       cls: 'plc',   nombre: 'PLCs y Control' },
  refacciones: { label: 'Refacción', cls: 'refac', nombre: 'Refacciones' },
  accesorios:  { label: 'Accesorio', cls: 'acces', nombre: 'Accesorios' },
};

/* ──────────────────────────────────────────────────────────────
   ESTADO
────────────────────────────────────────────────────────────── */
let _inventarioCompleto = [];
let _categoriaActual    = '';
let _busquedaActiva     = '';
let _filtroMarca        = '';
let _filtroCondicion    = '';

/* ──────────────────────────────────────────────────────────────
   INICIALIZACIÓN
────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Detectar categoría desde el body
  _categoriaActual = document.body.dataset.categoria || '';

  // Inicializar AOS
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 650,
      easing: 'ease-out-cubic',
      once: true,
      offset: 70,
      disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    });
  }

  // Cargar inventario
  cargarInventario();

  // Configurar eventos
  initEventos();

  // Año en footer
  const anioEl = document.getElementById('anio');
  if (anioEl) anioEl.textContent = new Date().getFullYear();

  // Navbar scroll
  initNavbar();

  // Hamburger menú
  initHamburger();
});

/* ──────────────────────────────────────────────────────────────
   CARGA DE INVENTARIO
────────────────────────────────────────────────────────────── */
function cargarInventario() {
  const grid  = document.getElementById('productos-grid');
  const error = document.getElementById('inventario-error');

  if (!grid) return;

  const data = window.__INVENTARIO__;

  if (!data || !data.productos || !data.productos.length) {
    grid.innerHTML = '';
    if (error) error.hidden = false;
    return;
  }

  // Filtrar por categoría actual
  _inventarioCompleto = data.productos.filter(p => p.categoria === _categoriaActual);

  // Poblar filtro de marcas
  poblarFiltroMarcas();

  // Renderizar primera página
  grid.innerHTML = '';
  renderizarProductos();
}

/* ──────────────────────────────────────────────────────────────
   FILTRO DE MARCAS
────────────────────────────────────────────────────────────── */
function poblarFiltroMarcas() {
  const select = document.getElementById('filtro-marca');
  if (!select) return;

  // Extraer marcas únicas
  const marcas = [...new Set(
    _inventarioCompleto
      .map(p => p.marca)
      .filter(m => m && m.trim())
  )].sort();

  // Agregar opciones
  marcas.forEach(marca => {
    const opt = document.createElement('option');
    opt.value = marca;
    opt.textContent = marca;
    select.appendChild(opt);
  });
}

/* ──────────────────────────────────────────────────────────────
   FILTRADO DE PRODUCTOS
────────────────────────────────────────────────────────────── */
function productosFiltrados() {
  const q = _busquedaActiva.trim().toLowerCase();

  return _inventarioCompleto.filter(p => {
    // Filtro por marca
    if (_filtroMarca && p.marca !== _filtroMarca) return false;

    // Filtro por condición
    if (_filtroCondicion && p.condicion !== _filtroCondicion) return false;

    // Filtro por búsqueda
    if (q) {
      const haystack = `${p.titulo} ${p.sku} ${p.marca} ${p.tipo}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

/* ──────────────────────────────────────────────────────────────
   RENDERIZADO DE PRODUCTOS
────────────────────────────────────────────────────────────── */
function renderizarProductos() {
  const grid     = document.getElementById('productos-grid');
  const msgVacio = document.getElementById('filtro-vacio');
  const countEl  = document.getElementById('catalogo-count');

  if (!grid) return;

  // Limpiar grid
  grid.innerHTML = '';

  const filtrados = productosFiltrados();

  // Actualizar contador
  if (countEl) {
    countEl.textContent = `${filtrados.length.toLocaleString('es-MX')} equipos`;
  }

  // Sin resultados
  if (filtrados.length === 0) {
    if (msgVacio) msgVacio.hidden = false;
    return;
  }

  if (msgVacio) msgVacio.hidden = true;

  // Insertar TODAS las tarjetas
  grid.innerHTML = filtrados.map((p, i) => crearTarjeta(p, i)).join('');

  // Refrescar AOS
  if (typeof AOS !== 'undefined') AOS.refreshHard();
}

/* ──────────────────────────────────────────────────────────────
   CREAR TARJETA DE PRODUCTO
────────────────────────────────────────────────────────────── */
function crearTarjeta(p, index) {
  const cat      = CAT_META[p.categoria] || CAT_META.refacciones;
  const marcaKey = (p.marca || '').toLowerCase();
  const logoSrc  = LOGOS_MARCA[marcaKey];
  const delay    = (index % 8) * 60;

  // Imagen: foto real → logo de marca → ícono genérico
  let imagenHTML;
  if (p.imagen) {
    imagenHTML = `<img src="${p.imagen}" alt="${p.titulo}" loading="lazy" class="prod-foto">`;
  } else if (logoSrc) {
    imagenHTML = `<div class="producto-placeholder"><img src="${logoSrc}" alt="${p.marca}" class="prod-logo"></div>`;
  } else {
    imagenHTML = `<div class="producto-placeholder"><i class="fa-solid fa-gear prod-icon-ph"></i></div>`;
  }

  // Badge de condición
  let condHTML = '';
  if (p.condicion === 'Refurbished') condHTML = `<span class="cond-badge cond-refurb">Reacondicionado</span>`;
  else if (p.condicion === 'New') condHTML = `<span class="cond-badge cond-new">Nuevo</span>`;

  // Precio
  const num = parseFloat(p.precio || '0');
  const precioHTML = num > 0
    ? `<span class="precio">$${num.toLocaleString('en-US', { maximumFractionDigits: 0 })} <small>USD</small></span>`
    : `<span class="precio">Consultar precio</span>`;

  // Tag de marca
  const marcaClass = marcaKey.replace(/[^a-z]/g, '');
  const marcaTag = p.marca
    ? `<div class="prod-marca"><span class="marca-tag ${marcaClass}">${p.marca}</span></div>`
    : '';

  return `
    <a href="producto.html?id=${p.id}" class="producto-card" data-aos="fade-up" data-aos-delay="${delay}">
      <div class="producto-imagen">
        ${imagenHTML}
        <span class="prod-badge ${cat.cls}">${cat.label}</span>
        ${condHTML}
      </div>
      <div class="producto-info">
        ${marcaTag}
        <h3>${p.titulo}</h3>
        <p class="prod-sku">SKU: <code>${p.sku || '—'}</code></p>
        <div class="prod-precio">
          <span class="precio-desde">Precio</span>
          ${precioHTML}
        </div>
      </div>
    </a>`;
}

/* ──────────────────────────────────────────────────────────────
   EVENTOS
────────────────────────────────────────────────────────────── */
function initEventos() {
  // Buscador
  const searchInput = document.getElementById('catalogo-search');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        _busquedaActiva = searchInput.value;
        renderizarProductos();
      }, 280);
    });
  }

  // Filtro de marca
  const filtroMarca = document.getElementById('filtro-marca');
  if (filtroMarca) {
    filtroMarca.addEventListener('change', () => {
      _filtroMarca = filtroMarca.value;
      renderizarProductos();
    });
  }

  // Filtro de condición
  const filtroCondicion = document.getElementById('filtro-condicion');
  if (filtroCondicion) {
    filtroCondicion.addEventListener('change', () => {
      _filtroCondicion = filtroCondicion.value;
      renderizarProductos();
    });
  }

}

/* ──────────────────────────────────────────────────────────────
   NAVBAR
────────────────────────────────────────────────────────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function actualizarNavbar() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }

  window.addEventListener('scroll', actualizarNavbar, { passive: true });
  actualizarNavbar();
}

/* ──────────────────────────────────────────────────────────────
   HAMBURGER MENÚ
────────────────────────────────────────────────────────────── */
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  if (!hamburger || !navLinks) return;

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

  // Cerrar con Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}
