/* ============================================================
   AUTOTECH MÉXICO — JavaScript para página de detalle de producto
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────────────────────
   CONFIGURACIÓN
────────────────────────────────────────────────────────────── */

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

// Metadatos por categoría
const CAT_META = {
  cnc:         { label: 'CNC',       cls: '',      nombre: 'Máquinas CNC',    pagina: 'categoria-cnc.html' },
  plc:         { label: 'PLC',       cls: 'plc',   nombre: 'PLCs y Control',  pagina: 'categoria-plc.html' },
  refacciones: { label: 'Refacción', cls: 'refac', nombre: 'Refacciones',     pagina: 'categoria-refacciones.html' },
  accesorios:  { label: 'Accesorio', cls: 'acces', nombre: 'Accesorios',      pagina: 'categoria-accesorios.html' },
};

// Especificaciones por tipo de producto
const SPECS_POR_TIPO = {
  'motor':          ['Voltaje', 'Potencia', 'RPM', 'Tipo de encoder'],
  'Motor':          ['Voltaje', 'Potencia', 'RPM', 'Tipo de encoder'],
  'Servo Drive':    ['Voltaje entrada', 'Corriente salida', 'Ejes soportados', 'Protocolo'],
  'Spindle Drive':  ['Potencia máxima', 'Voltaje', 'Refrigeración', 'Compatibilidad'],
  'Power Supply':   ['Voltaje entrada', 'Voltaje salida', 'Corriente máxima', 'Potencia'],
  'Circuit Board':  ['Compatibilidad', 'Tipo de conector', 'Funcionalidad'],
  'Control Module': ['Protocolos', 'I/O digitales', 'I/O analógicas', 'Comunicación'],
  'PCB':            ['Compatibilidad', 'Número de parte', 'Funcionalidad'],
  'Operator Panel': ['Tamaño pantalla', 'Resolución', 'Comunicación'],
  'Output Module':  ['Canales', 'Voltaje', 'Corriente por canal'],
  'Drive':          ['Potencia', 'Voltaje entrada', 'Voltaje salida', 'Frecuencia'],
  'Quick Turn':     ['Capacidad de volteo', 'Diámetro máximo', 'Longitud máxima', 'Control'],
  'default':        ['Compatibilidad', 'Especificaciones técnicas', 'Garantía'],
};

/* ──────────────────────────────────────────────────────────────
   INICIALIZACIÓN
────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
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

  // Cargar producto
  cargarProducto();

  // Año en footer
  const anioEl = document.getElementById('anio');
  if (anioEl) anioEl.textContent = new Date().getFullYear();

  // Navbar y hamburger
  initNavbar();
  initHamburger();
});

/* ──────────────────────────────────────────────────────────────
   CARGAR PRODUCTO
────────────────────────────────────────────────────────────── */
function cargarProducto() {
  const urlParams   = new URLSearchParams(window.location.search);
  const productoId  = urlParams.get('id');
  const detalleEl   = document.getElementById('producto-detalle');
  const errorEl     = document.getElementById('producto-error');

  if (!productoId) {
    mostrarError();
    return;
  }

  const data = window.__INVENTARIO__;
  if (!data || !data.productos) {
    mostrarError();
    return;
  }

  // Buscar producto por ID
  const producto = data.productos.find(p => String(p.id) === productoId);

  if (!producto) {
    mostrarError();
    return;
  }

  // Renderizar producto
  renderizarProducto(producto);
}

