// script.js - Con semilla centrada en imagen

const TOTAL_IMAGENES_DISPONIBLES = 50;
const FILAS = 3;
const COLUMNAS = 4;
const CANTIDAD_CARTAS = FILAS * COLUMNAS;

const listaCompleta = Array.from({ length: TOTAL_IMAGENES_DISPONIBLES }, (_, i) => {
    const num = i + 1;
    return {
        id: num,
        nombre: `Carta ${num}`,
        archivo: `imagenes/${num}.jpg`
    };
});

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

listaCompleta.forEach((item, idx) => {
    if (idx < nombresReales.length) item.nombre = nombresReales[idx];
    else item.nombre = `Extra ${idx+1}`;
});

let tableroActual = [];
let seleccionadas = new Array(CANTIDAD_CARTAS).fill(false);
let juegoGanado = false;

let intervaloProgreso = null;
let tiempoPresionado = 0;
const TIEMPO_REINICIO_SEG = 2;

const tableroDiv = document.getElementById('tablero');
const mensajeVictoria = document.getElementById('mensajeVictoria');
const btnReiniciar = document.getElementById('btnReiniciar');
const barraProgreso = document.getElementById('barraProgreso');

function generarTableroAleatorio() {
    const copia = [...listaCompleta];
    const seleccion = [];
    for (let i = 0; i < CANTIDAD_CARTAS; i++) {
        if (copia.length === 0) break;
        const indice = Math.floor(Math.random() * copia.length);
        seleccion.push(copia[indice]);
        copia.splice(indice, 1);
    }
    return seleccion;
}

function renderizarTablero() {
    tableroDiv.innerHTML = '';
    tableroActual.forEach((carta, index) => {
        const tarjeta = document.createElement('div');
        tarjeta.className = `tarjeta ${seleccionadas[index] ? 'seleccionada' : ''}`;
        tarjeta.dataset.index = index;

        // Estructura: imagen + semilla centrada + nombre abajo
        tarjeta.innerHTML = `
            <div class="contenedor-imagen">
                <img src="${carta.archivo}" alt="${carta.nombre}" loading="lazy" onerror="this.src='https://via.placeholder.com/150?text=Error'">
                <div class="semilla-centrada">🌰</div>
            </div>
            <div class="pie-tarjeta">
                <span class="nombre" title="${carta.nombre}">${carta.nombre}</span>
            </div>
        `;

        tarjeta.addEventListener('click', (e) => {
            e.stopPropagation();
            manejarClickCarta(index);
        });

        tableroDiv.appendChild(tarjeta);
    });

    const todasSeleccionadas = seleccionadas.every(val => val === true);
    if (todasSeleccionadas && !juegoGanado && seleccionadas.length > 0) {
        juegoGanado = true;
        mensajeVictoria.style.display = 'block';
    } else if (!todasSeleccionadas) {
        juegoGanado = false;
        mensajeVictoria.style.display = 'none';
    }
}

function manejarClickCarta(index) {
    if (juegoGanado) return;
    seleccionadas[index] = !seleccionadas[index];
    renderizarTablero();
}

function reiniciarJuego() {
    detenerProgreso();
    tableroActual = generarTableroAleatorio();
    seleccionadas = new Array(CANTIDAD_CARTAS).fill(false);
    juegoGanado = false;
    mensajeVictoria.style.display = 'none';
    barraProgreso.style.strokeDashoffset = '113.1';
    renderizarTablero();
}

// Progreso del botón
function iniciarProgreso() {
    if (intervaloProgreso) return;
    tiempoPresionado = 0;
    const circunferencia = 2 * Math.PI * 18;
    barraProgreso.style.strokeDasharray = circunferencia;
    barraProgreso.style.strokeDashoffset = circunferencia;

    intervaloProgreso = setInterval(() => {
        tiempoPresionado += 100;
        const progress = Math.min(tiempoPresionado / (TIEMPO_REINICIO_SEG * 1000), 1);
        barraProgreso.style.strokeDashoffset = circunferencia * (1 - progress);

        if (progress >= 1) {
            clearInterval(intervaloProgreso);
            intervaloProgreso = null;
            reiniciarJuego();
        }
    }, 100);
}

function detenerProgreso() {
    if (intervaloProgreso) {
        clearInterval(intervaloProgreso);
        intervaloProgreso = null;
    }
    barraProgreso.style.strokeDashoffset = '113.1';
}

btnReiniciar.addEventListener('mousedown', iniciarProgreso);
btnReiniciar.addEventListener('mouseup', detenerProgreso);
btnReiniciar.addEventListener('mouseleave', detenerProgreso);

btnReiniciar.addEventListener('touchstart', (e) => {
    e.preventDefault();
    iniciarProgreso();
});
btnReiniciar.addEventListener('touchend', (e) => {
    e.preventDefault();
    detenerProgreso();
});
btnReiniciar.addEventListener('touchcancel', detenerProgreso);

function init() {
    tableroActual = generarTableroAleatorio();
    seleccionadas = new Array(CANTIDAD_CARTAS).fill(false);
    renderizarTablero();
}

init();
