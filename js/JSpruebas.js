/**
 * =========================================================
 * 1. MÓDULO DE UTILIDADES Y GESTIÓN DE ESTADO (CARRITO)
 * Estas funciones son independientes del DOM de la página.
 * =========================================================
 */
const IGV = 0.18; // Constante global para cálculos de impuestos

function getCarrito() {
    const data = localStorage.getItem('carritoUTP');
    return data ? JSON.parse(data) : [];
}

function saveCarrito(carrito) {
    localStorage.setItem('carritoUTP', JSON.stringify(carrito));
}

function slugify(text) {
    // Normaliza, convierte a minúsculas, elimina tildes y reemplaza espacios/caracteres por guiones.
    return text
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

function generarCodigoPedido() {
    const ahora = new Date();
    // Usa la marca de tiempo (en base 36) y un random para generar un código único corto.
    const parteTiempo = ahora.getTime().toString(36).slice(-6);
    const random = Math.floor(Math.random() * 46656).toString(36).padStart(3, '0');
    return (parteTiempo + random).toUpperCase();
}


/**
 * =========================================================
 * 2. LÓGICA DE COMPONENTES DE LA INTERFAZ
 * (Funciones que interactúan con el DOM y se inicializan)
 * =========================================================
 */

function setupMenuMovil() {
    const btnMenu = document.getElementById('btn-menu');
    const menuLateral = document.getElementById('menu-lateral');
    const overlay = document.getElementById('overlay-menu');
    const btnCerrar = menuLateral?.querySelector('.cerrar-menu');

    if (!btnMenu || !menuLateral || !overlay) return;

    function abrirMenu() {
        menuLateral.classList.add('activo');
        overlay.classList.add('activo');
        document.body.style.overflow = 'hidden';
        
        // CORRECCIÓN ACCESIBILIDAD (ARIA)
        btnMenu.setAttribute('aria-expanded', 'true');
        menuLateral.setAttribute('aria-hidden', 'false');
    }

    function cerrarMenu() {
        menuLateral.classList.remove('activo');
        overlay.classList.remove('activo');
        document.body.style.overflow = '';
        
        // CORRECCIÓN ACCESIBILIDAD (ARIA)
        btnMenu.setAttribute('aria-expanded', 'false');
        menuLateral.setAttribute('aria-hidden', 'true');
    }

    btnMenu.addEventListener('click', abrirMenu);
    btnCerrar?.addEventListener('click', cerrarMenu);
    overlay.addEventListener('click', cerrarMenu);
}


function setupBusquedaYFiltro() {
    const buscarInput = document.getElementById('buscar');
    const verTodoBtn = document.getElementById('verTodo');
    const secciones = document.querySelectorAll('main section');
    const carrusel = document.getElementById('carrusel-banners'); // Renombrado a 'carrusel'

    if (!buscarInput || !verTodoBtn || secciones.length === 0) return;

    // Función de filtrado
    function filtrarProductos() {
        const filtro = buscarInput.value.toLowerCase();
        let hayCoincidencias = false;
        
        secciones.forEach(seccion => {
            const productos = seccion.querySelectorAll('.producto');
            let coincidencias = 0;

            productos.forEach(prod => {
                const texto = prod.textContent.toLowerCase();
                const visible = texto.includes(filtro);
                prod.style.display = visible ? 'block' : 'none';
                if (visible) coincidencias++;
            });

            seccion.style.display = coincidencias > 0 ? 'block' : 'none';
            if (coincidencias > 0) hayCoincidencias = true;
        });

        // Ocultar carrusel solo si se está buscando algo
        if (carrusel) {
            carrusel.style.display = filtro ? 'none' : 'block';
        }
    }
    
    // Función para mostrar todo
    function limpiarFiltro() {
        buscarInput.value = '';
        secciones.forEach(seccion => {
            seccion.style.display = 'block';
            seccion.querySelectorAll('.producto').forEach(prod => {
                prod.style.display = 'block';
            });
        });
        if (carrusel) {
            carrusel.style.display = 'block';
        }
    }

    buscarInput.addEventListener('input', filtrarProductos);
    verTodoBtn.addEventListener('click', limpiarFiltro);
}


function setupCarruselBanners() {
    const carruselBanners = document.getElementById('carrusel-banners');
    if (!carruselBanners) return;
    
    const radios = Array.from(carruselBanners.querySelectorAll('input[name="radio-btn"]'));
    const btnNext = carruselBanners.querySelector('.arrow-next');
    const btnPrev = carruselBanners.querySelector('.arrow-prev');

    let currentIndex = radios.findIndex(r => r.checked);
    if (currentIndex === -1) {
        currentIndex = 0;
        radios[0].checked = true;
    }

    function showSlide(index) {
        const total = radios.length;
        currentIndex = (index + total) % total;
        radios[currentIndex].checked = true;
    }

    btnNext?.addEventListener('click', () => showSlide(currentIndex + 1));
    btnPrev?.addEventListener('click', () => showSlide(currentIndex - 1));

    radios.forEach((radio, idx) => {
        radio.addEventListener('change', () => {
            if (radio.checked) currentIndex = idx;
        });
    });
}


function setupMiniCarrito() {
    const lista = document.getElementById('mini-carrito-lista');
    const totalSpan = document.getElementById('mini-carrito-total');
    const miniCarritoDiv = document.getElementById('mini-carrito');

    // Esta función debe ser exportada/accesible si se usa fuera
    function actualizarMiniCarrito() {
        const carrito = getCarrito();
        if (!lista || !totalSpan) return;

        lista.innerHTML = '';
        let total = 0;

        carrito.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.nombre} x${item.cantidad} - S/ ${(item.precio * item.cantidad).toFixed(2)}`;
            lista.appendChild(li);
            total += item.precio * item.cantidad;
        });

        totalSpan.textContent = `S/ ${total.toFixed(2)}`;
        // Mostrar/Ocultar el mini carrito si tiene elementos
        if (carrito.length > 0) {
            miniCarritoDiv?.classList.remove('oculto');
        }
    }
    
    function mostrarMiniCarrito() {
        miniCarritoDiv?.classList.remove('oculto');
    }

    // Eventos del Mini Carrito
    document.getElementById('btn-cerrar-mini')?.addEventListener('click', () => {
        miniCarritoDiv?.classList.add('oculto');
    });

    document.getElementById('btn-proceder')?.addEventListener('click', () => {
        window.location.href = 'carrito.html';
    });

    // Inicialización de botones "Agregar" (en menu.html)
    const botonesAgregar = document.querySelectorAll('.btn-agregar');
    botonesAgregar.forEach(btn => {
        // Se eliminó el check redundante "listenerAttached"
        btn.addEventListener('click', e => {
            e.preventDefault();
            const tarjeta = btn.closest('.producto');
            if (!tarjeta) return;

            // Extracción de datos (ahora usa slugify que está global)
            const nombre = tarjeta.querySelector('h3')?.textContent.trim() || 'Producto';
            const descElem = Array.from(tarjeta.querySelectorAll('p')).find(p => !p.classList.contains('precio'));
            const descripcion = descElem ? descElem.textContent.trim() : '';
            const precioTexto = tarjeta.querySelector('.precio')?.textContent || '0';
            const precio = parseFloat(precioTexto.replace('S/', '').replace(',', '.').trim()) || 0;
            const id = slugify(nombre);
            const imgSrc = tarjeta.querySelector('img')?.getAttribute('src') || '';

            let carrito = getCarrito();
            const existente = carrito.find(item => item.id === id);

            if (existente) {
                existente.cantidad += 1;
            } else {
                carrito.push({id, nombre, descripcion, precio, cantidad: 1, imagen: imgSrc});
            }

            saveCarrito(carrito);
            actualizarMiniCarrito();
            mostrarMiniCarrito();
        });
    });
    
    // Ejecutar al iniciar (asegura que el mini-carrito muestre items al cargar)
    actualizarMiniCarrito();
}


function setupCarritoCompleto() {
    const tbody = document.getElementById('carrito-body');
    const baseSpan = document.getElementById('base-imponible');
    const igvSpan = document.getElementById('igv');
    const totalSpan = document.getElementById('total');

    if (!tbody || !baseSpan || !igvSpan || !totalSpan) return;

    let carrito = getCarrito();

    function actualizarTotales() {
        const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
        const base = total / (1 + IGV);
        const igv = total - base;

        baseSpan.textContent = `S/ ${base.toFixed(2)}`;
        igvSpan.textContent = `S/ ${igv.toFixed(2)}`;
        totalSpan.textContent = `S/ ${total.toFixed(2)}`;
    }

    function renderCarrito() {
        tbody.innerHTML = '';

        if (!carrito.length) {
            // ... (Lógica de carrito vacío) ...
            const fila = document.createElement('tr');
            const celda = document.createElement('td');
            celda.colSpan = 6;
            celda.textContent = 'Tu carrito está vacío.';
            celda.classList.add('carrito-vacio');
            fila.appendChild(celda);
            tbody.appendChild(fila);
            actualizarTotales();
            return;
        }

        carrito.forEach(item => {
            const tr = document.createElement('tr');
            tr.dataset.id = item.id;
            tr.innerHTML = `
          <td class="col-imagen">
            <img src="${item.imagen}" alt="${item.nombre}" style="width:60px; height:60px; object-fit:cover; border-radius:6px;">
          </td>
          <td class="col-nombre">
            <strong>${item.nombre}</strong><br>
            <small>${item.descripcion}</small>
          </td>
          <td class="col-precio">S/ ${item.precio.toFixed(2)}</td>
          <td class="col-cantidad">
            <button class="btn-cantidad btn-restar">-</button>
            <span class="cantidad">${item.cantidad}</span>
            <button class="btn-cantidad btn-sumar">+</button>
          </td>
          <td class="col-subtotal">S/ ${(item.precio * item.cantidad).toFixed(2)}</td>
          <td class="col-eliminar">
            <button class="btn-eliminar">Eliminar</button>
          </td>
        `;
            tbody.appendChild(tr);
        });

        actualizarTotales();
    }

    // Eventos para sumar/restar/eliminar
    tbody.addEventListener('click', e => {
        const btn = e.target;
        const fila = btn.closest('tr');
        if (!fila) return;
        const id = fila.dataset.id;
        const item = carrito.find(i => i.id === id);
        if (!item) return;

        if (btn.classList.contains('btn-sumar')) {
            item.cantidad++;
        } else if (btn.classList.contains('btn-restar')) {
            if (item.cantidad > 1) {
                item.cantidad--;
            } else {
                carrito = carrito.filter(i => i.id !== id);
            }
        } else if (btn.classList.contains('btn-eliminar')) {
            carrito = carrito.filter(i => i.id !== id);
        }

        saveCarrito(carrito);
        renderCarrito();
    });

    renderCarrito();
}


function setupPagoYTicket() {
    const formPago = document.getElementById('form-pago');
    const ticketDiv = document.getElementById('ticket');
    const ticketContenido = document.getElementById('ticket-contenido');
    const btnImprimir = document.getElementById('btn-imprimir');
    
    // Necesitamos obtener el carrito actualizado para el pago
    let carrito = getCarrito();

    if (!formPago || !ticketDiv || !ticketContenido) return;
    
    const baseSpan = document.getElementById('base-imponible'); // Se usa para calcular totales
    const igvSpan = document.getElementById('igv');
    const totalSpan = document.getElementById('total');


    formPago.addEventListener('submit', e => {
        e.preventDefault();
        
        carrito = getCarrito(); // Asegurar que el carrito esté actualizado
        if (!carrito.length) {
            alert('Tu carrito está vacío.');
            return;
        }

        const codigoEstudiante = document.getElementById('codigo-estudiante')?.value.trim();
        if (!codigoEstudiante) {
            alert('Por favor, ingresa tu código de estudiante.');
            return;
        }
        
        // CÁLCULOS y GENERACIÓN DE DATOS
        const fecha = new Date();
        const fechaTexto = fecha.toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
        const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
        const base = total / (1 + IGV);
        const igv = total - base;
        const codigoPedido = generarCodigoPedido();

        // GENERACIÓN DEL TICKET HTML
        let detalleHTML = `
          <h3>Ticket de compra - Kiosco UTP</h3>
          <p><strong>Código de estudiante:</strong> ${codigoEstudiante}</p>
          <p><strong>Fecha y hora:</strong> ${fechaTexto}</p>
          <p><strong>Código de recogida:</strong> ${codigoPedido}</p>
          <hr>
          <table class="ticket-tabla">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cant.</th>
                <th>P. Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
        `;

        carrito.forEach(item => {
            detalleHTML += `
            <tr>
              <td>${item.nombre}</td>
              <td>${item.cantidad}</td>
              <td>S/ ${item.precio.toFixed(2)}</td>
              <td>S/ ${(item.precio * item.cantidad).toFixed(2)}</td>
            </tr>
          `;
        });

        detalleHTML += `
            </tbody>
          </table>
          <hr>
          <p><strong>Base imponible:</strong> S/ ${base.toFixed(2)}</p>
          <p><strong>IGV (18%):</strong> S/ ${igv.toFixed(2)}</p>
          <p><strong>Total a pagar:</strong> S/ ${total.toFixed(2)}</p>
          <p style="margin-top:10px;">Presenta este código en caja para recoger tu pedido.</p>
        `;

        ticketContenido.innerHTML = detalleHTML;
        ticketDiv.classList.remove('oculto');
        
        // LIMPIEZA
        saveCarrito([]); // Limpiar el carrito después de la compra
        
        // Volver a renderizar el carrito (si estamos en carrito.html)
        if (baseSpan && igvSpan && totalSpan) {
            setupCarritoCompleto();
        }
        
        formPago.reset();
    });

    btnImprimir?.addEventListener('click', () => {
        window.print();
    });
}
/* POPUPOFERTA */
function setupPopupOferta() {
    const popup = document.getElementById('popup-oferta');
    const btnCerrar = popup?.querySelector('.modal-cerrar');
    const btnLogin = popup?.querySelector('.btn-oferta-login');
    
    // 🔥 ELIMINADO: const haVistoPopup = localStorage.getItem('kioscoPopupVisto');

    // 1. Mostrar el popup SIEMPRE al cargar
    // La condición ahora solo verifica si el popup existe en el DOM
    if (popup) {
        // Retraso para que la página cargue primero
        setTimeout(() => {
            popup.classList.remove('oculto');
            
            // 🔥 ELIMINADO: localStorage.setItem('kioscoPopupVisto', 'true');
            
        }, 1500); // Aparece después de 1.5 segundos
    }

    // 2. Función para cerrar y establecer el foco
    function cerrarPopup() {
        // Aseguramos que el popup exista antes de manipular clases
        if (popup) {
            popup.classList.add('oculto');
        }
    }

    // 3. Event Listeners
    if (btnCerrar) {
        btnCerrar.addEventListener('click', cerrarPopup);
    }
    
    // Cerrar al hacer clic en el botón de login y redirigir
    if (btnLogin) {
        btnLogin.addEventListener('click', (e) => {
            e.preventDefault();
            cerrarPopup();
            // Redirigir al login
            window.location.href = 'index.html#login-section'; 
        });
    }

    // Permitir cerrar con la tecla ESC
    document.addEventListener('keydown', (e) => {
        // La condición verifica si el popup existe y no está ya oculto
        if (popup && e.key === 'Escape' && !popup.classList.contains('oculto')) {
            cerrarPopup();
        }
    });
}

/**
 * =========================================================
 * 3. INICIALIZACIÓN PRINCIPAL
 * Solo ejecuta las funciones de setup al cargar el DOM.
 * =========================================================
 */
document.addEventListener('DOMContentLoaded', () => {
    // Componentes del Menú (Menu.html)
    setupPopupOferta();
    setupMenuMovil();
    setupBusquedaYFiltro();
    setupCarruselBanners();
    setupMiniCarrito();
    
    // Componentes del Carrito (Carrito.html)
    setupCarritoCompleto();
    setupPagoYTicket();
});