/* ──────────────────────────────────────────────────────────────
   RENDERIZAR PRODUCTO
────────────────────────────────────────────────────────────── */
function renderizarProducto(p) {
  const detalleEl = document.getElementById('producto-detalle');
  const cat       = CAT_META[p.categoria] || CAT_META.refacciones;
  const marcaKey  = (p.marca || '').toLowerCase();
  const logoSrc   = LOGOS_MARCA[marcaKey];

  // Actualizar título de página
  document.title = `${p.titulo} — Autotech México`;

  // Actualizar meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.content = `${p.titulo}. SKU: ${p.sku}. ${p.marca ? `Marca: ${p.marca}.` : ''} Autotech México - Envío a toda la República.`;
  }

  // Actualizar breadcrumb
  actualizarBreadcrumb(p, cat);

  // Actualizar botón volver
  actualizarBotonVolver(cat);

  // Actualizar WhatsApp con producto específico
  actualizarWhatsApp(p);

  // Imagen del producto
  let imagenHTML;
  if (p.imagen) {
    imagenHTML = `<img src="${p.imagen}" alt="${p.titulo}" class="producto-imagen-grande">`;
  } else if (logoSrc) {
    imagenHTML = `
      <div class="producto-imagen-placeholder">
        <img src="${logoSrc}" alt="${p.marca}" class="prod-logo-grande">
      </div>`;
  } else {
    imagenHTML = `
      <div class="producto-imagen-placeholder">
        <i class="fa-solid fa-gear"></i>
      </div>`;
  }

  // Badge de condición (estandarizado)
  let condicionHTML = '';
  if (p.condicion === 'New') {
    condicionHTML = `<span class="tag-badge tag-condicion tag-nuevo">Nuevo</span>`;
  } else if (p.condicion === 'Refurbished') {
    condicionHTML = `<span class="tag-badge tag-condicion tag-reacondicionado">Reacondicionado</span>`;
  }

  // Disponibilidad
  const disponibleHTML = p.disponible
    ? `<span class="detalle-disponible"><i class="fa-solid fa-circle-check"></i> En stock</span>`
    : `<span class="detalle-agotado"><i class="fa-solid fa-circle-xmark"></i> Agotado</span>`;

  // Precio
  const num = parseFloat(p.precio || '0');
  const precioHTML = num > 0
    ? `$${num.toLocaleString('en-US', { maximumFractionDigits: 0 })} <small>USD</small>`
    : `Consultar precio`;

  // Tag de marca (estandarizado)
  const marcaTagHTML = p.marca
    ? `<span class="tag-badge tag-marca">${p.marca}</span>`
    : '';

  // Badge de tipo/categoría (estandarizado)
  const tipoHTML = `<span class="tag-badge tag-tipo">${cat.label}</span>`;

  // Especificaciones
  const specsHTML = generarEspecificaciones(p);

  // Renderizar
  detalleEl.innerHTML = `
    <div class="producto-galeria" data-aos="fade-right">
      ${imagenHTML}
    </div>

    <div class="producto-info-detalle" data-aos="fade-left">
      <div class="producto-header">
        <div class="producto-tags">
          ${marcaTagHTML}
          ${tipoHTML}
          ${condicionHTML}
        </div>
        <h1>${p.titulo}</h1>
      </div>

      <div class="producto-meta">
        <div class="meta-item">
          <span class="meta-label">SKU</span>
          <code class="meta-value">${p.sku || '—'}</code>
        </div>
        <div class="meta-item">
          <span class="meta-label">Tipo</span>
          <span class="meta-value">${p.tipo || cat.nombre}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Categoría</span>
          <span class="meta-value">${cat.nombre}</span>
        </div>
      </div>

      <div class="producto-precio-wrap">
        <span class="producto-precio">${precioHTML}</span>
        ${disponibleHTML}
      </div>
      <p class="precio-nota"><i class="fa-solid fa-info-circle"></i> Precio sujeto a disponibilidad y confirmación</p>

      ${specsHTML}

      <div class="producto-acciones">
        <a href="https://wa.me/19562394080?text=${encodeURIComponent(`Hola, me interesa solicitar cotización del producto:\n\n• Producto: ${p.titulo}\n• SKU: ${p.sku}\n• Precio de referencia: ${num > 0 ? '$' + num.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' USD' : 'Consultar'}\n\n¿Podrían darme más información?`)}"
           class="btn btn-whatsapp btn-lg" target="_blank" rel="noopener">
          <i class="fa-brands fa-whatsapp"></i> Cotizar por WhatsApp
        </a>
      </div>

      <div class="cotizacion-form-wrap">
        <h3><i class="fa-solid fa-file-invoice-dollar"></i> Solicitar Cotización</h3>
        <form id="cotizacion-form" action="https://formspree.io/f/xyzgkpwa" method="POST">
          <input type="hidden" name="producto" value="${p.titulo}">
          <input type="hidden" name="sku" value="${p.sku || 'N/A'}">
          <input type="hidden" name="precio_referencia" value="${num > 0 ? '$' + num.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' USD' : 'Consultar'}">
          <input type="hidden" name="_subject" value="Cotización: ${p.titulo} (${p.sku})">
          <input type="hidden" name="_replyto" id="replyto-field">

          <div class="form-group">
            <label for="nombre">Nombre <span class="req">*</span></label>
            <input type="text" id="nombre" name="nombre" required placeholder="Tu nombre completo">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="email">Email <span class="req">*</span></label>
              <input type="email" id="email" name="email" required placeholder="tu@email.com">
            </div>
            <div class="form-group">
              <label for="telefono">Teléfono <span class="req">*</span></label>
              <input type="tel" id="telefono" name="telefono" required placeholder="+52 (xxx) xxx-xxxx">
            </div>
          </div>

          <div class="form-group">
            <label for="mensaje">Mensaje (opcional)</label>
            <textarea id="mensaje" name="mensaje" rows="3" placeholder="¿Tienes alguna pregunta o comentario adicional?"></textarea>
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-submit">
            <i class="fa-solid fa-paper-plane"></i> Enviar Solicitud
          </button>
        </form>
        <p class="form-nota">Te responderemos en menos de 24 horas hábiles.</p>
      </div>

      <div class="producto-garantias">
        <div class="garantia-item">
          <i class="fa-solid fa-truck"></i>
          <span>Envío a toda la República</span>
        </div>
        <div class="garantia-item">
          <i class="fa-solid fa-shield-check"></i>
          <span>Garantía incluida</span>
        </div>
        <div class="garantia-item">
          <i class="fa-solid fa-headset"></i>
          <span>Soporte técnico</span>
        </div>
      </div>
    </div>
  `;

  // Refrescar AOS
  if (typeof AOS !== 'undefined') AOS.refreshHard();

  // Inicializar formulario de cotización
  initFormularioCotizacion();
}

