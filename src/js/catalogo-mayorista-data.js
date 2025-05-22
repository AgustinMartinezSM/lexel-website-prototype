// js/catalogo-mayorista-data.js

const catalogoMayoristaLexel = [
    // --- FUNDAS ---
    {
        id: "dist-funda001",
        tipoArticulo: "funda", // 'funda', 'templado', 'repuesto'
        nombre: "Funda TPU Transparente Anti-Golpe",
        // imagen: "fundas/tpu-transparente-varios.jpg", // Ejemplo de ruta de imagen
        imagenPlaceholder: "Funda Transparente", // Para usar si no hay imagen real aun
        descripcion: "Proteccion flexible y duradera con esquinas reforzadas. Mantiene el diseno original del equipo.",
        material: "TPU Siliconado",
        coloresDisponibles: ["Transparente"],
        caracteristicas: ["Anti-golpe", "Esquinas reforzadas", "Ultra delgada"],
        modelosCompatibles: ["Samsung A14", "Samsung A34", "Samsung A54", "Motorola G23", "Motorola G53", "iPhone 13", "iPhone 14"],
        marcaCompatiblePredominante: ["Samsung", "Motorola", "iPhone"] // Para facilitar un filtro general de marca
    },
    {
        id: "dist-funda002",
        tipoArticulo: "funda",
        nombre: "Funda Silicon Case con Interior de Microfibra",
        imagenPlaceholder: "Funda Silicona Colores",
        descripcion: "Exterior de silicona suave al tacto, interior de microfibra para proteger el equipo. Varios colores.",
        material: "Silicona",
        coloresDisponibles: ["Negro", "Rojo", "Azul Noche", "Rosa Arena", "Verde Pino"],
        caracteristicas: ["Suave al tacto", "Interior microfibra", "Anti-deslizante"],
        modelosCompatibles: ["iPhone 11", "iPhone 12/12 Pro", "iPhone 13/13 Pro", "iPhone 14/14 Pro", "Samsung S22", "Samsung S23"],
        marcaCompatiblePredominante: ["iPhone", "Samsung"]
    },

    // --- TEMPLADOS ---
    {
        id: "dist-templado001",
        tipoArticulo: "templado",
        nombre: "Vidrio Templado 9D Full Cover",
        imagenPlaceholder: "Templado 9D",
        descripcion: "Cobertura completa de pantalla, dureza 9H, bordes biselados, alta sensibilidad, anti-huellas.",
        caracteristicas: ["Full Cover", "Dureza 9H", "Anti-Huellas", "Bordes 2.5D/9D"],
        modelosCompatibles: ["Xiaomi Redmi Note 12", "Xiaomi Redmi Note 11 Pro", "Samsung A04s", "Motorola E32", "iPhone 12"],
        marcaCompatiblePredominante: ["Xiaomi", "Samsung", "Motorola", "iPhone"]
    },
    {
        id: "dist-templado002",
        tipoArticulo: "templado",
        nombre: "Templado Camara Trasera",
        imagenPlaceholder: "Templado Camara",
        descripcion: "Protector individual para lentes de camara trasera. Mantiene la calidad de las fotos.",
        caracteristicas: ["Anti-rayas", "Ultra delgado", "Alta transparencia"],
        modelosCompatibles: ["iPhone 13 Pro/Pro Max", "iPhone 14 Pro/Pro Max", "Samsung S23 Ultra", "Samsung S22 Ultra"],
        marcaCompatiblePredominante: ["iPhone", "Samsung"]
    },

    // --- REPUESTOS ---
    {
        id: "dist-repuesto001",
        tipoArticulo: "repuesto",
        // nombre: se construira como "Pin de Carga - Samsung A14"
        tipoRepuesto: "Pin de Carga",
        marcaCelular: "Samsung", // Marca del celular para el que es el repuesto
        modeloCelular: "Galaxy A14", // Modelo especifico
        // imagen: "repuestos/pin-carga-generico.jpg", // Opcional, imagen generica del tipo de repuesto
        imagenPlaceholder: "Pin de Carga",
        calidad: "AAA", // Ej: 'Original', 'Original Service Pack', 'AAA', 'OLED', 'INCELL'
        descripcionAdicional: "Compatible con SM-A145M, SM-A145F. Verificar version."
    },
    {
        id: "dist-repuesto002",
        tipoArticulo: "repuesto",
        tipoRepuesto: "Modulo Pantalla Completa",
        marcaCelular: "Motorola",
        modeloCelular: "Moto G32",
        imagenPlaceholder: "Modulo Moto G32",
        calidad: "OLED (Compatible)",
        descripcionAdicional: "Incluye display y tactil ensamblados."
    },
    {
        id: "dist-repuesto003",
        tipoArticulo: "repuesto",
        tipoRepuesto: "Bateria",
        marcaCelular: "iPhone",
        modeloCelular: "XR",
        imagenPlaceholder: "Bateria iPhone XR",
        calidad: "Original Desensamble / Alta Capacidad",
        descripcionAdicional: "Consultar ciclos o capacidad especifica."
    },
    {
        id: "dist-repuesto004",
        tipoArticulo: "repuesto",
        tipoRepuesto: "Flex Encendido/Volumen",
        marcaCelular: "Xiaomi",
        modeloCelular: "Redmi 9A",
        imagenPlaceholder: "Flex Xiaomi",
        calidad: "Nuevo",
        descripcionAdicional: ""
    }
];