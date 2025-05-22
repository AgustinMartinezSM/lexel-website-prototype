// js/main.js

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM completamente cargado y analizado. Iniciando scripts de Lexel.");

    function mostrarToast(mensaje, duracion = 3000) {
        // Remover toast existente si lo hay
        const toastExistente = document.querySelector('.toast-notification');
        if (toastExistente) {
            toastExistente.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = mensaje;
        document.body.appendChild(toast);

        // Forzar reflow para que la transicion de entrada funcione
        // setTimeout para asegurar que el elemento este en el DOM antes de anadir 'show'
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            // Esperar que la transicion de salida termine antes de remover el elemento
            toast.addEventListener('transitionend', function handler() {
                toast.removeEventListener('transitionend', handler);
                if (toast.parentNode) { // Verificar si aun existe por si se creo otro toast
                   toast.remove();
                }
            });
        }, duracion);
    }

    // --- FUNCION UTILITARIA GLOBAL ---
    function esEmailValido(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    // Funciones genericas para mostrar/limpiar errores en formularios (usadas por Contacto, Reparaciones, Distribuidores)
    function mostrarErrorEnForm(formElement, campoId, mensaje) {
        if (!formElement) return;
        const campo = formElement.querySelector(`#${campoId}`);
        if (campo) {
            const formGrupo = campo.closest('.form-grupo');
            if (formGrupo) {
                const mensajeErrorEl = formGrupo.querySelector('.mensaje-error');
                if (mensajeErrorEl) mensajeErrorEl.textContent = mensaje;
            }
        }
    }

    function limpiarErroresFormulario(formElement) {
        if (formElement) {
            const mensajesError = formElement.querySelectorAll('.form-grupo .mensaje-error');
            mensajesError.forEach(el => el.textContent = '');
        }
    }

    // --- INICIO LOGICA MODO OSCURO ---
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    const iconMoon = darkModeToggle ? darkModeToggle.querySelector('.icon-moon') : null;
    const iconSun = darkModeToggle ? darkModeToggle.querySelector('.icon-sun') : null;

    function aplicarTema(tema) {
        if (tema === 'dark') {
            body.classList.add('dark-mode');
            if (iconMoon) iconMoon.style.display = 'none';
            if (iconSun) iconSun.style.display = 'inline';
            if (darkModeToggle) darkModeToggle.setAttribute('aria-label', 'Activar modo claro');
        } else {
            body.classList.remove('dark-mode');
            if (iconMoon) iconMoon.style.display = 'inline';
            if (iconSun) iconSun.style.display = 'none';
            if (darkModeToggle) darkModeToggle.setAttribute('aria-label', 'Activar modo oscuro');
        }
    }

    if (darkModeToggle) {
        let temaGuardado = localStorage.getItem('lexel-theme');
        const prefiereOscuroSistema = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (temaGuardado) {
            aplicarTema(temaGuardado);
        } else if (prefiereOscuroSistema) {
            aplicarTema('dark');
        } else {
            aplicarTema('light');
        }

        darkModeToggle.addEventListener('click', () => {
            let nuevoTema = body.classList.contains('dark-mode') ? 'light' : 'dark';
            localStorage.setItem('lexel-theme', nuevoTema);
            aplicarTema(nuevoTema);
        });
    } else {
        console.warn("Boton darkModeToggle no encontrado.");
    }
    // --- FIN LOGICA MODO OSCURO ---

    // --- INICIO LOGICA MENU HAMBURGUESA ---
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNavUl = document.querySelector('.main-navigation ul');
    if (menuToggle && mainNavUl) {
        menuToggle.addEventListener('click', function() {
            mainNavUl.classList.toggle('active');
        });
    } else {
        if (!menuToggle) console.warn("Boton menuToggle no encontrado.");
        if (!mainNavUl) console.warn("Lista de navegacion principal (ul) no encontrada.");
    }
    // --- FIN LOGICA MENU HAMBURGUESA ---

    // --- INICIO LOGICA GLOBAL DEL CARRITO DE COMPRAS ---
    const NOMBRE_LOCALSTORAGE_CARRITO = 'lexelCarrito';

    function obtenerCarrito() {
        const carritoGuardado = localStorage.getItem(NOMBRE_LOCALSTORAGE_CARRITO);
        return carritoGuardado ? JSON.parse(carritoGuardado) : [];
    }

    function guardarCarrito(carrito) {
        localStorage.setItem(NOMBRE_LOCALSTORAGE_CARRITO, JSON.stringify(carrito));
    }

    function actualizarContadorCarrito() {
        const carrito = obtenerCarrito();
        const cartItemCountEl = document.getElementById('cartItemCount');
        if (cartItemCountEl) {
            const cantidadTotalUnidades = carrito.reduce((total, item) => total + (item.cantidad || 0), 0);
            cartItemCountEl.textContent = cantidadTotalUnidades;
        }
    }

    function agregarAlCarrito(productoId, origenDatosNombreArray, modeloSeleccionado = null) {
        let productoAAnadir = null;
        let fuenteProductos;

        if (origenDatosNombreArray === 'catalogoMayoristaLexel' && typeof catalogoMayoristaLexel !== 'undefined') {
            fuenteProductos = catalogoMayoristaLexel;
        } else if (origenDatosNombreArray === 'todosLosProductos' && typeof todosLosProductos !== 'undefined') {
            fuenteProductos = todosLosProductos;
        } else {
            console.error("Fuente de datos de productos ('", origenDatosNombreArray, "') no definida o no accesible globalmente.");
            alert("Error: No se pudo acceder a los datos del producto.");
            return;
        }

        productoAAnadir = fuenteProductos.find(p => p.id === productoId);

        if (!productoAAnadir) {
            console.error("Producto no encontrado (ID:", productoId, ") en la fuente:", origenDatosNombreArray);
            alert("Error: Producto no encontrado.");
            return;
        }

        const carrito = obtenerCarrito();
        let idItemCarrito = productoId;
        let nombreItemCarrito = productoAAnadir.nombre || 'Artículo Desconocido';

        if ((productoAAnadir.tipoArticulo === 'funda' || productoAAnadir.tipoArticulo === 'templado') && modeloSeleccionado) {
            idItemCarrito = `${productoId}-${modeloSeleccionado.toLowerCase().replace(/\s+/g, '-')}`;
            nombreItemCarrito = `${productoAAnadir.nombre} (Modelo: ${modeloSeleccionado})`;
        } else if (productoAAnadir.tipoArticulo === 'repuesto') {
            nombreItemCarrito = `${productoAAnadir.tipoRepuesto || ''} - ${productoAAnadir.marcaCelular || ''} ${productoAAnadir.modeloCelular || ''}`.trim();
            if (nombreItemCarrito === "-") nombreItemCarrito = "Repuesto Generico";
        }

        const itemExistente = carrito.find(item => item.id === idItemCarrito);

        if (itemExistente) {
            itemExistente.cantidad++;
        } else {
            let imagenFinal = 'placeholder-producto.png';
            if (Array.isArray(productoAAnadir.imagenes) && productoAAnadir.imagenes.length > 0) {
                imagenFinal = productoAAnadir.imagenes[0];
            } else if (productoAAnadir.imagen) {
                imagenFinal = productoAAnadir.imagen;
            } else if (productoAAnadir.imagenPlaceholder) {
                imagenFinal = productoAAnadir.imagenPlaceholder;
            }
            carrito.push({
                id: idItemCarrito,
                nombre: nombreItemCarrito,
                precio: productoAAnadir.precio || 0,
                cantidad: 1,
                imagen: imagenFinal,
                origenDatos: origenDatosNombreArray,
                productoOriginalId: productoId,
                modeloEspecifico: (productoAAnadir.tipoArticulo === 'funda' || productoAAnadir.tipoArticulo === 'templado') ? modeloSeleccionado : (productoAAnadir.modeloCelular || null),
                tipoArticuloOriginal: productoAAnadir.tipoArticulo
            });
        }
        guardarCarrito(carrito);
        actualizarContadorCarrito();
        mostrarToast(`"${nombreMostrar || 'Articulo'}" añadido al carrito!`); // NUEVA LINEA
            console.log("Carrito actualizado:", obtenerCarrito());
    }

    actualizarContadorCarrito();
    // --- FIN LOGICA GLOBAL DEL CARRITO DE COMPRAS ---

    // --- INICIO LOGICA DE AUTENTICACION Y SESION (SIMULADA) ---
    const NOMBRE_LOCALSTORAGE_USUARIO = 'lexelUsuarioLogueado';
    const usuariosRegistrados = [
        { email: 'admin@lexel.com', password: 'adminpassword', nombre: 'Admin Lexel', rol: 'admin' },
        { email: 'dev@lexel.com', password: 'devpassword', nombre: 'Desarrollador', rol: 'dev' },
        { email: 'cliente@ejemplo.com', password: 'clientepassword', nombre: 'Cliente Ejemplo', rol: 'usuario' }
    ];

    function guardarSesionUsuario(usuario) { localStorage.setItem(NOMBRE_LOCALSTORAGE_USUARIO, JSON.stringify(usuario)); }
    function obtenerSesionUsuario() { const usuarioGuardado = localStorage.getItem(NOMBRE_LOCALSTORAGE_USUARIO); return usuarioGuardado ? JSON.parse(usuarioGuardado) : null; }
    function cerrarSesionUsuario() {
        localStorage.removeItem(NOMBRE_LOCALSTORAGE_USUARIO);
        actualizarVistaHeader();
        const pathParts = window.location.pathname.split('/');
        const currentPageFile = pathParts.pop() || 'index.html';
        const isInsidePagesFolder = pathParts.some(part => part === 'pages');
        let indexPath = "index.html";
        if (isInsidePagesFolder) indexPath = "../index.html";
        if (window.location.pathname !== indexPath && !(window.location.pathname.endsWith('/') && indexPath === "index.html") ) {
             window.location.href = indexPath;
        } else { window.location.reload(); }
    }

    function actualizarVistaHeader() {
        const usuarioActual = obtenerSesionUsuario();
        const headerActionsContainer = document.querySelector('.header-actions');
        if (!headerActionsContainer) return;
        const bienvenidaExistente = document.getElementById('mensajeBienvenidaHeader');
        const panelAdminLinkExistente = document.getElementById('linkPanelAdminHeader');
        const cerrarSesionBtnExistente = document.getElementById('btnCerrarSesionHeader');
        const loginLinkExistente = document.getElementById('linkLoginHeader');
        if (bienvenidaExistente) bienvenidaExistente.remove();
        if (panelAdminLinkExistente) panelAdminLinkExistente.remove();
        if (cerrarSesionBtnExistente) cerrarSesionBtnExistente.remove();
        if (loginLinkExistente) loginLinkExistente.remove();
        const primerElementoFijo = headerActionsContainer.querySelector('.cart-icon-link');
        if (usuarioActual) {
            const fragment = document.createDocumentFragment();
            if (usuarioActual.rol === 'admin' || usuarioActual.rol === 'dev') {
                const linkPanelAdmin = document.createElement('a'); linkPanelAdmin.id = 'linkPanelAdminHeader';
                const basePathAdmin = window.location.pathname.includes('/pages/') ? '' : 'pages/';
                linkPanelAdmin.href = `${basePathAdmin}admin.html`; linkPanelAdmin.className = 'btn btn-secondary btn-sm-padding'; linkPanelAdmin.textContent = 'Panel Admin';
                fragment.appendChild(linkPanelAdmin);
            }
            const mensajeBienvenida = document.createElement('span'); mensajeBienvenida.id = 'mensajeBienvenidaHeader'; mensajeBienvenida.className = 'mensaje-bienvenida-header'; mensajeBienvenida.textContent = `Hola, ${usuarioActual.nombre}!`; fragment.appendChild(mensajeBienvenida);
            const btnCerrarSesion = document.createElement('button'); btnCerrarSesion.id = 'btnCerrarSesionHeader'; btnCerrarSesion.className = 'btn btn-outline btn-sm-padding'; btnCerrarSesion.textContent = 'Cerrar Sesion'; btnCerrarSesion.type = 'button'; btnCerrarSesion.addEventListener('click', function(e) { e.preventDefault(); cerrarSesionUsuario(); }); fragment.appendChild(btnCerrarSesion);
            if (primerElementoFijo) headerActionsContainer.insertBefore(fragment, primerElementoFijo);
            else headerActionsContainer.appendChild(fragment);
        } else {
            const linkLogin = document.createElement('a'); linkLogin.id = 'linkLoginHeader';
            const currentPagePath = window.location.pathname; let loginPath = "pages/login.html";
            if (currentPagePath.includes("/pages/")) loginPath = "login.html";
            else if (currentPagePath.endsWith("index.html") || currentPagePath.endsWith("/")) loginPath = "pages/login.html";
            linkLogin.href = loginPath; linkLogin.className = 'btn btn-outline btn-sm-padding'; linkLogin.textContent = 'Iniciar Sesion';
            if (primerElementoFijo) headerActionsContainer.insertBefore(linkLogin, primerElementoFijo);
            else headerActionsContainer.appendChild(linkLogin);
        }
    }
    actualizarVistaHeader();
    // --- FIN LOGICA DE AUTENTICACION Y SESION ---

    // --- INICIO LOGICA ACTUALIZAR ANO EN FOOTER ---
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
    // --- FIN LOGICA ACTUALIZAR ANO EN FOOTER ---

    // --- Logica para la pagina de LOGIN ---
    if (document.querySelector('.pagina-login-body')) {
        console.log("Pagina Login detectada.");
            const loginForm = document.getElementById('loginForm');
            const loginErrorMessageEl = document.getElementById('loginErrorMessage');

            // 'usuariosRegistrados' deberia estar definido globalmente dentro del DOMContentLoaded
            // o ser pasado/importado si estuvieramos usando modulos.
            // Por ahora, la estructura que te di lo define globalmente dentro del DOMContentLoaded.

            if (loginForm && loginErrorMessageEl) { // Verificar que los elementos principales del form existan
                loginForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    loginErrorMessageEl.style.display = 'none'; // Ocultar mensaje de error general previo
                    loginErrorMessageEl.textContent = ''; // Limpiar texto del mensaje de error general

                    // Usar la funcion generica para limpiar errores de campos individuales
                    if (typeof limpiarErroresFormulario === "function") {
                        limpiarErroresFormulario(loginForm);
                    } else {
                        // Fallback o definir una version local de limpiarErrores para este form si es necesario
                        loginForm.querySelectorAll('.form-grupo .mensaje-error').forEach(el => el.textContent = '');
                    }


                    const emailInput = document.getElementById('loginEmail');
                    const passwordInput = document.getElementById('loginPassword');

                    if (!emailInput || !passwordInput) {
                        console.error("Campos de email o password no encontrados en el formulario de login.");
                        if(loginErrorMessageEl) {
                            loginErrorMessageEl.textContent = "Error en el formulario. Intenta de nuevo.";
                            loginErrorMessageEl.style.display = 'block';
                        }
                        return;
                    }

                    const email = emailInput.value.trim();
                    const password = passwordInput.value; // No trimear passwords

                    let usuarioEncontrado = null;
                    if (typeof usuariosRegistrados !== 'undefined' && Array.isArray(usuariosRegistrados)) {
                        for (let i = 0; i < usuariosRegistrados.length; i++) {
                            if (usuariosRegistrados[i].email.toLowerCase() === email.toLowerCase() && usuariosRegistrados[i].password === password) {
                                usuarioEncontrado = usuariosRegistrados[i];
                                break;
                            }
                        }
                    } else {
                        console.error("'usuariosRegistrados' no esta definido o no es un array.");
                        if(loginErrorMessageEl) {
                            loginErrorMessageEl.textContent = "Error de configuracion. Intenta mas tarde.";
                            loginErrorMessageEl.style.display = 'block';
                        }
                        return;
                    }


                    if (usuarioEncontrado) {
                        console.log("Login exitoso para:", usuarioEncontrado.email);
                        if (typeof guardarSesionUsuario === "function") {
                            guardarSesionUsuario(usuarioEncontrado);
                        } else {
                            console.error("Funcion guardarSesionUsuario no definida.");
                            alert("Error al intentar iniciar sesion. Contacta al administrador.");
                            return;
                        }

                        // Redirigir al index.html de la raiz del proyecto
                        let indexPath = "../index.html"; // Asumiendo que login.html esta en pages/
                         if (!window.location.pathname.includes('/pages/')) { // Si login.html estuviera en la raiz
                            indexPath = "index.html";
                         }
                        window.location.href = indexPath;
                    } else {
                        console.log("Credenciales incorrectas.");
                        loginErrorMessageEl.textContent = "Correo electronico o contraseña incorrectos.";
                        loginErrorMessageEl.style.display = 'block';
                        // Opcional: si tuvieras 'mostrarErrorEnForm' adaptado para login:
                        // if (typeof mostrarErrorEnForm === "function") {
                        //    mostrarErrorEnForm(loginForm, 'loginEmail', ''); // Limpia si el error es general
                        //    mostrarErrorEnForm(loginForm, 'loginPassword', '');
                        // }
                    }
                });
            } else {
                if (!loginForm) console.warn("Formulario 'loginForm' no encontrado en pagina-login.");
                if (!loginErrorMessageEl) console.warn("Elemento 'loginErrorMessageEl' no encontrado en pagina-login.");
            }

            const linkOlvide = document.getElementById('linkOlvideContrasena');
            const linkRegistrarse = document.getElementById('linkRegistrarse');
            if(linkOlvide) {
                linkOlvide.addEventListener('click', (e) => {
                    e.preventDefault();
                    alert("Funcionalidad de recuperacion de contraseña no implementada en este prototipo.");
                });
            }
            if(linkRegistrarse) {
                linkRegistrarse.addEventListener('click', (e) => {
                    e.preventDefault();
                    alert("Funcionalidad de registro no implementada. Use las credenciales de prueba.");
                });
            }
              }


    // --- Logica para la pagina de PRODUCTOS ---
    if (document.querySelector('.pagina-productos')) {
        console.log("PAGINA PRODUCTOS DETECTADA - Iniciando logica con paginacion.");

        const productsGridContainer = document.getElementById('productsGridContainer');
        const cantidadResultadosEl = document.querySelector('.productos-header-grilla .cantidad-resultados');
        const paginationControlsContainer = document.querySelector('#paginacionProductos ul');

        const enlacesCategorias = document.querySelectorAll('.lista-categorias a');
        const checkboxesMarca = document.querySelectorAll('#filtrosMarca input[type="checkbox"]');
        const inputPrecioMin = document.getElementById('precioMin');
        const inputPrecioMax = document.getElementById('precioMax');
        const btnAplicarPrecio = document.getElementById('btnAplicarPrecio');
        const selectOrdenar = document.getElementById('ordenarProductos');
        const limpiarFiltrosBtn = document.getElementById('limpiarFiltrosBtn');
        const searchInput = document.getElementById('searchInput');

        let currentPage = 1;
        const itemsPerPage = 6; // Productos por pagina (puedes ajustar este valor)
        let productosFiltradosGlobal = [];

        let filtrosAplicados = {
            categoria: 'todos',
            marcas: [],
            precioMin: null,
            precioMax: null,
            orden: 'defecto',
            searchTerm: ''
        };

        function renderizarProductosDePagina(productosParaEstaPagina) {
            if (!productsGridContainer) {
                console.error("Contenedor de grilla 'productsGridContainer' no encontrado.");
                return;
            }
            productsGridContainer.innerHTML = '';

            if (productosParaEstaPagina.length === 0 && currentPage === 1) {
                productsGridContainer.innerHTML = '<p class="no-productos">No se encontraron productos que coincidan con tu busqueda.</p>';
            } else {
                productosParaEstaPagina.forEach(producto => {
                    let imagenFuente = 'imagen-default.png';
                    if (producto.imagenes && Array.isArray(producto.imagenes) && producto.imagenes.length > 0) {
                        imagenFuente = producto.imagenes[0];
                    } else if (producto.imagen) {
                        imagenFuente = producto.imagen;
                    }

                    // Construir la ruta de la imagen. Asumimos que esta en pages/ y las imagenes en ../images/productos/
                    // Si 'imagenFuente' ya es una URL completa o un placeholder de via.placeholder.com, no se anade el path.
                    let imagenTag = `<span>${imagenFuente}</span>`; // Fallback si no es una imagen "real"
                    if (imagenFuente && !imagenFuente.startsWith('http') && !imagenFuente.startsWith('data:image')) {
                        // Es un nombre de archivo, construimos la ruta
                         imagenTag = `<img src="../images/productos/${imagenFuente}" alt="${producto.nombre || 'Producto'}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='<span>${imagenFuente}</span>';">`;
                    } else if (imagenFuente && imagenFuente.startsWith('http')) {
                        // Es una URL completa (ej. via.placeholder.com)
                        imagenTag = `<img src="${imagenFuente}" alt="${producto.nombre || 'Producto'}" style="width:100%; height:100%; object-fit:cover;">`;
                    }


                    const productoCardHTML = `
                        <div class="product-card" data-id="${producto.id}" data-category="${(producto.categoria || '').toLowerCase()}" data-marca="${(producto.marca || '').toLowerCase()}">
                            <div class="product-image-placeholder">
                                ${imagenTag}
                            </div>
                            <h4>${producto.nombre || 'Nombre no disponible'}</h4>
                            <p class="price">$${(producto.precio || 0).toLocaleString('es-AR')}</p>
                            <div class="product-card-actions">
                                <a href="producto-detalle-ejemplo.html?id=${producto.id}" class="btn btn-tertiary btn-sm-padding">Ver Detalles</a>
                                <button class="btn btn-primary btn-sm-padding btn-anadir-carrito-lista" data-product-id="${producto.id}">
                                    Añadir <span class="cart-icon-btn-sm">🛒</span>
                                </button>
                            </div>
                        </div>
                    `;
                    productsGridContainer.insertAdjacentHTML('beforeend', productoCardHTML);
                });
                agregarListenersBotonesCarritoLista();
            }
        }

        function renderizarControlesPaginacion(totalItems) {
            if (!paginationControlsContainer) return;
            paginationControlsContainer.innerHTML = '';
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            if (totalPages <= 1) { actualizarMensajeResultados(totalItems, totalItems > 0 ? 1: 0, totalItems); return; }

            const prevLi = document.createElement('li');
            const prevLink = document.createElement('a');
            prevLink.href = '#';
            prevLink.innerHTML = '&laquo; Anterior';
            prevLink.classList.add('prev');
            if (currentPage === 1) prevLink.classList.add('disabled');
            prevLink.addEventListener('click', (e) => { e.preventDefault(); if (currentPage > 1) { currentPage--; actualizarVistaDePagina(); }});
            prevLi.appendChild(prevLink);
            paginationControlsContainer.appendChild(prevLi);

            for (let i = 1; i <= totalPages; i++) {
                const pageLi = document.createElement('li');
                const pageLink = document.createElement('a');
                pageLink.href = '#';
                pageLink.textContent = i;
                if (i === currentPage) pageLink.classList.add('active');
                pageLink.addEventListener('click', (e) => { e.preventDefault(); currentPage = i; actualizarVistaDePagina(); });
                pageLi.appendChild(pageLink);
                paginationControlsContainer.appendChild(pageLi);
            }

            const nextLi = document.createElement('li');
            const nextLink = document.createElement('a');
            nextLink.href = '#';
            nextLink.innerHTML = 'Siguiente &raquo;';
            nextLink.classList.add('next');
            if (currentPage === totalPages) nextLink.classList.add('disabled');
            nextLink.addEventListener('click', (e) => { e.preventDefault(); if (currentPage < totalPages) { currentPage++; actualizarVistaDePagina(); }});
            nextLi.appendChild(nextLink);
            paginationControlsContainer.appendChild(nextLi);
        }

        function actualizarMensajeResultados(totalFiltrados, mostradosInicio, mostradosFin) {
            if (cantidadResultadosEl) {
                if (totalFiltrados === 0) {
                    cantidadResultadosEl.textContent = 'Mostrando 0 productos';
                } else {
                    cantidadResultadosEl.textContent = `Mostrando ${mostradosInicio}-${mostradosFin} de ${totalFiltrados} productos`;
                }
            }
        }

        function actualizarVistaDePagina() {
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const productosParaEstaPagina = productosFiltradosGlobal.slice(startIndex, endIndex);

            renderizarProductosDePagina(productosParaEstaPagina);
            renderizarControlesPaginacion(productosFiltradosGlobal.length);

            const primerItem = productosFiltradosGlobal.length > 0 ? startIndex + 1 : 0;
            const ultimoItem = Math.min(endIndex, productosFiltradosGlobal.length);
            actualizarMensajeResultados(productosFiltradosGlobal.length, primerItem, ultimoItem);

            // Scroll al inicio de la grilla de productos (o un poco mas arriba)
                const grillaProductosEl = document.getElementById('productsGridContainer');
                if (grillaProductosEl) {
                    // Opcional: si tienes un elemento especifico al que scrollear, como el .productos-header-grilla
                    const elementoScroll = document.querySelector('.productos-header-grilla') || grillaProductosEl;
                    elementoScroll.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
        }

        function aplicarFiltrosYOrdenar() {
            if (typeof todosLosProductos === 'undefined' || !Array.isArray(todosLosProductos)) {
                console.error("todosLosProductos no esta definido o no es un array en aplicarFiltrosYOrdenar");
                productosFiltradosGlobal = [];
                currentPage = 1;
                actualizarVistaDePagina();
                return;
            }
            let productosTemporales = [...todosLosProductos];
            const termino = (filtrosAplicados.searchTerm || '').toLowerCase();
            if (termino) {
                productosTemporales = productosTemporales.filter(producto =>
                    (producto.nombre || '').toLowerCase().includes(termino) ||
                    (producto.marca || '').toLowerCase().includes(termino) ||
                    (producto.categoria || '').toLowerCase().includes(termino) ||
                    (producto.descripcionCorta || '').toLowerCase().includes(termino)
                );
            }
            if (filtrosAplicados.categoria && filtrosAplicados.categoria !== 'todos') { productosTemporales = productosTemporales.filter(producto => producto.categoria && producto.categoria.toLowerCase() === filtrosAplicados.categoria ); }
            if (filtrosAplicados.marcas && filtrosAplicados.marcas.length > 0) { productosTemporales = productosTemporales.filter(producto => producto.marca && filtrosAplicados.marcas.includes(producto.marca.toLowerCase()) ); }
            if (filtrosAplicados.precioMin !== null) { productosTemporales = productosTemporales.filter(producto => typeof producto.precio === 'number' && producto.precio >= filtrosAplicados.precioMin ); }
            if (filtrosAplicados.precioMax !== null) { productosTemporales = productosTemporales.filter(producto => typeof producto.precio === 'number' && producto.precio <= filtrosAplicados.precioMax ); }

            if (filtrosAplicados.orden) {
                switch (filtrosAplicados.orden) {
                    case 'precio-asc': productosTemporales.sort((a, b) => (a.precio || 0) - (b.precio || 0)); break;
                    case 'precio-desc': productosTemporales.sort((a, b) => (b.precio || 0) - (a.precio || 0)); break;
                    case 'nombre-asc': productosTemporales.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '')); break;
                    case 'nombre-desc': productosTemporales.sort((a, b) => (b.nombre || '').localeCompare(a.nombre || '')); break;
                }
            }
            productosFiltradosGlobal = productosTemporales;
            currentPage = 1;
            actualizarVistaDePagina();
        }

        if (searchInput) { searchInput.addEventListener('input', function() { filtrosAplicados.searchTerm = this.value.trim(); aplicarFiltrosYOrdenar(); }); }
        if (enlacesCategorias) { enlacesCategorias.forEach(enlace => { enlace.addEventListener('click', function(e) { e.preventDefault(); enlacesCategorias.forEach(el => el.classList.remove('active-category')); this.classList.add('active-category'); filtrosAplicados.categoria = this.getAttribute('data-category').toLowerCase(); aplicarFiltrosYOrdenar(); }); }); }
        if (checkboxesMarca) { checkboxesMarca.forEach(checkbox => { checkbox.addEventListener('change', function() { filtrosAplicados.marcas = []; checkboxesMarca.forEach(cb => { if (cb.checked) { filtrosAplicados.marcas.push(cb.value.toLowerCase()); } }); aplicarFiltrosYOrdenar(); }); }); }
        if (btnAplicarPrecio && inputPrecioMin && inputPrecioMax) { btnAplicarPrecio.addEventListener('click', function() { const min = parseFloat(inputPrecioMin.value); const max = parseFloat(inputPrecioMax.value); filtrosAplicados.precioMin = !isNaN(min) && min >= 0 ? min : null; filtrosAplicados.precioMax = !isNaN(max) && max >= 0 ? max : null; if (filtrosAplicados.precioMin !== null && filtrosAplicados.precioMax !== null && filtrosAplicados.precioMin > filtrosAplicados.precioMax) { alert("El precio minimo no puede ser mayor que el precio maximo."); inputPrecioMin.value = ''; inputPrecioMax.value = ''; filtrosAplicados.precioMin = null; filtrosAplicados.precioMax = null; } aplicarFiltrosYOrdenar(); }); }
        if (selectOrdenar) { selectOrdenar.addEventListener('change', function() { filtrosAplicados.orden = this.value; aplicarFiltrosYOrdenar(); }); }

        if (limpiarFiltrosBtn) {
            limpiarFiltrosBtn.addEventListener('click', function() {
                filtrosAplicados = { categoria: 'todos', marcas: [], precioMin: null, precioMax: null, orden: 'defecto', searchTerm: '' };
                if (searchInput) searchInput.value = '';
                if (enlacesCategorias) { enlacesCategorias.forEach(el => el.classList.remove('active-category')); const linkTodos = document.querySelector('.lista-categorias a[data-category="todos"]'); if (linkTodos) linkTodos.classList.add('active-category'); }
                if (checkboxesMarca) { checkboxesMarca.forEach(cb => cb.checked = false); }
                if (inputPrecioMin) inputPrecioMin.value = ''; if (inputPrecioMax) inputPrecioMax.value = '';
                if (selectOrdenar) selectOrdenar.value = 'defecto';
                aplicarFiltrosYOrdenar();
            });
        }

        function agregarListenersBotonesCarritoLista() {
            const botonesAnadirCarritoLista = productsGridContainer.querySelectorAll('.btn-anadir-carrito-lista'); // Seleccionar dentro del contenedor correcto
            botonesAnadirCarritoLista.forEach(boton => {
                const nuevoBoton = boton.cloneNode(true);
                if (boton.parentNode) {
                    boton.parentNode.replaceChild(nuevoBoton, boton);
                    nuevoBoton.addEventListener('click', function() {
                        const productoId = this.getAttribute('data-product-id');
                        if(typeof agregarAlCarrito === "function") { // agregarAlCarrito es global
                            agregarAlCarrito(productoId, 'todosLosProductos');
                        } else { console.error("Funcion agregarAlCarrito no definida."); }
                    });
                }
            });
        }

        if (typeof todosLosProductos !== 'undefined' && Array.isArray(todosLosProductos)) {
            const linkTodos = document.querySelector('.lista-categorias a[data-category="todos"]');
            if (linkTodos) linkTodos.classList.add('active-category');
            // productosFiltradosGlobal = [...todosLosProductos]; // Se inicializa en aplicarFiltrosYOrdenar
            aplicarFiltrosYOrdenar(); // Llama para la carga inicial que a su vez llama actualizarVistaDePagina
        } else {
            if (productsGridContainer) productsGridContainer.innerHTML = '<p class="no-productos">No hay productos para mostrar (Error: data no cargada o vacia).</p>';
            if (cantidadResultadosEl) cantidadResultadosEl.textContent = 'Mostrando 0 productos';
            if (paginationControlsContainer) paginationControlsContainer.innerHTML = '';
            console.error("ERROR EN CARGA INICIAL: 'todosLosProductos' no disponible o vacio.");
        }
    } // Fin if (document.querySelector('.pagina-productos'))

    // --- LOGICA PARA LA PAGINA DE DETALLE DEL PRODUCTO ---
    if (document.querySelector('.detalle-producto-pagina')) {
         console.log("Pagina de Detalle de Producto detectada.");

            // Selectores para los datos principales del producto
            const productoNombreEl = document.getElementById('productoNombre');
            const productoCategoriaEl = document.getElementById('productoCategoria');
            const productoMarcaEl = document.getElementById('productoMarca');
            const productoPrecioEl = document.getElementById('productoPrecio');
            const productoDescripcionCortaEl = document.getElementById('productoDescripcionCorta');
            const productoStockEl = document.getElementById('productoStock');
            const productoDescripcionCompletaEl = document.getElementById('productoDescripcionCompleta');

            // Selectores para la GALERIA DE IMAGENES
            const imagenPrincipalEl = document.getElementById('imagenPrincipalProducto');
            const thumbnailsContenedorEl = document.getElementById('productoThumbnailsContenedor');

            // Selectores para PRODUCTOS RELACIONADOS
            const relacionadosSeccionEl = document.getElementById('productosRelacionadosSeccion');
            const relatedProductsGridContainer = document.getElementById('relatedProductsGridContainer');

            // Selectores de estado y UI general de la pagina de detalle
            const btnAnadirAlCarritoDetalle = document.getElementById('btnAnadirAlCarritoDetalle'); // Asumiendo que este es el ID del boton en tu HTML
            const infoProductoLoadingEl = document.getElementById('infoProductoLoading');
            const infoProductoErrorEl = document.getElementById('infoProductoError');
            const productoDetalleContenedorEl = document.getElementById('productoDetalleContenedor');
            const navProductosLink = document.getElementById('navProductosLink');

            function mostrarErrorProducto() {
                if (infoProductoLoadingEl) infoProductoLoadingEl.style.display = 'none';
                if (productoDetalleContenedorEl) productoDetalleContenedorEl.style.display = 'none';
                if (relacionadosSeccionEl) relacionadosSeccionEl.style.display = 'none';
                if (infoProductoErrorEl) infoProductoErrorEl.style.display = 'block';
            }

            function popularDatosProducto(producto) {
                if (!producto) {
                    mostrarErrorProducto();
                    return;
                }

                document.title = `${producto.nombre || 'Producto'} - Lexel`;
                if (navProductosLink) { // Marcar "Productos" como activo si vienes de ahi
                    // Es mejor manejar la clase 'active' directamente en el HTML de cada pagina
                    // o tener una logica mas global para el nav, pero para este caso:
                    document.querySelectorAll('.main-navigation ul a.active').forEach(a => a.classList.remove('active'));
                    navProductosLink.classList.add('active');
                }


                if (productoNombreEl) productoNombreEl.textContent = producto.nombre || 'Nombre no disponible';
                if (productoCategoriaEl && producto.categoria) productoCategoriaEl.textContent = producto.categoria.charAt(0).toUpperCase() + producto.categoria.slice(1);
                else if (productoCategoriaEl) productoCategoriaEl.textContent = 'N/A';

                if (productoMarcaEl && producto.marca) productoMarcaEl.textContent = producto.marca;
                else if (productoMarcaEl) productoMarcaEl.textContent = 'N/A';

                if (productoPrecioEl && typeof producto.precio === 'number') productoPrecioEl.textContent = `$${producto.precio.toLocaleString('es-AR')}`;
                else if (productoPrecioEl) productoPrecioEl.textContent = 'Consultar Precio';

                if (productoDescripcionCortaEl) {
                    productoDescripcionCortaEl.innerHTML = `<p>${producto.descripcionCorta || 'Descripcion breve no disponible.'}</p>`;
                }
                if (productoDescripcionCompletaEl) {
                    // Asumimos que descripcionCompleta puede ser HTML o texto plano.
                    // Si es texto plano y quieres parrafos: producto.descripcionCompleta.split('\n').map(p => `<p>${p}</p>`).join('')
                    productoDescripcionCompletaEl.innerHTML = producto.descripcionCompleta || '<p>Mas detalles sobre este producto proximamente.</p>';
                }

                if (productoStockEl && typeof producto.stock === 'number') {
                    productoStockEl.textContent = producto.stock > 0 ? `${producto.stock} unidades disponibles` : 'Agotado';
                    productoStockEl.className = 'producto-stock-valor ' + (producto.stock > 0 ? 'disponible' : 'agotado');
                } else if (productoStockEl) {
                     productoStockEl.textContent = 'Consultar';
                     productoStockEl.className = 'producto-stock-valor';
                }

                // --- INICIO LOGICA DE GALERIA DE IMAGENES ---
                if (imagenPrincipalEl && thumbnailsContenedorEl && producto.imagenes && Array.isArray(producto.imagenes) && producto.imagenes.length > 0) {
                    const primeraImagen = producto.imagenes[0] || 'placeholder-producto-grande.png';
                    imagenPrincipalEl.src = `../images/productos/${primeraImagen}`;
                    imagenPrincipalEl.alt = producto.nombre || 'Imagen principal del producto';
                    thumbnailsContenedorEl.innerHTML = '';

                    if (producto.imagenes.length > 1) {
                        producto.imagenes.forEach((imgNombre, index) => {
                            const imgPath = `../images/productos/${imgNombre || 'placeholder-thumb.png'}`;
                            const thumbnailImg = document.createElement('img');
                            thumbnailImg.src = imgPath;
                            thumbnailImg.alt = `${producto.nombre || 'Vista'} ${index + 1}`;
                            thumbnailImg.classList.add('thumbnail-item');
                            if (index === 0) {
                                thumbnailImg.classList.add('active');
                            }
                            thumbnailImg.addEventListener('click', function() {
                                imagenPrincipalEl.src = imgPath;
                                thumbnailsContenedorEl.querySelectorAll('.thumbnail-item').forEach(th => th.classList.remove('active'));
                                this.classList.add('active');
                            });
                            thumbnailsContenedorEl.appendChild(thumbnailImg);
                        });
                        thumbnailsContenedorEl.style.display = 'flex';
                    } else {
                        thumbnailsContenedorEl.style.display = 'none';
                    }
                } else if (imagenPrincipalEl) { // Fallback si no hay array 'imagenes' o esta vacio
                    const imagenFallback = producto.imagen || "placeholder-producto-grande.png"; // Usar imagen individual si existe
                    imagenPrincipalEl.src = `../images/productos/${imagenFallback}`;
                    imagenPrincipalEl.alt = producto.nombre || 'Imagen del producto';
                    if (thumbnailsContenedorEl) thumbnailsContenedorEl.style.display = 'none';
                }
                // --- FIN LOGICA DE GALERIA DE IMAGENES ---

                // Boton "Añadir al Carrito" en detalle de producto
                if (btnAnadirAlCarritoDetalle && producto) {
                    const nuevoBtn = btnAnadirAlCarritoDetalle.cloneNode(true); // Limpiar listeners viejos
                     // Asegurar que el boton tenga el texto correcto
                    nuevoBtn.innerHTML = 'Añadir al Carrito <span class="cart-icon-btn">🛒</span>';
                    if(btnAnadirAlCarritoDetalle.parentNode){
                        btnAnadirAlCarritoDetalle.parentNode.replaceChild(nuevoBtn, btnAnadirAlCarritoDetalle);
                    }

                    nuevoBtn.addEventListener('click', function() {
                        if(typeof agregarAlCarrito === "function") { // agregarAlCarrito es global
                            agregarAlCarrito(producto.id, 'todosLosProductos'); // Asumimos que estos productos son de 'todosLosProductos'
                        } else { console.error("Funcion agregarAlCarrito no definida."); }
                    });
                }

                if (infoProductoLoadingEl) infoProductoLoadingEl.style.display = 'none';
                if (infoProductoErrorEl) infoProductoErrorEl.style.display = 'none';
                if (productoDetalleContenedorEl) productoDetalleContenedorEl.style.display = 'grid'; // O el display que corresponda
            }

            function renderizarProductosRelacionados(productos) {
                if (!relatedProductsGridContainer || !relacionadosSeccionEl) return;
                relatedProductsGridContainer.innerHTML = '';
                if (!productos || productos.length === 0) {
                    relacionadosSeccionEl.style.display = 'none';
                    return;
                }
                productos.forEach(prod => {
                    let imagenFuenteRel = 'placeholder-producto.png'; // Fallback general
                    if (prod.imagenes && prod.imagenes.length > 0) {
                        imagenFuenteRel = prod.imagenes[0];
                    } else if (prod.imagen) {
                        imagenFuenteRel = prod.imagen;
                    }

                    let imagenTagRel = `<span>${imagenFuenteRel}</span>`;
                    if (imagenFuenteRel && !imagenFuenteRel.toLowerCase().includes('placeholder') && !imagenFuenteRel.startsWith('http')) {
                         imagenTagRel = `<img src="../images/productos/${imagenFuenteRel}" alt="${prod.nombre || 'Producto Relacionado'}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='<span>${imagenFuenteRel}</span>';">`;
                    } else if (imagenFuenteRel && imagenFuenteRel.startsWith('http')) {
                        imagenTagRel = `<img src="${imagenFuenteRel}" alt="${prod.nombre || 'Producto Relacionado'}" style="width:100%; height:100%; object-fit:cover;">`;
                    }

                    const productoCardHTML = `
                        <div class="product-card">
                            <div class="product-image-placeholder">
                                 ${imagenTagRel}
                            </div>
                            <h4>${prod.nombre || 'Producto Relacionado'}</h4>
                            <p class="price">$${(prod.precio || 0).toLocaleString('es-AR')}</p>
                            <a href="producto-detalle-ejemplo.html?id=${prod.id}" class="btn btn-tertiary btn-sm-padding">Ver Detalles</a>
                        </div>
                    `;
                    relatedProductsGridContainer.insertAdjacentHTML('beforeend', productoCardHTML);
                });
                relacionadosSeccionEl.style.display = 'block';
            }

            const params = new URLSearchParams(window.location.search);
            const productoId = params.get('id');
            console.log("ID de producto de la URL:", productoId);

            if (productoId && typeof todosLosProductos !== 'undefined' && Array.isArray(todosLosProductos)) {
                const productoEncontrado = todosLosProductos.find(p => p.id === productoId);
                if (productoEncontrado) {
                    console.log("Producto encontrado:", productoEncontrado);
                    popularDatosProducto(productoEncontrado);

                    const categoriaActual = (productoEncontrado.categoria || '').toLowerCase();
                    let relacionados = [];
                    if (categoriaActual) {
                        relacionados = todosLosProductos.filter(p =>
                            p.id !== productoId &&
                            p.categoria && p.categoria.toLowerCase() === categoriaActual
                        );
                    }
                    // Aleatorizar y tomar hasta 4
                    relacionados = relacionados.sort(() => 0.5 - Math.random()).slice(0, 4);
                    renderizarProductosRelacionados(relacionados);
                } else {
                    console.error("Producto no encontrado con ID:", productoId);
                    mostrarErrorProducto();
                }
            } else {
                console.error("No se proporciono ID de producto en la URL o 'todosLosProductos' no esta disponible.");
                mostrarErrorProducto();
            }

            // El boton 'btnConsultarProducto' original fue reemplazado por 'btnAnadirAlCarritoDetalle'
            // Si necesitas un boton de consulta separado que abra WhatsApp, anadirias su propio listener.
    }

    // --- LOGICA PARA LA PAGINA DE CATALOGO MAYORISTA ---
    if (document.querySelector('.pagina-catalogo-mayorista')) {
        console.log("Pagina Catalogo Mayorista detectada.");

            // Selectores de elementos del DOM
            const searchCatalogoInput = document.getElementById('searchCatalogoInput');
            const articulosGridContainer = document.getElementById('catalogoMayoristaGrid');
            const cantidadResultadosCatalogoEl = document.querySelector('.cantidad-resultados-catalogo');
            const paginationCatalogoContainer = document.querySelector('#paginacionCatalogo ul');

            // Selectores de Filtros
            const filtroTipoArticuloRadios = document.querySelectorAll('input[name="filtroTipoArticulo"]');
            const selectMarcaCelular = document.getElementById('selectMarcaCelular');
            const inputModeloCelular = document.getElementById('inputModeloCelular');
            const widgetTipoRepuesto = document.getElementById('widgetFiltroTipoRepuesto');
            const selectTipoRepuesto = document.getElementById('selectTipoRepuesto');
            const limpiarFiltrosCatalogoBtn = document.getElementById('limpiarFiltrosCatalogoBtn');
            const selectOrdenarCatalogo = document.getElementById('ordenarCatalogo');

            // Variables de estado y paginacion
            let currentPageCatalogo = 1;
            const itemsPerPageCatalogo = 9;
            let catalogoFiltradoGlobal = [];

            let filtrosCatalogo = {
                tipoArticulo: 'todos',
                marcaCelular: 'todas',
                modeloCelular: '',
                tipoRepuesto: 'todos',
                searchTerm: ''
            };
            let ordenCatalogo = 'defecto';

            // --- FUNCIONES AUXILIARES ---
            function popularFiltroMarcas() {
                if (!selectMarcaCelular || typeof catalogoMayoristaLexel === 'undefined' || !Array.isArray(catalogoMayoristaLexel)) {
                    console.warn("Select de marcas o datos del catalogo no disponibles para popularFiltroMarcas.");
                    if(selectMarcaCelular) selectMarcaCelular.innerHTML = '<option value="todas">Error al cargar marcas</option>';
                    return;
                }
                const marcas = new Set();
                catalogoMayoristaLexel.forEach(item => {
                    if (item.tipoArticulo === 'repuesto' && item.marcaCelular) {
                        marcas.add(item.marcaCelular);
                    } else if (item.marcaCompatiblePredominante && Array.isArray(item.marcaCompatiblePredominante)) {
                        item.marcaCompatiblePredominante.forEach(m => marcas.add(m));
                    }
                });
                selectMarcaCelular.innerHTML = '<option value="todas">Todas las Marcas</option>';
                [...marcas].sort((a, b) => a.localeCompare(b)).forEach(marca => {
                    const option = document.createElement('option');
                    option.value = marca.toLowerCase();
                    option.textContent = marca;
                    selectMarcaCelular.appendChild(option);
                });
            }

            function popularFiltroTiposRepuesto() {
                if (!selectTipoRepuesto || typeof catalogoMayoristaLexel === 'undefined' || !Array.isArray(catalogoMayoristaLexel)) {
                     console.warn("Select de tipo de repuesto o datos del catalogo no disponibles para popularFiltroTiposRepuesto.");
                     if(selectTipoRepuesto) selectTipoRepuesto.innerHTML = '<option value="todos">Error al cargar tipos</option>';
                    return;
                }
                const tipos = new Set();
                catalogoMayoristaLexel.forEach(item => {
                    if (item.tipoArticulo === 'repuesto' && item.tipoRepuesto) {
                        tipos.add(item.tipoRepuesto);
                    }
                });
                selectTipoRepuesto.innerHTML = '<option value="todos">Todos los Tipos</option>';
                [...tipos].sort((a, b) => a.localeCompare(b)).forEach(tipo => {
                    const option = document.createElement('option');
                    option.value = tipo.toLowerCase().replace(/\s+/g, '-');
                    option.textContent = tipo;
                    selectTipoRepuesto.appendChild(option);
                });
            }

            function actualizarVisibilidadFiltroRepuestos() {
                if(widgetTipoRepuesto) {
                    widgetTipoRepuesto.style.display = filtrosCatalogo.tipoArticulo === 'repuesto' ? 'block' : 'none';
                }
            }

            function renderizarArticulosCatalogo(articulosAMostrar) {
                if (!articulosGridContainer) { console.error("Contenedor de grilla del catalogo no encontrado."); return; }
                articulosGridContainer.innerHTML = '';

                if (articulosAMostrar.length === 0) {
                    articulosGridContainer.innerHTML = '<p class="no-articulos-mayorista">No se encontraron articulos con los criterios seleccionados.</p>';
                } else {
                    articulosAMostrar.forEach(item => {
                        let itemHTML = '';
                        let imagenContent = '';
                        let nombreArticulo = item.nombre || '';

                        // Logica para la imagen
                        let imagenPath = '';
                        if (item.imagen) {
                            let carpetaTipo = (item.tipoArticulo || "genericos");
                            if (!carpetaTipo.endsWith('s') && carpetaTipo !== "genericos") { // Asegurar plural para carpetas como fundas, templados, repuestos
                                carpetaTipo += "s";
                            }
                            // Corregir la ruta de imagen si no estas usando subcarpetas por tipo aun
                            // O si las imagenes estan en una carpeta mas generica como 'catalogo-items'
                            // Ejemplo: imagenPath = `../images/catalogo-mayorista/${item.imagen}`;
                            imagenPath = `../images/catalogo-mayorista/${carpetaTipo}/${item.imagen}`;

                            imagenContent = `<img src="${imagenPath}" alt="${item.nombre || item.tipoRepuesto || 'Imagen del articulo'}" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';">`;
                            imagenContent += `<span style="display:none;">${item.imagenPlaceholder || item.nombre || 'Articulo'}</span>`;
                        } else if (item.imagenPlaceholder) {
                            imagenContent = `<span>${item.imagenPlaceholder}</span>`;
                        } else {
                            imagenContent = `<span>${nombreArticulo || 'Imagen no disponible'}</span>`;
                        }

                        // Construir nombre del articulo
                        if (item.tipoArticulo === 'repuesto') {
                            nombreArticulo = `${item.tipoRepuesto || ''} - ${item.marcaCelular || ''} ${item.modeloCelular || ''}`.trim();
                            if (nombreArticulo === "-" || nombreArticulo === "") nombreArticulo = "Repuesto Especifico";
                        } else {
                            nombreArticulo = item.nombre || 'Articulo sin nombre';
                        }

                        // Selector de modelo para fundas y templados
                        let selectorDeModeloHTML = '';
                        if ((item.tipoArticulo === 'funda' || item.tipoArticulo === 'templado') && item.modelosCompatibles && Array.isArray(item.modelosCompatibles) && item.modelosCompatibles.length > 0) {
                            selectorDeModeloHTML = `
                                <div class="item-selector-modelo">
                                    <label for="modelo-${item.id}">Modelo:</label>
                                    <select id="modelo-${item.id}" name="modeloSeleccionado" class="selector-modelo-item">
                                        <option value="">Selecciona un modelo...</option>
                                        ${item.modelosCompatibles.map(modelo => `<option value="${modelo}">${modelo}</option>`).join('')}
                                    </select>
                                </div>
                            `;
                        }

                        itemHTML = `
                            <div class="item-card-mayorista" data-tipo="${item.tipoArticulo}" data-id="${item.id}">
                                <div class="item-imagen-placeholder">${imagenContent}</div>
                                <div class="item-info">
                                    <h4 class="item-nombre">${nombreArticulo}</h4>
                                    ${ (item.tipoArticulo === 'funda' || item.tipoArticulo === 'templado') && item.descripcion ? `<p class="item-descripcion">${item.descripcion}</p>` : ''}
                                    ${ (item.tipoArticulo === 'funda' || item.tipoArticulo === 'templado') && item.material ? `<p class="item-detalle"><strong>Material:</strong> ${item.material}</p>` : ''}
                                    ${ (item.tipoArticulo === 'funda' || item.tipoArticulo === 'templado') && item.caracteristicas && Array.isArray(item.caracteristicas) && item.caracteristicas.length > 0 ? `<p class="item-detalle"><strong>Caracteristicas:</strong> ${item.caracteristicas.join(', ')}</p>` : ''}

                                    ${ (item.tipoArticulo === 'funda' || item.tipoArticulo === 'templado') && item.modelosCompatibles && item.modelosCompatibles.length > 0 && !selectorDeModeloHTML.includes("Selecciona un modelo") ? `<p class="item-modelos"><strong>Modelos:</strong> ${item.modelosCompatibles.join(', ')}</p>` : ''}

                                    ${ item.tipoArticulo === 'repuesto' && item.calidad ? `<p class="item-detalle"><strong>Calidad:</strong> ${item.calidad}</p>` : ''}
                                    ${ item.tipoArticulo === 'repuesto' && item.descripcionAdicional ? `<p class="item-descripcion">${item.descripcionAdicional}</p>` : ''}

                                    ${selectorDeModeloHTML}
                                </div>
                                <div class="item-actions">
                                    <button class="btn btn-primary btn-sm-padding btn-anadir-carrito-catalogo" data-product-id="${item.id}">
                                        Añadir <span class="cart-icon-btn-sm">🛒</span>
                                    </button>
                                </div>
                            </div>
                        `;
                        articulosGridContainer.insertAdjacentHTML('beforeend', itemHTML);
                    });
                    agregarListenersBotonesCarritoCatalogo();
                }
            }

            function renderizarControlesPaginacionCatalogo(totalItems) {
                if (!paginationCatalogoContainer) return;
                paginationCatalogoContainer.innerHTML = '';
                const totalPages = Math.ceil(totalItems / itemsPerPageCatalogo);
                if (totalPages <= 1) { actualizarMensajeResultadosCatalogo(totalItems, totalItems > 0 ? 1 : 0, totalItems); return; }

                const prevLi = document.createElement('li'); const prevLink = document.createElement('a'); prevLink.href = '#'; prevLink.innerHTML = '&laquo; Anterior'; prevLink.classList.add('prev'); if (currentPageCatalogo === 1) prevLink.classList.add('disabled'); prevLink.addEventListener('click', (e) => { e.preventDefault(); if (currentPageCatalogo > 1) { currentPageCatalogo--; actualizarVistaDePaginaCatalogo(); }}); prevLi.appendChild(prevLink); paginationCatalogoContainer.appendChild(prevLi);
                for (let i = 1; i <= totalPages; i++) { const pageLi = document.createElement('li'); const pageLink = document.createElement('a'); pageLink.href = '#'; pageLink.textContent = i; if (i === currentPageCatalogo) pageLink.classList.add('active'); pageLink.addEventListener('click', (e) => { e.preventDefault(); currentPageCatalogo = i; actualizarVistaDePaginaCatalogo(); }); pageLi.appendChild(pageLink); paginationCatalogoContainer.appendChild(pageLi); }
                const nextLi = document.createElement('li'); const nextLink = document.createElement('a'); nextLink.href = '#'; nextLink.innerHTML = 'Siguiente &raquo;'; nextLink.classList.add('next'); if (currentPageCatalogo === totalPages) nextLink.classList.add('disabled'); nextLink.addEventListener('click', (e) => { e.preventDefault(); if (currentPageCatalogo < totalPages) { currentPageCatalogo++; actualizarVistaDePaginaCatalogo(); }}); nextLi.appendChild(nextLink); paginationCatalogoContainer.appendChild(nextLi);
            }

            function actualizarMensajeResultadosCatalogo(totalFiltrados, mostradosInicio, mostradosFin) {
                if (cantidadResultadosCatalogoEl) {
                    if (totalFiltrados === 0) { cantidadResultadosCatalogoEl.textContent = 'Mostrando 0 articulos'; }
                    else { cantidadResultadosCatalogoEl.textContent = `Mostrando ${mostradosInicio}-${mostradosFin} de ${totalFiltrados} articulos`; }
                }
            }

            function actualizarVistaDePaginaCatalogo() {
                const startIndex = (currentPageCatalogo - 1) * itemsPerPageCatalogo;
                const endIndex = startIndex + itemsPerPageCatalogo;
                const articulosParaEstaPagina = catalogoFiltradoGlobal.slice(startIndex, endIndex);
                renderizarArticulosCatalogo(articulosParaEstaPagina);
                renderizarControlesPaginacionCatalogo(catalogoFiltradoGlobal.length);
                const primerItem = catalogoFiltradoGlobal.length > 0 ? startIndex + 1 : 0;
                const ultimoItem = Math.min(endIndex, catalogoFiltradoGlobal.length);
                actualizarMensajeResultadosCatalogo(catalogoFiltradoGlobal.length, primerItem, ultimoItem);

                // Scroll al inicio de la grilla de items
                    const grillaCatalogoEl = document.getElementById('catalogoMayoristaGrid');
                    if (grillaCatalogoEl) {
                        const elementoScrollCatalogo = document.querySelector('.catalogo-header-grilla') || grillaCatalogoEl;
                        elementoScrollCatalogo.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
            }

            function aplicarFiltrosYOrdenarCatalogo() {
                if (typeof catalogoMayoristaLexel === 'undefined' || !Array.isArray(catalogoMayoristaLexel)) { catalogoFiltradoGlobal = []; currentPageCatalogo = 1; actualizarVistaDePaginaCatalogo(); return; }
                let articulosTemporales = [...catalogoMayoristaLexel];
                const terminoBusqueda = (filtrosCatalogo.searchTerm || '').toLowerCase();

                if (terminoBusqueda) {
                    articulosTemporales = articulosTemporales.filter(item => {
                        const nombreArt = item.nombre || (item.tipoArticulo === 'repuesto' ? `${item.tipoRepuesto || ''} ${item.marcaCelular || ''} ${item.modeloCelular || ''}`.trim() : '');
                        return nombreArt.toLowerCase().includes(terminoBusqueda) ||
                               (item.tipoArticulo || '').toLowerCase().includes(terminoBusqueda) ||
                               (item.material || '').toLowerCase().includes(terminoBusqueda) ||
                               (item.tipoRepuesto || '').toLowerCase().includes(terminoBusqueda) ||
                               (item.marcaCelular || '').toLowerCase().includes(terminoBusqueda) ||
                               (item.modeloCelular || '').toLowerCase().includes(terminoBusqueda) ||
                               (item.descripcion || '').toLowerCase().includes(terminoBusqueda) ||
                               (item.descripcionAdicional || '').toLowerCase().includes(terminoBusqueda) ||
                               (item.modelosCompatibles && Array.isArray(item.modelosCompatibles) && item.modelosCompatibles.some(m => m.toLowerCase().includes(terminoBusqueda))) ||
                               (item.caracteristicas && Array.isArray(item.caracteristicas) && item.caracteristicas.some(c => c.toLowerCase().includes(terminoBusqueda)));
                    });
                }
                if (filtrosCatalogo.tipoArticulo !== 'todos') { articulosTemporales = articulosTemporales.filter(item => item.tipoArticulo === filtrosCatalogo.tipoArticulo); }
                if (filtrosCatalogo.marcaCelular !== 'todas') {
                    articulosTemporales = articulosTemporales.filter(item => {
                        if (item.tipoArticulo === 'repuesto') { return (item.marcaCelular || '').toLowerCase() === filtrosCatalogo.marcaCelular; }
                        else if (item.marcaCompatiblePredominante && Array.isArray(item.marcaCompatiblePredominante)) { return item.marcaCompatiblePredominante.some(m => m.toLowerCase() === filtrosCatalogo.marcaCelular); }
                        return false;
                    });
                }
                const modeloBusqueda = (filtrosCatalogo.modeloCelular || '').toLowerCase();
                if (modeloBusqueda) {
                    articulosTemporales = articulosTemporales.filter(item => {
                        if (item.tipoArticulo === 'repuesto') { return (item.modeloCelular || '').toLowerCase().includes(modeloBusqueda); }
                        else if (item.modelosCompatibles && Array.isArray(item.modelosCompatibles)) { return item.modelosCompatibles.some(m => m.toLowerCase().includes(modeloBusqueda)); }
                        return false;
                    });
                }
                if (filtrosCatalogo.tipoArticulo === 'repuesto' && filtrosCatalogo.tipoRepuesto !== 'todos') {
                    articulosTemporales = articulosTemporales.filter(item => item.tipoRepuesto && (item.tipoRepuesto.toLowerCase().replace(/\s+/g, '-') === filtrosCatalogo.tipoRepuesto));
                }

                let nombreA, nombreB;
                switch (ordenCatalogo) {
                    case 'nombre-asc':
                        articulosTemporales.sort((a, b) => {
                            nombreA = a.nombre || (a.tipoArticulo === 'repuesto' ? `${a.tipoRepuesto} ${a.marcaCelular} ${a.modeloCelular}`.trim() : '');
                            nombreB = b.nombre || (b.tipoArticulo === 'repuesto' ? `${b.tipoRepuesto} ${b.marcaCelular} ${b.modeloCelular}`.trim() : '');
                            return nombreA.localeCompare(nombreB);
                        });
                        break;
                    case 'nombre-desc':
                         articulosTemporales.sort((a, b) => {
                            nombreA = a.nombre || (a.tipoArticulo === 'repuesto' ? `${a.tipoRepuesto} ${a.marcaCelular} ${a.modeloCelular}`.trim() : '');
                            nombreB = b.nombre || (b.tipoArticulo === 'repuesto' ? `${b.tipoRepuesto} ${b.marcaCelular} ${b.modeloCelular}`.trim() : '');
                            return nombreB.localeCompare(nombreA);
                        });
                        break;
                }
                catalogoFiltradoGlobal = articulosTemporales;
                currentPageCatalogo = 1;
                actualizarVistaDePaginaCatalogo();
            }

            function agregarListenersBotonesCarritoCatalogo() {
                const botonesAnadirCarrito = articulosGridContainer.querySelectorAll('.btn-anadir-carrito-catalogo');
                botonesAnadirCarrito.forEach(boton => {
                    const nuevoBoton = boton.cloneNode(true);
                    if(boton.parentNode){
                         boton.parentNode.replaceChild(nuevoBoton, boton);
                        nuevoBoton.addEventListener('click', function() {
                            const productoId = this.getAttribute('data-product-id');
                            let modeloSeleccionado = null;
                            const card = this.closest('.item-card-mayorista');
                            const selectorModeloEl = card ? card.querySelector(`.selector-modelo-item`) : null;

                            if (selectorModeloEl && selectorModeloEl.value === "") {
                                alert("Por favor, selecciona un modelo antes de añadir al carrito.");
                                return;
                            } else if (selectorModeloEl && selectorModeloEl.value) {
                                 modeloSeleccionado = selectorModeloEl.value;
                            }
                            if(typeof agregarAlCarrito === "function") {
                                 agregarAlCarrito(productoId, 'catalogoMayoristaLexel', modeloSeleccionado);
                            } else { console.error("Funcion agregarAlCarrito no definida."); }
                        });
                    }
                });
            }

            // Event Listeners
            if (searchCatalogoInput) { searchCatalogoInput.addEventListener('input', function() { filtrosCatalogo.searchTerm = this.value.trim(); aplicarFiltrosYOrdenarCatalogo(); }); }
            if (filtroTipoArticuloRadios) { filtroTipoArticuloRadios.forEach(radio => { radio.addEventListener('change', function() { filtrosCatalogo.tipoArticulo = this.value; actualizarVisibilidadFiltroRepuestos(); filtrosCatalogo.tipoRepuesto = 'todos'; if(selectTipoRepuesto) selectTipoRepuesto.value = 'todos'; aplicarFiltrosYOrdenarCatalogo(); }); }); }
            if (selectMarcaCelular) { selectMarcaCelular.addEventListener('change', function() { filtrosCatalogo.marcaCelular = this.value.toLowerCase(); aplicarFiltrosYOrdenarCatalogo(); }); }
            if (inputModeloCelular) { let timeoutModelo; inputModeloCelular.addEventListener('input', function() { clearTimeout(timeoutModelo); timeoutModelo = setTimeout(() => { filtrosCatalogo.modeloCelular = this.value.trim(); aplicarFiltrosYOrdenarCatalogo(); }, 500); }); }
            if (selectTipoRepuesto) { selectTipoRepuesto.addEventListener('change', function() { filtrosCatalogo.tipoRepuesto = this.value; aplicarFiltrosYOrdenarCatalogo(); }); }
            if (selectOrdenarCatalogo) { selectOrdenarCatalogo.addEventListener('change', function() { ordenCatalogo = this.value; aplicarFiltrosYOrdenarCatalogo(); }); }

            if (limpiarFiltrosCatalogoBtn) {
                limpiarFiltrosCatalogoBtn.addEventListener('click', function() {
                    filtrosCatalogo = { tipoArticulo: 'todos', marcaCelular: 'todas', modeloCelular: '', tipoRepuesto: 'todos', searchTerm: '' };
                    ordenCatalogo = 'defecto';
                    if (searchCatalogoInput) searchCatalogoInput.value = '';
                    const radioTodos = document.querySelector('input[name="filtroTipoArticulo"][value="todos"]'); if(radioTodos) radioTodos.checked = true;
                    if (selectMarcaCelular) selectMarcaCelular.value = 'todas';
                    if (inputModeloCelular) inputModeloCelular.value = '';
                    if (selectTipoRepuesto) selectTipoRepuesto.value = 'todos';
                    if (selectOrdenarCatalogo) selectOrdenarCatalogo.value = 'defecto';
                    actualizarVisibilidadFiltroRepuestos();
                    aplicarFiltrosYOrdenarCatalogo();
                });
            }

            // Inicializacion
            if (typeof catalogoMayoristaLexel !== 'undefined' && Array.isArray(catalogoMayoristaLexel)) {
                popularFiltroMarcas();
                popularFiltroTiposRepuesto();
                actualizarVisibilidadFiltroRepuestos();
                const radioTodos = document.querySelector('input[name="filtroTipoArticulo"][value="todos"]');
                if(radioTodos) radioTodos.checked = true;
                aplicarFiltrosYOrdenarCatalogo();
            } else {
                if(articulosGridContainer) articulosGridContainer.innerHTML = "<p class='no-articulos-mayorista'>El catalogo no esta disponible. Verifica que 'catalogo-mayorista-data.js' este cargado y contenga datos.</p>";
                console.error("catalogoMayoristaLexel no esta definido o no es un array.");
            }
    }

    // --- LOGICA PARA LA PAGINA DEL CARRITO ---
    if (document.querySelector('.pagina-carrito')) {
       console.log("Pagina Carrito detectada.");

           const carritoVacioMensajeEl = document.getElementById('carritoVacioMensaje');
           const carritoItemsContainerEl = document.getElementById('carritoItemsContainer');
           const carritoResumenAccionesEl = document.getElementById('carritoResumenAcciones');

           const carritoSubtotalEl = document.getElementById('carritoSubtotal');
           const carritoTotalGeneralEl = document.getElementById('carritoTotalGeneral');
           const opcionEnvioSeleccionadaEl = document.getElementById('opcionEnvioSeleccionada');

           const vaciarCarritoBtn = document.getElementById('vaciarCarritoBtn');

           // Selectores para el nuevo formulario de opciones y botones de envio
           const pedidoOpcionesFormEl = document.getElementById('pedidoOpcionesForm');
           const pedidoNombreInput = document.getElementById('pedidoNombre');
           const generarMensajePedidoBtn = document.getElementById('generarMensajePedidoBtn');
           const pedidoFormStatusMessageEl = document.getElementById('pedidoFormStatusMessage');

           const accionesEnvioMensajeEl = document.getElementById('accionesEnvioMensaje');
           const mensajePedidoPreviewEl = document.getElementById('mensajePedidoPreview');
           const enviarWhatsAppBtn = document.getElementById('enviarWhatsAppBtn');
           const enviarEmailBtn = document.getElementById('enviarEmailBtn');
           const modificarPedidoBtn = document.getElementById('modificarPedidoBtn');

           const cartIconLink = document.querySelector('.cart-icon-link');

           // Asegurarse que las variables de contacto esten definidas (pueden ser globales o redefinidas aqui si es necesario)
           const WHATSAPP_LEXEL = "5492235481073";
           const EMAIL_LEXEL_CARRITO = "leonardosanguineri@gmail.com";

           if (cartIconLink) {
               document.querySelectorAll('.main-navigation ul a.active, .header-actions a.cart-icon-link.active-cart').forEach(a => {
                   if (!a.isSameNode(cartIconLink)) { // No quitar 'active' del propio link del carrito si lo tuviera
                       a.classList.remove('active');
                   }
                   a.classList.remove('active-cart');
               });
               cartIconLink.classList.add('active-cart');
           }

           function actualizarCantidadItem(productoId, nuevaCantidad) {
               let carrito = obtenerCarrito();
               const itemIndex = carrito.findIndex(item => item.id === productoId);

               if (itemIndex > -1) {
                   if (nuevaCantidad > 0) {
                       carrito[itemIndex].cantidad = nuevaCantidad;
                   } else {
                       carrito.splice(itemIndex, 1);
                   }
                   guardarCarrito(carrito);
                   actualizarContadorCarrito();
                   renderizarPaginaCarrito();
               }
           }

           function eliminarItemDelCarrito(productoId) {
               let carrito = obtenerCarrito();
               carrito = carrito.filter(item => item.id !== productoId);
               guardarCarrito(carrito);
               actualizarContadorCarrito();
               renderizarPaginaCarrito();
           }

           function calcularYMostrarTotales() {
               const carrito = obtenerCarrito();
               let subtotal = 0;
               carrito.forEach(item => { subtotal += (item.precio || 0) * item.cantidad; });
               const totalGeneral = subtotal;

               if (carritoSubtotalEl) carritoSubtotalEl.textContent = `$${subtotal.toLocaleString('es-AR')}`;
               if (carritoTotalGeneralEl) carritoTotalGeneralEl.textContent = `$${totalGeneral.toLocaleString('es-AR')}`;

               if (opcionEnvioSeleccionadaEl && pedidoOpcionesFormEl) {
                   const formaEntregaSeleccionada = pedidoOpcionesFormEl.querySelector('input[name="formaEntrega"]:checked');
                   if (formaEntregaSeleccionada && formaEntregaSeleccionada.parentElement && formaEntregaSeleccionada.parentElement.textContent) {
                       opcionEnvioSeleccionadaEl.textContent = formaEntregaSeleccionada.parentElement.textContent.trim();
                   } else if (formaEntregaSeleccionada){
                        opcionEnvioSeleccionadaEl.textContent = formaEntregaSeleccionada.value;
                   } else {
                       opcionEnvioSeleccionadaEl.textContent = "A coordinar";
                   }
               }
           }

           function renderizarPaginaCarrito() {
               const carrito = obtenerCarrito();
               if (carritoItemsContainerEl) carritoItemsContainerEl.innerHTML = '';

               if (carrito.length === 0) {
                   if (carritoVacioMensajeEl) carritoVacioMensajeEl.style.display = 'block';
                   if (carritoResumenAccionesEl) carritoResumenAccionesEl.style.display = 'none';
                   if (accionesEnvioMensajeEl) accionesEnvioMensajeEl.style.display = 'none';
                   if (pedidoOpcionesFormEl && carritoResumenAccionesEl && carritoResumenAccionesEl.style.display === 'none') {
                       pedidoOpcionesFormEl.style.display = 'none';
                   }
               } else {
                   if (carritoVacioMensajeEl) carritoVacioMensajeEl.style.display = 'none';
                   if (carritoResumenAccionesEl) carritoResumenAccionesEl.style.display = 'grid';

                   if (accionesEnvioMensajeEl && accionesEnvioMensajeEl.style.display === 'none') { // Solo mostrar form de opciones si no se genero el mensaje
                       if (pedidoOpcionesFormEl) pedidoOpcionesFormEl.style.display = 'block';
                   } else if (accionesEnvioMensajeEl && accionesEnvioMensajeEl.style.display === 'block') { // Si ya se genero el mensaje, ocultar form de opciones
                        if (pedidoOpcionesFormEl) pedidoOpcionesFormEl.style.display = 'none';
                   }


                   carrito.forEach(item => {
                       let imagenHtml = `<span>${item.imagen || item.nombre || 'img'}</span>`;
                       if (item.imagen && !item.imagen.toLowerCase().includes('placeholder') && !item.imagen.startsWith('http')) {
                           let basePath = '../images/productos/';
                           if(item.origenDatos === 'catalogoMayoristaLexel' && item.tipoArticuloOriginal) {
                               let carpetaTipo = item.tipoArticuloOriginal ? item.tipoArticuloOriginal + "s" : "genericos";
                               basePath = `../images/catalogo-mayorista/${carpetaTipo}/`;
                           }
                            imagenHtml = `<img src="${basePath}${item.imagen}" alt="${item.nombre || 'Producto'}" onerror="this.style.display='none'; this.parentElement.innerHTML='<span>${item.imagen}</span>';">`;
                       } else if (item.imagen && item.imagen.startsWith('http')) {
                            imagenHtml = `<img src="${item.imagen}" alt="${item.nombre || 'Producto'}">`;
                       } else if (item.imagen && item.imagen.toLowerCase().includes('placeholder')) { // Para placeholders tipo texto como "Funda Transparente"
                           imagenHtml = `<img src="https://via.placeholder.com/80x80/e0e0e0/6E8098?text=${encodeURIComponent(item.imagen.substring(0,10))}" alt="${item.nombre || 'Producto'}">`;
                       }

                       const itemHTML = `
                           <div class="carrito-item" data-id="${item.id}">
                               <div class="carrito-item-imagen">${imagenHtml}</div>
                               <div class="carrito-item-info">
                                   <h3 class="item-nombre">${item.nombre || 'Producto Desconocido'}</h3>
                                   <p class="item-precio-unitario">Precio: $${(item.precio || 0).toLocaleString('es-AR')}</p>
                               </div>
                               <div class="carrito-item-cantidad">
                                   <button class="btn-cantidad menos" data-id="${item.id}" aria-label="Disminuir cantidad">-</button>
                                   <input type="number" value="${item.cantidad}" min="0" class="input-cantidad" data-id="${item.id}" aria-label="Cantidad">
                                   <button class="btn-cantidad mas" data-id="${item.id}" aria-label="Aumentar cantidad">+</button>
                               </div>
                               <div class="carrito-item-subtotal">
                                   <p><span class="subtotal-label-movil">Subtotal: </span><span class="item-subtotal-valor">$${((item.precio || 0) * item.cantidad).toLocaleString('es-AR')}</span></p>
                               </div>
                               <div class="carrito-item-remover">
                                   <button class="btn-remover-item" data-id="${item.id}" aria-label="Eliminar item">&times;</button>
                               </div>
                           </div>
                       `;
                       if (carritoItemsContainerEl) carritoItemsContainerEl.insertAdjacentHTML('beforeend', itemHTML);
                   });
                   agregarListenersItemsCarrito();
                   calcularYMostrarTotales();
               }
           }

           function agregarListenersItemsCarrito() {
               if (!carritoItemsContainerEl) return;

               carritoItemsContainerEl.querySelectorAll('.btn-cantidad.mas').forEach(btn => {
                   const nuevoBtn = btn.cloneNode(true); if(btn.parentNode) btn.parentNode.replaceChild(nuevoBtn, btn);
                   nuevoBtn.addEventListener('click', function() {
                       const productoId = this.getAttribute('data-id');
                       const inputCantidad = carritoItemsContainerEl.querySelector(`.input-cantidad[data-id="${productoId}"]`);
                       if (inputCantidad) {
                           let cantidadActual = parseInt(inputCantidad.value);
                           actualizarCantidadItem(productoId, cantidadActual + 1);
                       }
                   });
               });
               carritoItemsContainerEl.querySelectorAll('.btn-cantidad.menos').forEach(btn => {
                   const nuevoBtn = btn.cloneNode(true); if(btn.parentNode) btn.parentNode.replaceChild(nuevoBtn, btn);
                   nuevoBtn.addEventListener('click', function() {
                       const productoId = this.getAttribute('data-id');
                       const inputCantidad = carritoItemsContainerEl.querySelector(`.input-cantidad[data-id="${productoId}"]`);
                       if (inputCantidad) {
                           let cantidadActual = parseInt(inputCantidad.value);
                           if (cantidadActual > 0) { actualizarCantidadItem(productoId, cantidadActual - 1); }
                       }
                   });
               });
               carritoItemsContainerEl.querySelectorAll('.input-cantidad').forEach(input => {
                   const nuevoInput = input.cloneNode(true); if(input.parentNode) input.parentNode.replaceChild(nuevoInput, input);
                   nuevoInput.addEventListener('change', function() {
                       const productoId = this.getAttribute('data-id');
                       let nuevaCantidad = parseInt(this.value);
                       if (isNaN(nuevaCantidad) || nuevaCantidad < 0) nuevaCantidad = 0;
                       actualizarCantidadItem(productoId, nuevaCantidad);
                   });
                    nuevoInput.addEventListener('blur', function() {
                       if (this.value === '' || parseInt(this.value) < 0 ) {
                          const item = obtenerCarrito().find(i => i.id === this.getAttribute('data-id'));
                          if (item) this.value = item.cantidad;
                          else this.value = 0;
                       }
                   });
               });
               carritoItemsContainerEl.querySelectorAll('.btn-remover-item').forEach(btn => {
                   const nuevoBtn = btn.cloneNode(true); if(btn.parentNode) btn.parentNode.replaceChild(nuevoBtn, btn);
                   nuevoBtn.addEventListener('click', function() {
                       const productoId = this.getAttribute('data-id');
                       if (confirm("¿Estas seguro de que quieres eliminar este producto del carrito?")) {
                           eliminarItemDelCarrito(productoId);
                       }
                   });
               });
           }

           if (vaciarCarritoBtn) {
               vaciarCarritoBtn.addEventListener('click', function() {
                   if (confirm("¿Estas seguro de que quieres vaciar todo el carrito?")) {
                       guardarCarrito([]);
                       actualizarContadorCarrito();
                       renderizarPaginaCarrito();
                        // Al vaciar, asegurar que el form de opciones se muestre si antes estaba la seccion de envio
                       if (pedidoOpcionesFormEl) pedidoOpcionesFormEl.style.display = 'block';
                       if (accionesEnvioMensajeEl) accionesEnvioMensajeEl.style.display = 'none';
                   }
               });
           }

           if (generarMensajePedidoBtn && pedidoOpcionesFormEl && pedidoNombreInput && accionesEnvioMensajeEl && mensajePedidoPreviewEl && enviarWhatsAppBtn && enviarEmailBtn) {
               generarMensajePedidoBtn.addEventListener('click', function() {
                   if (pedidoFormStatusMessageEl) {
                       pedidoFormStatusMessageEl.style.display = 'none';
                       pedidoFormStatusMessageEl.textContent = ''; // Limpiar mensaje
                   }
                   // Limpiar errores de campos especificos
                   if (pedidoNombreInput.closest('.form-grupo').querySelector('.mensaje-error')) {
                       pedidoNombreInput.closest('.form-grupo').querySelector('.mensaje-error').textContent = "";
                   }


                   const nombre = pedidoNombreInput.value.trim();
                   const metodoPagoSeleccionado = pedidoOpcionesFormEl.querySelector('input[name="metodoPago"]:checked');
                   const formaEntregaSeleccionada = pedidoOpcionesFormEl.querySelector('input[name="formaEntrega"]:checked');

                   let esValido = true;
                   let errorMsgGeneral = "Por favor, completa los campos requeridos: ";
                   let erroresEspecificos = [];

                   if (nombre === '') {
                       if(pedidoNombreInput.closest('.form-grupo').querySelector('.mensaje-error')){
                           pedidoNombreInput.closest('.form-grupo').querySelector('.mensaje-error').textContent = "Ingresa tu nombre.";
                       }
                       erroresEspecificos.push("Nombre");
                       esValido = false;
                   }
                   if (!metodoPagoSeleccionado) {
                       erroresEspecificos.push("Metodo de Pago");
                       esValido = false;
                   }
                   if (!formaEntregaSeleccionada) {
                       erroresEspecificos.push("Forma de Entrega");
                       esValido = false;
                   }

                   if (!esValido) {
                       if (pedidoFormStatusMessageEl) {
                           pedidoFormStatusMessageEl.textContent = errorMsgGeneral + erroresEspecificos.join(', ') + ".";
                           pedidoFormStatusMessageEl.className = 'form-status-message error';
                           pedidoFormStatusMessageEl.style.display = 'block';
                       }
                       return;
                   }

                   const carrito = obtenerCarrito();
                   if (carrito.length === 0) {
                       alert("Tu carrito esta vacio. Añade algunos productos primero.");
                       return;
                   }

                   let detalleProductos = "";
                   let totalCarrito = 0;
                   carrito.forEach(item => {
                       const subtotalItem = (item.precio || 0) * item.cantidad;
                       detalleProductos += `- ${item.cantidad} x ${item.nombre} ($${(item.precio || 0).toLocaleString('es-AR')} c/u = $${subtotalItem.toLocaleString('es-AR')})\n`;
                       totalCarrito += subtotalItem;
                   });

                   // Actualizar la opcion de envio en el resumen ANTES de generar el mensaje
                   if (opcionEnvioSeleccionadaEl && formaEntregaSeleccionada && formaEntregaSeleccionada.parentElement && formaEntregaSeleccionada.parentElement.textContent) {
                      opcionEnvioSeleccionadaEl.textContent = formaEntregaSeleccionada.parentElement.textContent.trim();
                   } else if (opcionEnvioSeleccionadaEl && formaEntregaSeleccionada) {
                      opcionEnvioSeleccionadaEl.textContent = formaEntregaSeleccionada.value;
                   }

                   const mensaje = `¡Hola Lexel!\n\nSoy ${nombre}.\nQuisiera consultar/encargar los siguientes productos:\n${detalleProductos}\nTotal Estimado: $${totalCarrito.toLocaleString('es-AR')}\nMetodo de Pago Preferido: ${metodoPagoSeleccionado.value}\nForma de Entrega: ${formaEntregaSeleccionada.value}\n\n¡Gracias!`;

                   mensajePedidoPreviewEl.value = mensaje;

                   const mensajeCodificado = encodeURIComponent(mensaje);
                   enviarWhatsAppBtn.href = `https://wa.me/${WHATSAPP_LEXEL}?text=${mensajeCodificado}`;

                   const asuntoEmail = encodeURIComponent(`Consulta/Pedido Carrito Web - ${nombre}`);
                   enviarEmailBtn.href = `mailto:${EMAIL_LEXEL_CARRITO}?subject=${asuntoEmail}&body=${mensajeCodificado}`;

                   pedidoOpcionesFormEl.style.display = 'none';
                   if(pedidoFormStatusMessageEl) pedidoFormStatusMessageEl.style.display = 'none';
                   accionesEnvioMensajeEl.style.display = 'block';

                   // Anadir el mensaje guia
                   const accionesEnvioContenedor = document.getElementById('accionesEnvioMensaje');
                   if (accionesEnvioContenedor) {
                       let mensajeGuia = accionesEnvioContenedor.querySelector('.mensaje-guia-envio');
                       if (!mensajeGuia) { // Si no existe, crearlo
                           mensajeGuia = document.createElement('p');
                           mensajeGuia.className = 'mensaje-guia-envio';
                           // Anadirlo despues del div .botones-envio
                           const botonesEnvioDiv = accionesEnvioContenedor.querySelector('.botones-envio');
                           if (botonesEnvioDiv && botonesEnvioDiv.parentNode) {
                                botonesEnvioDiv.parentNode.insertBefore(mensajeGuia, botonesEnvioDiv.nextSibling);
                           } else {
                               accionesEnvioContenedor.appendChild(mensajeGuia); // Fallback
                           }
                       }
                       mensajeGuia.innerHTML = 'Haz clic en uno de los botones de arriba y recuerda <strong>completar el envío</strong> en WhatsApp o tu programa de Email.';
                       mensajeGuia.style.display = 'block'; // Asegurar que sea visible
                   }

               });
           }

           if (modificarPedidoBtn && pedidoOpcionesFormEl && accionesEnvioMensajeEl) {
               modificarPedidoBtn.addEventListener('click', function() {
                   pedidoOpcionesFormEl.style.display = 'block';
                   accionesEnvioMensajeEl.style.display = 'none';
                   if (pedidoFormStatusMessageEl) pedidoFormStatusMessageEl.style.display = 'none';
                   if (pedidoNombreInput.closest('.form-grupo').querySelector('.mensaje-error')) {
                      pedidoNombreInput.closest('.form-grupo').querySelector('.mensaje-error').textContent = "";
                  }
                  // Ocultar el mensaje guia tambien al modificar
                  const mensajeGuiaExistente = accionesEnvioMensajeEl.querySelector('.mensaje-guia-envio');
                  if (mensajeGuiaExistente) mensajeGuiaExistente.style.display = 'none';
               });
           }

           // Renderizar el carrito al cargar la pagina, si todos los elementos necesarios existen
           if(carritoVacioMensajeEl && carritoItemsContainerEl && carritoResumenAccionesEl && pedidoOpcionesFormEl && accionesEnvioMensajeEl) {
               renderizarPaginaCarrito();
           } else {
               console.warn("Faltan elementos del DOM para inicializar la pagina del carrito correctamente.");
           }
    }

    // --- LOGICA PARA EL SLIDER DE LA HERO SECTION (si estamos en la pagina de inicio) ---
        // Asumimos que la hero section solo esta en index.html. Si no, ajusta la condicion.
        if (document.querySelector('.hero-slider-container')) {
            console.log("Slider de Hero Section detectado.");

            const slides = document.querySelectorAll('.hero-slide');
            const prevButton = document.querySelector('.slider-control.prev');
            const nextButton = document.querySelector('.slider-control.next');
            const dotsContainer = document.querySelector('.slider-dots');
            let currentSlide = 0;
            let slideInterval; // Para auto-rotacion

            function goToSlide(slideIndex) {
                slides.forEach((slide, index) => {
                    slide.classList.remove('active-slide');
                    if (index === slideIndex) {
                        slide.classList.add('active-slide');
                    }
                });
                // Actualizar dots
                if (dotsContainer) {
                    const dots = dotsContainer.querySelectorAll('.dot');
                    dots.forEach((dot, index) => {
                        dot.classList.remove('active-dot');
                        if (index === slideIndex) {
                            dot.classList.add('active-dot');
                        }
                    });
                }
                currentSlide = slideIndex;
            }

            function nextSlide() {
                let newSlide = currentSlide + 1;
                if (newSlide >= slides.length) {
                    newSlide = 0; // Vuelve al primero
                }
                goToSlide(newSlide);
            }

            function prevSlide() {
                let newSlide = currentSlide - 1;
                if (newSlide < 0) {
                    newSlide = slides.length - 1; // Va al ultimo
                }
                goToSlide(newSlide);
            }

            // Crear dots si hay slides y contenedor de dots
            if (slides.length > 0 && dotsContainer) {
                slides.forEach((slide, index) => {
                    const dot = document.createElement('button');
                    dot.classList.add('dot');
                    dot.setAttribute('aria-label', `Ir al slide ${index + 1}`);
                    dot.addEventListener('click', () => {
                        goToSlide(index);
                        resetInterval(); // Reiniciar intervalo si el usuario navega manualmente
                    });
                    dotsContainer.appendChild(dot);
                });
                // Marcar el primer dot como activo
                if (dotsContainer.firstChild) {
                     // goToSlide(0) ya se encarga de esto al inicio
                }
            }

            // Event listeners para botones prev/next
            if (prevButton) {
                prevButton.addEventListener('click', () => {
                    prevSlide();
                    resetInterval();
                });
            }
            if (nextButton) {
                nextButton.addEventListener('click', () => {
                    nextSlide();
                    resetInterval();
                });
            }

            // Auto-rotacion (opcional)
            function startInterval() {
                if (slides.length > 1) { // Solo si hay mas de un slide
                    slideInterval = setInterval(nextSlide, 5000); // Cambia cada 5 segundos
                }
            }

            function resetInterval() {
                clearInterval(slideInterval);
                startInterval();
            }

            // Iniciar
            if (slides.length > 0) {
                goToSlide(0); // Mostrar el primer slide al cargar
                startInterval(); // Iniciar auto-rotacion
            }

        } // Fin if (document.querySelector('.hero-slider-container'))

    // --- LOGICA PARA FORMULARIOS DE CONTACTO, REPARACIONES, DISTRIBUIDORES ---
    if (document.querySelector('.pagina-contacto')) {
        console.log("Pagina de Contacto detectada.");

            // Definir el WhatsApp y Email para este formulario (pueden ser los mismos o diferentes)
                 const WHATSAPP_CONTACTO = "5492235481073";
                 const EMAIL_CONTACTO = "leonardosanguineri@gmail.com"; // Asumimos un email general de contacto

                 if (contactoForm && formStatusMessage) {
                     contactoForm.addEventListener('submit', function(e) {
                         e.preventDefault();
                         limpiarErroresFormulario(contactoForm);
                         formStatusMessage.style.display = 'none';
                         formStatusMessage.innerHTML = '';

                         const nombre = document.getElementById('nombre').value.trim();
                         const email = document.getElementById('email').value.trim();
                         const asuntoEl = document.getElementById('asunto');
                         const asunto = asuntoEl ? asuntoEl.value.trim() : 'Consulta desde la web'; // Asunto por defecto
                         const mensajeUsuario = document.getElementById('mensaje').value.trim();
                         let esValido = true;

                         if (nombre === '') { mostrarErrorEnForm(contactoForm, 'nombre', 'Por favor, ingresa tu nombre completo.'); esValido = false; }
                         if (email === '') { mostrarErrorEnForm(contactoForm, 'email', 'Por favor, ingresa tu correo electronico.'); esValido = false; }
                         else if (typeof esEmailValido === "function" && !esEmailValido(email)) { mostrarErrorEnForm(contactoForm, 'email', 'Por favor, ingresa un correo electronico valido.'); esValido = false; }
                         if (mensajeUsuario === '') { mostrarErrorEnForm(contactoForm, 'mensaje', 'Por favor, escribe tu mensaje.'); esValido = false; }

                         if (esValido) {
                             console.log('Formulario de contacto valido.');
                             const cuerpoMensaje = `Consulta desde la Web Lexel:\n\nNombre: ${nombre}\nEmail: ${email}\nAsunto: ${asunto || 'No especificado'}\nMensaje:\n${mensajeUsuario}\n\n`;
                             const mensajeCodificadoWpp = encodeURIComponent(cuerpoMensaje);
                             const mensajeCodificadoEmail = encodeURIComponent(cuerpoMensaje); // El cuerpo puede ser el mismo
                             const asuntoEmailCodificado = encodeURIComponent(asunto);

                             const linkWpp = `https://wa.me/${WHATSAPP_CONTACTO}?text=${mensajeCodificadoWpp}`;
                             const linkEmail = `mailto:${EMAIL_CONTACTO}?subject=${asuntoEmailCodificado}&body=${mensajeCodificadoEmail}`;

                             formStatusMessage.innerHTML = `¡Consulta preparada! Puedes enviarla por:<br>
                                 <a href="${linkWpp}" target="_blank" class="btn btn-success btn-wpp" style="margin-top:15px; margin-right:10px; display:inline-block;"><span class="icono-btn">📱</span> Enviar por WhatsApp</a>
                                 <a href="${linkEmail}" class="btn btn-secondary btn-email" style="margin-top:15px; display:inline-block;"><span class="icono-btn">✉️</span> Enviar por Email</a>`;
                             formStatusMessage.className = 'form-status-message exito';
                             formStatusMessage.style.display = 'block';

                             contactoForm.reset();
                         } else {
                             console.log('Formulario de contacto con errores.');
                             formStatusMessage.textContent = 'Por favor, corrige los errores marcados.';
                             formStatusMessage.className = 'form-status-message error';
                             formStatusMessage.style.display = 'block';
                         }
                     });
                 }

            // Logica para Mapas Colapsables
            const mapaToggleBtns = document.querySelectorAll('.mapa-toggle-btn');
            mapaToggleBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const targetId = this.getAttribute('aria-controls');
                    const mapContainer = document.getElementById(targetId);
                    const buttonTextSpan = this.querySelector('.mapa-toggle-texto');

                    if (mapContainer) {
                        const isExpanded = this.getAttribute('aria-expanded') === 'true';
                        if (isExpanded) {
                            mapContainer.classList.remove('mapa-visible');
                            this.setAttribute('aria-expanded', 'false');
                            if (buttonTextSpan) buttonTextSpan.textContent = "Ver Mapa";
                        } else {
                            mapContainer.classList.add('mapa-visible');
                            this.setAttribute('aria-expanded', 'true');
                            if (buttonTextSpan) buttonTextSpan.textContent = "Ocultar Mapa";
                        }
                    }
                });
            });
    }
    if (document.querySelector('.pagina-reparaciones')) {
            // DENTRO DEL if (document.querySelector('.pagina-reparaciones')) { ... }

            console.log("Pagina de Reparaciones detectada.");
            const reparacionForm = document.getElementById('reparacionForm');
            const formReparacionStatusMessage = document.getElementById('formReparacionStatusMessage');
            // Asegurate que este numero de WhatsApp este definido globalmente o aqui:
            const WHATSAPP_LEXEL_REPARACIONES = "5492235481073"; // Numero de WhatsApp de Lexel

            if (reparacionForm && formReparacionStatusMessage) { // Verificar que ambos elementos existan
                reparacionForm.addEventListener('submit', function(e) {
                    e.preventDefault();

                    // Usar funcion generica para limpiar errores
                    if (typeof limpiarErroresFormulario === "function") {
                        limpiarErroresFormulario(reparacionForm);
                    } else { // Fallback si no esta definida globalmente (aunque deberia)
                        reparacionForm.querySelectorAll('.form-grupo .mensaje-error').forEach(el => el.textContent = '');
                    }

                    formReparacionStatusMessage.style.display = 'none';
                    formReparacionStatusMessage.innerHTML = ''; // Limpiar contenido anterior

                    const nombre = document.getElementById('repNombre').value.trim();
                    const contacto = document.getElementById('repContacto').value.trim();
                    const dispositivoTipo = document.getElementById('repDispositivoTipo').value;
                    const marcaModelo = document.getElementById('repMarcaModelo').value.trim();
                    const problema = document.getElementById('repProblema').value.trim();
                    let esValido = true;

                    // Usar funcion generica para mostrar errores
                    if (nombre === '') {
                        if (typeof mostrarErrorEnForm === "function") mostrarErrorEnForm(reparacionForm, 'repNombre', 'Ingresa tu nombre.');
                        esValido = false;
                    }
                    if (contacto === '') {
                        if (typeof mostrarErrorEnForm === "function") mostrarErrorEnForm(reparacionForm, 'repContacto', 'Ingresa tu email o telefono.');
                        esValido = false;
                    }
                    if (dispositivoTipo === '') {
                        if (typeof mostrarErrorEnForm === "function") mostrarErrorEnForm(reparacionForm, 'repDispositivoTipo', 'Selecciona el tipo.');
                        esValido = false;
                    }
                    if (marcaModelo === '') {
                        if (typeof mostrarErrorEnForm === "function") mostrarErrorEnForm(reparacionForm, 'repMarcaModelo', 'Ingresa marca y modelo.');
                        esValido = false;
                    }
                    if (problema === '') {
                        if (typeof mostrarErrorEnForm === "function") mostrarErrorEnForm(reparacionForm, 'repProblema', 'Describe el problema.');
                        esValido = false;
                    }

                    if (esValido) {
                        console.log('Formulario de reparacion valido.');
                        const mensajeReparacion = `¡Hola Lexel!\n\nSolicitud de Presupuesto para Reparacion:\n-----------------------------------\nNombre: ${nombre}\nContacto: ${contacto}\nDispositivo: ${dispositivoTipo}\nMarca/Modelo: ${marcaModelo}\nProblema: ${problema}\n-----------------------------------\n\nAguardo su respuesta.`;
                        const mensajeCodificado = encodeURIComponent(mensajeReparacion);

                        const linkWpp = `https://wa.me/${WHATSAPP_LEXEL_REPARACIONES}?text=${mensajeCodificado}`;
                        // Opcional: Si tambien quieres opcion de Email para reparaciones
                        // const EMAIL_LEXEL_REPARACIONES = "tu_email_de_reparaciones@ejemplo.com"; // Define este email
                        // const asuntoEmailRep = encodeURIComponent(`Consulta Reparacion - ${marcaModelo}`);
                        // const linkEmailRep = `mailto:${EMAIL_LEXEL_REPARACIONES}?subject=${asuntoEmailRep}&body=${mensajeCodificado}`;

                        formReparacionStatusMessage.innerHTML = `¡Solicitud preparada! Puedes enviarla por WhatsApp:<br>
                            <a href="${linkWpp}" target="_blank" class="btn btn-success btn-wpp" style="margin-top:15px; display:inline-block;"><span class="icono-btn">📱</span> Enviar Consulta por WhatsApp</a>`;

                        // Si anades email:
                        // formReparacionStatusMessage.innerHTML += `<a href="${linkEmailRep}" class="btn btn-secondary btn-email" style="margin-top:15px; margin-left:10px; display:inline-block;"><span class="icono-btn">✉️</span> Enviar por Email</a>`;

                        formReparacionStatusMessage.className = 'form-status-message exito';
                        formReparacionStatusMessage.style.display = 'block';

                        reparacionForm.reset();
                        // No ocultamos el mensaje para que el usuario pueda clickear los botones
                    } else {
                        console.log('Formulario de reparacion con errores.');
                        formReparacionStatusMessage.textContent = 'Por favor, corrige los errores marcados.';
                        formReparacionStatusMessage.className = 'form-status-message error';
                        formReparacionStatusMessage.style.display = 'block';
                    }
                });
            } else {
                if (!reparacionForm) console.warn("Formulario 'reparacionForm' no encontrado en pagina-reparaciones.");
                if (!formReparacionStatusMessage) console.warn("Elemento 'formReparacionStatusMessage' no encontrado en pagina-reparaciones.");
            }
    }
    if (document.querySelector('.pagina-distribuidores')) {
        console.log("Pagina de Distribuidores detectada.");
            const distribuidorForm = document.getElementById('distribuidorForm');
            const formDistribuidorStatusMessage = document.getElementById('formDistribuidorStatusMessage');
            // Asegurarse que estos esten definidos globalmente o aqui:
            const WHATSAPP_LEXEL_DISTRIBUIDORES = "5492235481073";
            const EMAIL_LEXEL_DISTRIBUIDORES_FORM = "leonardosanguineri@gmail.com";

            if (distribuidorForm && formDistribuidorStatusMessage) {
                distribuidorForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    if(typeof limpiarErroresFormulario === "function") limpiarErroresFormulario(distribuidorForm);
                    formDistribuidorStatusMessage.style.display = 'none';
                    formDistribuidorStatusMessage.innerHTML = '';

                    const nombreNegocio = document.getElementById('distNombreNegocio').value.trim();
                    const nombreContacto = document.getElementById('distNombreContacto').value.trim();
                    const email = document.getElementById('distEmail').value.trim();
                    const telefono = document.getElementById('distTelefono').value.trim();
                    const ciudad = document.getElementById('distCiudad') ? document.getElementById('distCiudad').value.trim() : '';
                    const tipoNegocio = document.getElementById('distTipoNegocio') ? document.getElementById('distTipoNegocio').value.trim() : '';
                    const mensajeInput = document.getElementById('distMensaje') ? document.getElementById('distMensaje').value.trim() : '';
                    let esValido = true;

                    if (nombreNegocio === '') { if(typeof mostrarErrorEnForm === "function") mostrarErrorEnForm(distribuidorForm, 'distNombreNegocio', 'Ingresa el nombre del negocio.'); esValido = false; }
                    if (nombreContacto === '') { if(typeof mostrarErrorEnForm === "function") mostrarErrorEnForm(distribuidorForm, 'distNombreContacto', 'Ingresa un nombre de contacto.'); esValido = false; }
                    if (email === '') { if(typeof mostrarErrorEnForm === "function") mostrarErrorEnForm(distribuidorForm, 'distEmail', 'Ingresa un correo.'); esValido = false; }
                    else if (typeof esEmailValido === "function" && !esEmailValido(email)) { if(typeof mostrarErrorEnForm === "function") mostrarErrorEnForm(distribuidorForm, 'distEmail', 'Correo no valido.'); esValido = false; }
                    if (telefono === '') { if(typeof mostrarErrorEnForm === "function") mostrarErrorEnForm(distribuidorForm, 'distTelefono', 'Ingresa un telefono.'); esValido = false; }

                    if (esValido) {
                        console.log('Formulario de distribuidor valido.');
                        const asuntoEmail = encodeURIComponent(`Solicitud Distribuidor - ${nombreNegocio}`);
                        const cuerpoMensaje = `Solicitud para ser Distribuidor Lexel:\n\nNombre del Negocio: ${nombreNegocio}\nPersona de Contacto: ${nombreContacto}\nEmail: ${email}\nTelefono: ${telefono}\nCiudad/Localidad: ${ciudad || 'No especificada'}\nTipo de Negocio: ${tipoNegocio || 'No especificado'}\nMensaje Adicional: ${mensajeInput || 'Ninguno'}\n\n`;
                        const mensajeCodificado = encodeURIComponent(cuerpoMensaje);

                        const linkWpp = `https://wa.me/${WHATSAPP_LEXEL_DISTRIBUIDORES}?text=${mensajeCodificado}`;
                        const linkEmail = `mailto:${EMAIL_LEXEL_DISTRIBUIDORES_FORM}?subject=${asuntoEmail}&body=${mensajeCodificado}`;

                        formDistribuidorStatusMessage.innerHTML = `¡Solicitud preparada! Por favor, enviala por tu medio preferido:<br>
                            <a href="${linkWpp}" target="_blank" class="btn btn-success btn-wpp" style="margin-top:15px; margin-right:10px; display:inline-block;"><span class="icono-btn">📱</span> Enviar por WhatsApp</a>
                            <a href="${linkEmail}" class="btn btn-secondary btn-email" style="margin-top:15px; display:inline-block;"><span class="icono-btn">✉️</span> Enviar por Email</a>`;
                        formDistribuidorStatusMessage.className = 'form-status-message exito';
                        formDistribuidorStatusMessage.style.display = 'block';

                        distribuidorForm.reset();
                         // No ocultamos el mensaje para que el usuario pueda clickear
                    } else {
                        console.log('Formulario de distribuidor con errores.');
                        formDistribuidorStatusMessage.textContent = 'Por favor, corrige los errores marcados.';
                        formDistribuidorStatusMessage.className = 'form-status-message error';
                        formDistribuidorStatusMessage.style.display = 'block';
                    }
                });
            } else {
                if (!distribuidorForm) console.warn("Formulario 'distribuidorForm' no encontrado en pagina-distribuidores.");
                if (!formDistribuidorStatusMessage) console.warn("Elemento 'formDistribuidorStatusMessage' no encontrado en pagina-distribuidores.");
            }
    }

    // --- LOGICA PARA EL BLOG ---
    if (document.querySelector('.pagina-blog')) {
        console.log("Pagina del Blog (Listado) detectada.");
                const articulosGrid = document.getElementById('articulosGrid');

                if (articulosGrid && typeof articulosDelBlog !== 'undefined' && Array.isArray(articulosDelBlog) && articulosDelBlog.length > 0) {
                    articulosDelBlog.forEach(articulo => {
                        const slug = articulo.slug || 'articulo-sin-slug';
                        const titulo = articulo.titulo || 'Titulo no disponible';
                        const autor = articulo.autor || 'Autor Desconocido';
                        const fecha = articulo.fechaPublicacion || 'Fecha no disponible';
                        const resumen = articulo.resumen || 'Resumen no disponible.';
                        const imagenDestacada = articulo.imagenDestacada || 'placeholder-blog.png';

                        let imagenHTML = `<span>${imagenDestacada}</span>`;
                        if (articulo.imagenDestacada && !imagenDestacada.toLowerCase().includes('placeholder')) {
                            imagenHTML = `<img src="../images/blog/${articulo.imagenDestacada}" alt="${titulo}" style="width:100%; height:100%; object-fit:cover;">`;
                        }

                        const articuloCardHTML = `
                            <article class="articulo-card">
                                <div class="articulo-imagen-placeholder">
                                    ${imagenHTML}
                                </div>
                                <div class="articulo-contenido-card">
                                    <h2 class="articulo-titulo-card"><a href="articulo-blog.html?slug=${slug}">${titulo}</a></h2>
                                    <p class="articulo-meta-card">Por <span class="autor">${autor}</span> el <span class="fecha">${fecha}</span></p>
                                    <p class="articulo-resumen-card">${resumen}</p>
                                    <a href="articulo-blog.html?slug=${slug}" class="btn btn-tertiary">Leer Mas &raquo;</a>
                                </div>
                            </article>
                        `;
                        articulosGrid.insertAdjacentHTML('beforeend', articuloCardHTML);
                    });
                } else if (articulosGrid) {
                    articulosGrid.innerHTML = "<p>No hay articulos disponibles en este momento.</p>";
                    if(typeof articulosDelBlog === 'undefined') {
                        console.error("El array 'articulosDelBlog' no esta definido. Asegurate que blog-data.js este cargado ANTES que main.js.");
                    }
                }
    }
    if (document.querySelector('.pagina-articulo-blog')) {
        console.log("Pagina de Articulo Individual detectada.");

                const articuloLoadingEl = document.getElementById('articuloLoading');
                const articuloErrorEl = document.getElementById('articuloError');
                const articuloContenedorEl = document.getElementById('articuloContenedor');

                const tituloEl = document.getElementById('articuloTitulo');
                const fechaEl = document.getElementById('articuloFecha');
                const autorEl = document.getElementById('articuloAutor');
                const imagenEl = document.getElementById('articuloImagenDestacada');
                const cuerpoEl = document.getElementById('articuloCuerpo');
                const navBlogLink = document.getElementById('navBlogLink');

                function mostrarErrorArticulo() {
                    if(articuloLoadingEl) articuloLoadingEl.style.display = 'none';
                    if(articuloContenedorEl) articuloContenedorEl.style.display = 'none';
                    if(articuloErrorEl) articuloErrorEl.style.display = 'block';
                }

                const params = new URLSearchParams(window.location.search);
                const articuloSlug = params.get('slug');

                if (articuloSlug && typeof articulosDelBlog !== 'undefined' && Array.isArray(articulosDelBlog)) {
                    const articuloEncontrado = articulosDelBlog.find(art => art.slug === articuloSlug);

                    if (articuloEncontrado) {
                        if(articuloLoadingEl) articuloLoadingEl.style.display = 'none';
                        if(articuloErrorEl) articuloErrorEl.style.display = 'none';
                        if(articuloContenedorEl) articuloContenedorEl.style.display = 'block';

                        if(navBlogLink) {
                            const navLinks = document.querySelectorAll('.main-navigation ul a.active'); // Solo los activos
                            navLinks.forEach(link => link.classList.remove('active'));
                            navBlogLink.classList.add('active');
                        }

                        document.title = `${articuloEncontrado.titulo || 'Articulo'} - Blog Lexel`;

                        if(tituloEl) tituloEl.textContent = articuloEncontrado.titulo || 'Titulo no disponible';
                        if(fechaEl) fechaEl.textContent = articuloEncontrado.fechaPublicacion || '';
                        if(autorEl) autorEl.textContent = articuloEncontrado.autor || '';

                        if(imagenEl) {
                            let imagenArtHTML = `<span>${articuloEncontrado.imagenDestacada || 'imagen-destacada.png'}</span>`;
                            if (articuloEncontrado.imagenDestacada && !articuloEncontrado.imagenDestacada.toLowerCase().includes('placeholder')) {
                                imagenArtHTML = `<img src="../images/blog/${articuloEncontrado.imagenDestacada}" alt="${articuloEncontrado.titulo || 'Imagen Destacada'}" style="width:100%; height:auto; max-height: 400px; object-fit: cover; border-radius: var(--border-radius-general);">`;
                            }
                            imagenEl.innerHTML = imagenArtHTML;
                        }
                        if(cuerpoEl) cuerpoEl.innerHTML = articuloEncontrado.contenidoCompleto || '<p>Contenido no disponible.</p>';

                    } else {
                        console.error("Articulo no encontrado con slug:", articuloSlug);
                        mostrarErrorArticulo();
                    }
                } else {
                    console.error("No se proporciono slug de articulo en la URL o articulosDelBlog no esta definido/disponible.");
                    mostrarErrorArticulo();
                }
    }

    // --- LOGICA PARA LA PAGINA DE ADMIN ---
    if (document.querySelector('.pagina-admin-body')) {
        console.log("Pagina Admin detectada.");

            const adminContentEl = document.getElementById('adminContent');
            const adminAccesoDenegadoEl = document.getElementById('adminAccesoDenegado');
            const adminListaProductosRetailEl = document.getElementById('adminListaProductosRetail');
            const adminListaCatalogoMayoristaEl = document.getElementById('adminListaCatalogoMayorista');
            const btnAnadirProductoRetail = document.getElementById('btnAnadirProductoRetail');
            const btnAnadirItemCatalogo = document.getElementById('btnAnadirItemCatalogo');

            const usuarioActualParaAdmin = obtenerSesionUsuario(); // Usamos la funcion global

            if (usuarioActualParaAdmin && (usuarioActualParaAdmin.rol === 'admin' || usuarioActualParaAdmin.rol === 'dev')) {
                if (adminContentEl) adminContentEl.style.display = 'block';
                if (adminAccesoDenegadoEl) adminAccesoDenegadoEl.style.display = 'none';

                const linkPanelAdmin = document.getElementById('linkPanelAdminHeader');
                if (linkPanelAdmin) {
                     document.querySelectorAll('.main-navigation ul a.active, .header-actions a.active-cart').forEach(a => a.classList.remove('active', 'active-cart'));
                    linkPanelAdmin.classList.add('active');
                }

                if (adminListaProductosRetailEl && typeof todosLosProductos !== 'undefined' && Array.isArray(todosLosProductos)) {
                    adminListaProductosRetailEl.innerHTML = '';
                    if (todosLosProductos.length === 0) {
                        adminListaProductosRetailEl.innerHTML = '<p>No hay productos retail para mostrar.</p>';
                    }
                    todosLosProductos.forEach(producto => {
                        const itemDiv = document.createElement('div');
                        itemDiv.className = 'admin-item';
                        itemDiv.innerHTML = `
                            <span class="admin-item-nombre">${producto.nombre || 'Sin nombre'} (ID: ${producto.id})</span>
                            <div class="admin-item-acciones">
                                <button class="btn btn-sm-padding btn-secondary btn-editar-item" data-id="${producto.id}" data-tipo="retail">Editar</button>
                                <button class="btn btn-sm-padding btn-danger btn-eliminar-item" data-id="${producto.id}" data-tipo="retail">Eliminar</button>
                            </div>
                        `;
                        adminListaProductosRetailEl.appendChild(itemDiv);
                    });
                } else if (adminListaProductosRetailEl) {
                    adminListaProductosRetailEl.innerHTML = '<p>Error al cargar productos retail o datos no disponibles.</p>';
                }

                if (adminListaCatalogoMayoristaEl && typeof catalogoMayoristaLexel !== 'undefined' && Array.isArray(catalogoMayoristaLexel)) {
                    adminListaCatalogoMayoristaEl.innerHTML = '';
                     if (catalogoMayoristaLexel.length === 0) {
                        adminListaCatalogoMayoristaEl.innerHTML = '<p>No hay items en el catalogo mayorista.</p>';
                    }
                    catalogoMayoristaLexel.forEach(item => {
                        let nombreMostrar = item.nombre;
                        if (item.tipoArticulo === 'repuesto') {
                            nombreMostrar = `${item.tipoRepuesto || ''} - ${item.marcaCelular || ''} ${item.modeloCelular || ''}`.trim();
                        }
                        const itemDiv = document.createElement('div');
                        itemDiv.className = 'admin-item';
                        itemDiv.innerHTML = `
                            <span class="admin-item-nombre">${nombreMostrar || 'Sin nombre'} (ID: ${item.id})</span>
                            <div class="admin-item-acciones">
                                <button class="btn btn-sm-padding btn-secondary btn-editar-item" data-id="${item.id}" data-tipo="mayorista">Editar</button>
                                <button class="btn btn-sm-padding btn-danger btn-eliminar-item" data-id="${item.id}" data-tipo="mayorista">Eliminar</button>
                            </div>
                        `;
                        adminListaCatalogoMayoristaEl.appendChild(itemDiv);
                    });
                } else if (adminListaCatalogoMayoristaEl) {
                     adminListaCatalogoMayoristaEl.innerHTML = '<p>Error al cargar catalogo mayorista o datos no disponibles.</p>';
                }

                if (btnAnadirProductoRetail) {
                    btnAnadirProductoRetail.addEventListener('click', () => {
                        alert('Funcionalidad "Añadir Nuevo Producto Retail" no implementada en este prototipo.');
                    });
                }
                if (btnAnadirItemCatalogo) {
                    btnAnadirItemCatalogo.addEventListener('click', () => {
                        alert('Funcionalidad "Añadir Nuevo Item al Catalogo Mayorista" no implementada en este prototipo.');
                    });
                }

                // Clonar y reemplazar para listeners de botones edit/delete generados dinamicamente
                function agregarAdminActionListeners() {
                    const containerAdmin = document.getElementById('adminContent'); // Buscar dentro del contenedor principal del admin
                    if (!containerAdmin) return;

                    containerAdmin.querySelectorAll('.btn-editar-item').forEach(btn => {
                        const nuevoBtn = btn.cloneNode(true);
                        if (btn.parentNode) btn.parentNode.replaceChild(nuevoBtn, btn);
                        nuevoBtn.addEventListener('click', function() {
                            const id = this.dataset.id;
                            const tipo = this.dataset.tipo;
                            alert(`Simulando edicion para ${tipo} ID: ${id}. Funcionalidad no implementada.`);
                        });
                    });
                    containerAdmin.querySelectorAll('.btn-eliminar-item').forEach(btn => {
                        const nuevoBtn = btn.cloneNode(true);
                        if (btn.parentNode) btn.parentNode.replaceChild(nuevoBtn, btn);
                        nuevoBtn.addEventListener('click', function() {
                            const id = this.dataset.id;
                            const tipo = this.dataset.tipo;
                            if (confirm(`¿Seguro que quieres simular la eliminacion de ${tipo} ID: ${id}? (No se borrara nada realmente)`)) {
                                alert(`Simulando eliminacion para ${tipo} ID: ${id}. Funcionalidad no implementada.`);
                            }
                        });
                    });
                }
                if (adminListaProductosRetailEl || adminListaCatalogoMayoristaEl) { // Solo llamar si las listas existen
                     agregarAdminActionListeners();
                }


            } else if (adminAccesoDenegadoEl) { // Solo si existe el div de acceso denegado
                // No es admin/dev o no hay sesion, mostrar acceso denegado
                if (adminContentEl) adminContentEl.style.display = 'none';
                adminAccesoDenegadoEl.style.display = 'block';
                console.warn("Acceso denegado al panel de admin. Rol de usuario:", usuarioActualParaAdmin ? usuarioActualParaAdmin.rol : 'Ninguno');

                // Opcional: Redirigir para mayor seguridad
                 setTimeout(() => {
                    const basePathIndex = window.location.pathname.includes('/pages/') ? '../' : '';
                    window.location.href = `${basePathIndex}index.html`;
                 }, 3000); // Redirigir despues de 3 segundos
            }
    }
    
}); // --- FIN DEL DOMContentLoaded ---