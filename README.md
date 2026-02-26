# Autotech México — Sitio Web de Ventas

Sitio web profesional en español para venta de maquinaria CNC y PLCs industriales en México.
Stack: **HTML · CSS · Vanilla JavaScript** — sin dependencias, abre directo en el navegador.

---

## Inicio rápido

1. Abre `index.html` en cualquier navegador moderno
2. Para desarrollo con recarga automática, instala la extensión **Live Server** en VS Code
   o ejecuta `npx serve .` desde la carpeta del proyecto

---

## Estructura del proyecto

```
website-mexico/
├── index.html          ← Página única con todas las secciones
├── css/
│   └── styles.css      ← Estilos: variables, layout, responsive
├── js/
│   └── main.js         ← AOS, navbar, filtros, contadores, formulario
├── logos/              ← Logos de marcas (PNG)
└── README.md
```

---

## 1. Configurar notificaciones por correo (Formspree)

Cuando un cliente envíe el formulario de cotización, Formspree reenvía los datos a tu correo.

**Paso 1** — Crea una cuenta gratuita en [https://formspree.io](https://formspree.io)

**Paso 2** — Haz clic en **"New Form"**, nómbralo "Cotizaciones México" y confirma tu correo.

**Paso 3** — Copia tu ID único (ejemplo: `xpzgkwrb`)

**Paso 4** — Abre `index.html` y busca esta línea (sección del formulario):

```html
action="https://formspree.io/f/TU_ID_FORMSPREE"
```

Reemplaza `TU_ID_FORMSPREE` con tu ID real:

```html
action="https://formspree.io/f/xpzgkwrb"
```

**Paso 5** — Prueba enviando el formulario desde el sitio publicado. Recibirás un correo con todos los datos del cliente: nombre, empresa, estado, producto de interés, etc.

> **Plan gratuito Formspree:** 50 envíos/mes. Para más volumen, activa el plan de pago en formspree.io

---

## 2. Configurar el botón de WhatsApp

Abre `index.html` y localiza el botón flotante de WhatsApp (cerca del inicio del `<body>`):

```html
href="https://wa.me/521234567890?text=Hola..."
```

Reemplaza `521234567890` con tu número de WhatsApp Business:
- **52** = código de país de México
- Seguido del número sin guiones ni espacios (10 dígitos)

**Ejemplo para número 55 1234 5678:**
```html
href="https://wa.me/5215512345678?text=Hola..."
```

Para personalizar el mensaje predefinido, edita el texto después de `?text=` usando codificación URL
(puedes usar [https://www.urlencoder.org](https://www.urlencoder.org) para convertir el texto).

---

## 3. Actualizar información de contacto

Busca y reemplaza los siguientes datos en `index.html`:

| Dato | Placeholder actual | Reemplazar con |
|------|--------------------|----------------|
| Teléfono | `+52 (55) 0000-0000` | Tu teléfono |
| WhatsApp | `+52 (55) 0000-0000` | Tu WhatsApp |
| Correo | `ventas@autotechmexico.mx` | Tu correo |
| Dirección | `Av. Industrial 4500...` | Tu dirección real |
| RFC | `AAA000101AAA` | Tu RFC real |
| Horario | `Lun–Vie: 8am – 6pm` | Tu horario real |

---

## 4. Agregar productos reales al catálogo

Cada tarjeta de producto tiene esta estructura:

```html
<div class="producto-card" data-categoria="cnc">
  <div class="producto-imagen">
    <div class="producto-placeholder">
      <img src="logos/fanuc.png" alt="Fanuc" class="prod-logo">
    </div>
    <span class="prod-badge">CNC</span>
  </div>
  <div class="producto-info">
    <h3>Nombre del equipo</h3>
    <p>Descripción técnica corta</p>
    ...
  </div>
</div>
```

**Para agregar imagen real del producto:**
1. Guarda la foto del equipo en `assets/images/` (JPG o WebP, mín. 800×450 px)
2. Reemplaza el `<div class="producto-placeholder">` con:

```html
<img src="assets/images/tu-producto.jpg" alt="Nombre del equipo">
```

**Categorías disponibles** para `data-categoria`:
- `cnc` — Máquinas CNC
- `plc` — PLCs y controladores
- `refacciones` — Refacciones
- `accesorios` — Accesorios

---

## 5. Insertar Google Maps

1. Abre [Google Maps](https://maps.google.com) y busca tu dirección
2. Clic en **Compartir** → **Insertar un mapa** → **Copiar HTML**
3. En `index.html`, localiza el `<div class="map-placeholder">` y reemplázalo:

```html
<!-- Reemplaza esto: -->
<div class="map-placeholder">...</div>

<!-- Con el iframe de Google Maps: -->
<iframe
  src="https://www.google.com/maps/embed?pb=!1m18..."
  width="100%"
  height="200"
  style="border:0; border-radius:0.75rem;"
  allowfullscreen=""
  loading="lazy"
></iframe>
```

---

## 6. Publicar el sitio (opciones gratuitas)

### Opción A — Netlify Drop (recomendado, más fácil)
1. Ve a [netlify.com/drop](https://netlify.com/drop)
2. Arrastra la carpeta `website-mexico/` completa al navegador
3. En segundos obtienes una URL pública con HTTPS
4. Comparte el link con tu cliente — puede interactuar sin ver el código

### Opción B — GitHub Pages
1. Sube los archivos a un repositorio en GitHub
2. Ve a **Settings → Pages → Source: main**
3. Tu sitio queda en `https://tuusuario.github.io/website-mexico`

### Opción C — Hosting cPanel / Plesk
1. Comprime el contenido de `website-mexico/` (no la carpeta, los archivos dentro)
2. Súbelos vía cPanel File Manager a `public_html/`
3. Extrae en sitio — el sitio queda activo de inmediato

---

## 7. Paleta de colores

| Variable | Color | Uso |
|----------|-------|-----|
| `--azul` | `#0047AB` | Color principal, navbar, CTA |
| `--naranja` | `#FF6B2B` | Acento, botones de cotización |
| `--gris-bg` | `#F0F0F0` | Fondo de secciones alternas |
| `--oscuro` | `#111111` | Texto principal |
| `--azul-lt` | `#E8F0FE` | Fondos de iconos y badges |

---

## 8. Bibliotecas utilizadas (CDN — sin instalación)

| Biblioteca | Versión | Propósito |
|-----------|---------|-----------|
| [Inter](https://fonts.google.com/specimen/Inter) | — | Tipografía |
| [Font Awesome](https://fontawesome.com) | 6.5.0 | Íconos |
| [AOS](https://michalsnik.github.io/aos/) | 2.3.4 | Animaciones en scroll |
| [Formspree](https://formspree.io) | — | Envío de formularios por correo |
