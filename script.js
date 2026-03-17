// script.js

// ---- CONFIGURACIÓN ----
const TOTAL_IMAGENES_DISPONIBLES = 50;   // Debes tener imágenes 1.jpg ... 50.jpg (o .png)
const FILAS = 3;
const COLUMNAS = 4;
const CANTIDAD_CARTAS = FILAS * COLUMNAS; // 12

// Nombres descriptivos para cada carta (puedes personalizarlos después)
// Se genera un array de objetos: { id, nombre, archivo }
const listaCompleta = Array.from({ length: TOTAL_IMAGENES_DISPONIBLES }, (_, i) => {
    const num = i + 1;
    return {
        id: num,
        nombre: `Carta ${num}`,  // Por defecto, luego podrías mapear nombres reales
        archivo: `imagenes/${num}.jpg` // asume .jpg, cambia si usas .png
    };
});

// Nombres reales de la loteria (opcional, asigna a los primeros 50)
const nombresReales = [
    "El gallo", "El diablo", "La dama", "El catrín", "El paraguas",
    "La sirena", "La escalera", "La botella", "El barril", "El árbol",
    "El melón", "El valiente", "El gorrito", "La muerte", "La pera",
    "La bandera", "El bandolón", "El violoncello", "La garza", "El pájaro",
    "La mano", "La bota", "La luna", "El cotorro", "El borracho",
    "El negrito", "El corazón", "La sandía", "El tambor", "El camarón",
    "Las jaras", "El músico", "La araña", "El soldado", "La estrella",
    "El cazo", "El mundo", "El apache", "El nopal", "El alacrán",
    "La rosa", "La calavera", "La campana", "El cantarito", "El venado",
    "El sol", "La corona", "La chalupa", "El pino", "El pescado"
];
// Asignar nombres reales a los primeros 50 (si no alcanza, se repiten)
listaCompleta.forEach((item, idx) => {
    if (idx < nombresReales.length) item.nombre = nombresReales[idx];
    else item.nombre = `Extra ${idx+1}`;
});

// ---- ESTADO DEL JUEGO ----
let tableroActual = [];           // Array con las 12 cartas del tablero (objetos)
let seleccionadas = new Array(CANTIDAD_CARTAS).fill(false);
let juegoGanado = false;

let intervaloProgreso = null;
let tiempoPresionado = 0;
const TIEMPO_REINICIO_SEG = 2;    // segundos para reiniciar

// ---- ELEMENTOS DOM ----
const tableroDiv = document.getElementById('tablero');
const mensajeVictoria = document.getElementById('mensajeVictoria');
const btnReiniciar = document.getElementById('btnReiniciar');
const barraProgreso = document.getElementById('barraProgreso');

// ---- FUNCIONES ----

// Generar tablero con cartas aleatorias sin repetir
function generarTableroAleatorio() {
    // Copia de la lista completa para ir sacando
    const copia = [...listaCompleta];
    const seleccion = [];
    for (let i = 0; i < CANTIDAD_CARTAS; i++) {
        if (copia.length === 0) break; // no debería pasar si hay 50
        const indice = Math.floor(Math.random() * copia.length);
        seleccion.push(copia[indice]);
        copia.splice(indice, 1); // eliminar para no repetir
    }
    return seleccion;
}

