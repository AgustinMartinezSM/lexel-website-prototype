// js/productos-data.js

// Defino mi "base de datos" de productos.
// Mas adelante, esto podria venir de un servidor o un CMS.
const todosLosProductos = [
    {
            id: "prod001",
            nombre: "Smartphone Modelo X",
            precio: 150000,
            categoria: "celulares",
            marca: "TechNova",
            // imagen: "placeholder-celular-x.png", // Ya no usamos esta directamente para la galeria
            imagenes: [ // NUEVA propiedad: array de imagenes
                "celular-x-frente.png",    // Imagen principal
                "celular-x-lado.png",      // Imagen adicional 1
                "celular-x-posterior.png", // Imagen adicional 2
                "celular-x-detalle.png"    // Imagen adicional 3
            ],
            descripcionCorta: "Potente y elegante, ideal para tu dia a dia.",
            stock: 15
        },
    {
            id: "prod002",
            nombre: "Consola Nintendo Switch OLED",
            precio: 280000,
            categoria: "consolas",
            marca: "Nintendo",
            imagenes: [
                "switch-oled-principal.png",
                "switch-oled-dock.png",
                "switch-oled-joycons.png"
            ],
            descripcionCorta: "La ultima version con pantalla OLED vibrante.",
            stock: 8
        },
    {
        id: "prod003",
        nombre: "Auriculares Inalambricos Pro",
        precio: 45000,
        categoria: "accesorios", // Podria ser tambien 'audio'
        marca: "SoundWave", // Marca de ejemplo
        imagen: "placeholder-auriculares-pro.png",
        descripcionCorta: "Sonido immersivo y cancelacion de ruido.",
        stock: 25
    },
    {
            id: "prod004",
            nombre: "Parlante Bluetooth MaxSound",
            precio: 70000,
            categoria: "audio",
            marca: "SoundWave",
            imagenes: [
                "parlante-maxsound-frente.png",
                "parlante-maxsound-perspectiva.png"
            ],
            descripcionCorta: "Potencia y claridad para tus fiestas.",
            stock: 12
        },
    {
        id: "prod005",
        nombre: "Cargador Rapido USB-C 45W",
        precio: 15000,
        categoria: "accesorios",
        marca: "PowerUp", // Marca de ejemplo
        imagen: "placeholder-cargador-usbc.png",
        descripcionCorta: "Carga tus dispositivos en tiempo record.",
        stock: 30
    },
    {
        id: "prod006",
        nombre: "Smartwatch FitBand Serie 5",
        precio: 55000,
        categoria: "wearables",
        marca: "FitTech", // Marca de ejemplo
        imagen: "placeholder-smartwatch-fit5.png",
        descripcionCorta: "Monitorea tu actividad y salud con estilo.",
        stock: 18
    },
    {
        id: "prod007",
        nombre: "Smartphone Modelo Y Avanzado",
        precio: 195000,
        categoria: "celulares",
        marca: "TechNova",
        imagen: "placeholder-celular-y.png",
        descripcionCorta: "Camara profesional y rendimiento superior.",
        stock: 10
    },
    {
        id: "prod008",
        nombre: "Parlante Compacto SoundGo",
        precio: 35000,
        categoria: "audio",
        marca: "SoundWave",
        imagen: "placeholder-parlante-go.png",
        descripcionCorta: "Lleva tu musica a todas partes.",
        stock: 22
    },
    {
        id: "prod009",
        nombre: "Teclado Mecanico Gamer RGB",
        precio: 65000,
        categoria: "computacion", // Nueva categoria
        marca: "GameMax", // Nueva marca
        imagen: "placeholder-teclado-gamer.png",
        descripcionCorta: "Precision y luces para tus juegos.",
        stock: 14
    },
    {
        id: "prod010",
        nombre: "Mouse Optico ErgoComfort",
        precio: 22000,
        categoria: "computacion",
        marca: "OfficePro", // Nueva marca
        imagen: "placeholder-mouse-ergo.png",
        descripcionCorta: "Comodidad para largas horas de trabajo.",
        stock: 20
    }
];

// Podriamos tambien definir aqui las categorias y marcas si quisieramos generarlas dinamicamente en el sidebar,
// pero por ahora las dejaremos hardcodeadas en el HTML del sidebar.
// const todasLasCategorias = ["celulares", "consolas", "accesorios", "audio", "wearables", "computacion"];
// const todasLasMarcas = ["TechNova", "Nintendo", "SoundWave", "PowerUp", "FitTech", "GameMax", "OfficePro"];