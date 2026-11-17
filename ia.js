/* ===== RECONOCEDOR CON IA (Teachable Machine) =====
   PASO 1: pegá el enlace de tu modelo exportado (termina en /) */
const URL_MODELO = "https://teachablemachine.withgoogle.com/models/rilWD9D0w/";

/* PASO 2: nombre exacto de cada clase en Teachable Machine -> id del producto. "Nada" va con null */
const clasesIA = {
  "Bicicleta de montaña": 1,
  "Bicicleta urbana": 2,
  "Bicicleta de ruta": 3,
  "Bicicleta plegable": 4,
  "Pastillas de freno": 5,
  "Cubierta": 6,
  "Cámara de aire": 7,
  "Cadena": 8,
  "Pedales": 9,
  "Casco": 10,
  "Nada": null
};

/* PASO 3: seguridad mínima para reconocer (0.8 = 80%) */
const UMBRAL = 0.8;

let modelo = null;
let stream = null;
const $ = id => document.getElementById(id);

async function cargarModelo() {
  if (!URL_MODELO) {
    $("avisoDemo").style.display = "block";
    return null;
  }
  if (!modelo) modelo = await tmImage.load(URL_MODELO + "model.json", URL_MODELO + "metadata.json");
  return modelo;
}

function mostrarFuente(tipo) {
  $("iaVacio").style.display = "none";
  $("iaVideo").style.display = tipo === "video" ? "block" : "none";
  $("iaImagen").style.display = tipo === "imagen" ? "block" : "none";
  $("btnAnalizar").style.display = "inline-block";
}

$("btnCamara").onclick = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
    $("iaVideo").srcObject = stream;
    mostrarFuente("video");
  } catch (e) {
    mostrarToast("No se pudo acceder a la cámara");
  }
};

$("btnFoto").onclick = () => $("inputFoto").click();

$("inputFoto").onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  $("iaImagen").src = URL.createObjectURL(file);
  mostrarFuente("imagen");
};

function obtenerFuente() {
  if ($("iaImagen").style.display === "block") return $("iaImagen");
  if ($("iaVideo").style.display === "block") {
    const c = document.createElement("canvas");
    c.width = $("iaVideo").videoWidth;
    c.height = $("iaVideo").videoHeight;
    c.getContext("2d").drawImage($("iaVideo"), 0, 0);
    return c;
  }
  return null;
}

function pintarBarras(preds) {
  $("iaBarras").innerHTML = preds.slice(0, 4).map(p => `
    <div class="ia-barra">
      <div class="etiqueta"><span>${p.className}</span><span>${Math.round(p.probability * 100)}%</span></div>
      <div class="fondo"><div class="relleno" style="width:${p.probability * 100}%"></div></div>
    </div>`).join("");
}

function mostrarResultado(mejor) {
  const res = $("iaResultado");
  const id = clasesIA[mejor.className];
  if (mejor.probability < UMBRAL || id === undefined || id === null) {
    res.innerHTML = `<div class="nombre">No reconocimos ningún producto</div>
      <div class="aviso">Probá con otra foto, con más luz o más cerca del producto.</div>`;
    return;
  }
  const p = buscarProducto(id);
  res.innerHTML = `
    <div class="nombre">${p.emoji} ${p.nombre}</div>
    <div class="precio">${formatearPrecio(p.precio)}</div>
    <div class="resenas">${p.resenas.map(r => `<blockquote>"${r.texto}" – ${r.autor}</blockquote>`).join("")}</div>
    <div style="margin-top:10px"><button class="btn" onclick="agregarAlCarrito(${p.id})">Agregar al pedido</button></div>`;
}

function predecirDemo() {
  const nombres = Object.keys(clasesIA);
  const vals = nombres.map(() => Math.random());
  const suma = vals.reduce((a, b) => a + b, 0);
  const preds = nombres.map((n, i) => ({ className: n, probability: vals[i] / suma }));
  return preds.sort((a, b) => b.probability - a.probability);
}

$("btnAnalizar").onclick = async () => {
  $("iaResultado").innerHTML = `<div class="aviso">Analizando...</div>`;
  try {
    let preds;
    if (URL_MODELO) {
      const m = await cargarModelo();
      const fuente = obtenerFuente();
      if (!fuente) return mostrarToast("Primero activá la cámara o subí una foto");
      preds = (await m.predict(fuente)).sort((a, b) => b.probability - a.probability);
    } else {
      await cargarModelo();
      preds = predecirDemo();
    }
    pintarBarras(preds);
    mostrarResultado(preds[0]);
  } catch (e) {
    $("iaResultado").innerHTML = `<div class="aviso">Hubo un error al analizar la imagen.</div>`;
  }
};