// Dibujar el tablero en el DOM
function renderizarTablero() {
    tableroDiv.innerHTML = '';
    tableroActual.forEach((carta, index) => {
        const tarjeta = document.createElement('div');
        tarjeta.className = `tarjeta ${seleccionadas[index] ? 'seleccionada' : ''}`;
        tarjeta.dataset.index = index;

        // Estructura interna
        tarjeta.innerHTML = `
            <div class="contenedor-imagen">
                <img src="${carta.archivo}" alt="${carta.nombre}" loading="lazy" onerror="this.src='https://via.placeholder.com/150?text=Error'">
            </div>
            <div class="pie-tarjeta">
                <span class="nombre" title="${carta.nombre}">${carta.nombre}</span>
                <span class="semilla">${seleccionadas[index] ? '🌰' : ''}</span>
            </div>
        `;

        // Evento click (touch y mouse)
        tarjeta.addEventListener('click', (e) => {
            e.stopPropagation();
            manejarClickCarta(index);
        });

        tableroDiv.appendChild(tarjeta);
    });

    // Verificar si todas están seleccionadas
    const todasSeleccionadas = seleccionadas.every(val => val === true);
    if (todasSeleccionadas && !juegoGanado && seleccionadas.length > 0) {
        juegoGanado = true;
        mensajeVictoria.style.display = 'block';
    } else if (!todasSeleccionadas) {
        juegoGanado = false;
        mensajeVictoria.style.display = 'none';
    }
}

// Manejar clic en carta (seleccionar/deseleccionar)
function manejarClickCarta(index) {
    if (juegoGanado) return; // no se puede cambiar si ya ganó (opcional, puedes desactivar)
    seleccionadas[index] = !seleccionadas[index];
    renderizarTablero();
}

// Reiniciar el juego (nuevo tablero, limpiar selección)
function reiniciarJuego() {
    // Detener cualquier progreso en curso
    detenerProgreso();

    tableroActual = generarTableroAleatorio();
    seleccionadas = new Array(CANTIDAD_CARTAS).fill(false);
    juegoGanado = false;
    mensajeVictoria.style.display = 'none';

    // Reiniciar barra de progreso visual
    barraProgreso.style.strokeDashoffset = '113.1'; // circunferencia aprox 2*pi*18

    renderizarTablero();
}

// ---- MANEJO DEL BOTÓN REINICIAR CON PROGRESO CIRCULAR ----
function iniciarProgreso() {
    if (intervaloProgreso) return; // ya está corriendo
    tiempoPresionado = 0;
    const circunferencia = 2 * Math.PI * 18; // ~113.097
    barraProgreso.style.strokeDasharray = circunferencia;
    barraProgreso.style.strokeDashoffset = circunferencia;

    const intervalo = 100; // ms
    const incrementoPorIntervalo = (TIEMPO_REINICIO_SEG * 1000) / intervalo; // 20 pasos si 100ms -> 2s/0.1 = 20
    const offsetPorIntervalo = circunferencia / incrementoPorIntervalo;

    intervaloProgreso = setInterval(() => {
        tiempoPresionado += intervalo;
        const progress = Math.min(tiempoPresionado / (TIEMPO_REINICIO_SEG * 1000), 1);
        const offset = circunferencia * (1 - progress);
        barraProgreso.style.strokeDashoffset = offset;

        if (progress >= 1) {
            // ¡Completado! Reiniciar
            clearInterval(intervaloProgreso);
            intervaloProgreso = null;
            reiniciarJuego();
        }
    }, intervalo);
}

function detenerProgreso() {
    if (intervaloProgreso) {
        clearInterval(intervaloProgreso);
        intervaloProgreso = null;
    }
    // Resetear barra a vacía
    barraProgreso.style.strokeDashoffset = '113.1';
}

// Eventos para ratón y táctil
btnReiniciar.addEventListener('mousedown', iniciarProgreso);
btnReiniciar.addEventListener('mouseup', detenerProgreso);
btnReiniciar.addEventListener('mouseleave', detenerProgreso);

btnReiniciar.addEventListener('touchstart', (e) => {
    e.preventDefault(); // evitar scroll o zoom
    iniciarProgreso();
});
btnReiniciar.addEventListener('touchend', (e) => {
    e.preventDefault();
    detenerProgreso();
});
btnReiniciar.addEventListener('touchcancel', detenerProgreso);

// Inicializar juego
function init() {
    tableroActual = generarTableroAleatorio();
    seleccionadas = new Array(CANTIDAD_CARTAS).fill(false);
    renderizarTablero();
}

init();