/* ──────────────────────────────────────────────────────────────
   FORMULARIO DE COTIZACIÓN
────────────────────────────────────────────────────────────── */
function initFormularioCotizacion() {
  const form = document.getElementById('cotizacion-form');
  const emailInput = document.getElementById('email');
  const replytoField = document.getElementById('replyto-field');

  if (!form || !emailInput || !replytoField) return;

  // Sincronizar email con _replyto
  emailInput.addEventListener('input', () => {
    replytoField.value = emailInput.value;
  });

  // Manejar envío del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Estado de carga
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        // Éxito
        form.innerHTML = `
          <div class="form-exito">
            <i class="fa-solid fa-circle-check"></i>
            <h4>¡Solicitud enviada!</h4>
            <p>Hemos recibido tu solicitud de cotización. Te contactaremos pronto.</p>
          </div>
        `;
      } else {
        throw new Error('Error en el envío');
      }
    } catch (error) {
      // Error
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      alert('Hubo un error al enviar tu solicitud. Por favor intenta de nuevo o contáctanos por WhatsApp.');
    }
  });
}

/* ──────────────────────────────────────────────────────────────
   GENERAR ESPECIFICACIONES
────────────────────────────────────────────────────────────── */
function generarEspecificaciones(p) {
  const tipo  = p.tipo || 'default';
  const specs = SPECS_POR_TIPO[tipo] || SPECS_POR_TIPO['default'];

  const items = specs.map(spec => `
    <div class="spec-row">
      <span class="spec-label">${spec}</span>
      <span class="spec-value">Consultar</span>
    </div>
  `).join('');

  return `
    <div class="producto-specs">
      <h3><i class="fa-solid fa-list-check"></i> Especificaciones Técnicas</h3>
      <div class="specs-grid">
        ${items}
      </div>
      <p class="specs-nota">
        <i class="fa-solid fa-info-circle"></i>
        Para especificaciones detalladas, solicita la ficha técnica completa.
      </p>
    </div>
  `;
}

/* ──────────────────────────────────────────────────────────────
   ACTUALIZAR BREADCRUMB
────────────────────────────────────────────────────────────── */
function actualizarBreadcrumb(p, cat) {
  const categoriaLink = document.getElementById('breadcrumb-categoria');
  const productoSpan  = document.getElementById('breadcrumb-producto');

  if (categoriaLink) {
    categoriaLink.href = cat.pagina;
    categoriaLink.textContent = cat.nombre;
  }

  if (productoSpan) {
    // Truncar título si es muy largo
    const titulo = p.titulo.length > 40
      ? p.titulo.substring(0, 40) + '…'
      : p.titulo;
    productoSpan.textContent = titulo;
  }
}

/* ──────────────────────────────────────────────────────────────
   ACTUALIZAR BOTÓN VOLVER
────────────────────────────────────────────────────────────── */
function actualizarBotonVolver(cat) {
  const btnVolver      = document.getElementById('btn-volver');
  const volverCategoria = document.getElementById('volver-categoria');

  if (btnVolver) {
    btnVolver.href = cat.pagina;
  }

  if (volverCategoria) {
    volverCategoria.textContent = cat.nombre;
  }
}

/* ──────────────────────────────────────────────────────────────
   ACTUALIZAR WHATSAPP
────────────────────────────────────────────────────────────── */
function actualizarWhatsApp(p) {
  const waBtn = document.getElementById('whatsapp-btn');
  if (waBtn) {
    const mensaje = `Hola, me interesa el producto: ${p.titulo} (SKU: ${p.sku}). ¿Me pueden dar información?`;
    waBtn.href = `https://wa.me/19562394080?text=${encodeURIComponent(mensaje)}`;
  }
}

/* ──────────────────────────────────────────────────────────────
   MOSTRAR ERROR
────────────────────────────────────────────────────────────── */
function mostrarError() {
  const detalleEl = document.getElementById('producto-detalle');
  const errorEl   = document.getElementById('producto-error');

  if (detalleEl) detalleEl.hidden = true;
  if (errorEl) errorEl.hidden = false;
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

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}
