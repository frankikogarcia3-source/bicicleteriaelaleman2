/* ===== CATÁLOGO =====
   Para agregar una foto: poné el archivo en la carpeta img/ y completá el campo "img".
   Si "img" queda vacío, se muestra el emoji. */
const productos = [
  { id: 1, categoria: "Bicicletas", nombre: "Bicicleta de montaña Rodado 29", precio: 450000, emoji: "🚵", img: "bicicletamontaña.png", resenas: [
      { texto: "Muy firme en bajada y los frenos responden genial.", autor: "Lucas" } ] },
  { id: 2, categoria: "Bicicletas", nombre: "Bicicleta urbana Rodado 26", precio: 380000, emoji: "🚲", img: "bicistunt.png", resenas: [
      { texto: "Ideal para ir al trabajo, liviana y cómoda.", autor: "Valeria" } ] },
  { id: 3, categoria: "Bicicletas", nombre: "Bicicleta de ruta Rodado 700", precio: 620000, emoji: "🚴", img: "Bicicleta de ruta Rodado 700.png", resenas: [
      { texto: "Rapidísima, el armado en el local fue impecable.", autor: "Matías" } ] },
  { id: 4, categoria: "Bicicletas", nombre: "Bicicleta plegable Rodado 20", precio: 350000, emoji: "🛴", img: "bicicletaplegable.png", resenas: [
      { texto: "Entra en el baúl y pesa poco. La recomiendo.", autor: "Carla" } ] },
  { id: 5, categoria: "Componentes", nombre: "Pastillas de freno (juego)", precio: 12000, emoji: "🛑", img: "pastillasdefreno.png", resenas: [
      { texto: "Frenan mucho mejor que las originales.", autor: "Diego" } ] },
  { id: 6, categoria: "Componentes", nombre: "Cubierta 26\" x 1.95", precio: 18000, emoji: "⭕", img: "cubiertas.png", resenas: [
      { texto: "Buen agarre en asfalto mojado.", autor: "Paula" } ] },
  { id: 7, categoria: "Componentes", nombre: "Cámara de aire 26\"", precio: 6000, emoji: "🔘", img: "camaradeaire.png", resenas: [
      { texto: "Cambio rápido y precio justo.", autor: "Sebastián" } ] },
  { id: 8, categoria: "Componentes", nombre: "Cadena 9 velocidades", precio: 15000, emoji: "🔗", img: "", resenas: [
      { texto: "Cambios suaves desde que la puse.", autor: "Andrea" } ] },
  { id: 9, categoria: "Componentes", nombre: "Juego de pedales", precio: 22000, emoji: "⚙️", img: "", resenas: [
      { texto: "Muy sólidos y con buen rodamiento.", autor: "Gonzalo" } ] },
  { id: 10, categoria: "Accesorios", nombre: "Casco de ciclista", precio: 45000, emoji: "⛑️", img: "", resenas: [
      { texto: "Liviano y con buena ventilación.", autor: "Camila" } ] }
];

/* ===== CARRITO ===== */
let carrito = [];
const WHATSAPP = "5493429234923";
let filtroActual = "Todos";

const buscarProducto = id => productos.find(p => p.id === id);
const formatearPrecio = n => "$" + n.toLocaleString("es-AR");

function agregarAlCarrito(id) {
  const p = buscarProducto(id);
  if (!p) return;
  const existe = carrito.find(i => i.id === id);
  if (existe) existe.cantidad++;
  else carrito.push({ id, cantidad: 1 });
  actualizarCarrito();
  mostrarToast(p.nombre + " agregado al pedido");
}

function quitarDelCarrito(id) {
  const item = carrito.find(i => i.id === id);
  if (!item) return;
  item.cantidad--;
  if (item.cantidad <= 0) carrito = carrito.filter(i => i.id !== id);
  actualizarCarrito();
}

function actualizarCarrito() {
  const cont = document.getElementById("itemsCarrito");
  let total = 0, cant = 0;
  cont.innerHTML = carrito.length ? "" : "<p>Tu pedido está vacío.</p>";
  carrito.forEach(i => {
    const p = buscarProducto(i.id);
    total += p.precio * i.cantidad;
    cant += i.cantidad;
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `<span>${p.nombre} x${i.cantidad}</span>
      <span><strong>${formatearPrecio(p.precio * i.cantidad)}</strong>
      <button onclick="quitarDelCarrito(${p.id})" style="border:none;background:none;cursor:pointer;color:#b91c1c;font-weight:800">−</button></span>`;
    cont.appendChild(div);
  });
  document.getElementById("totalCarrito").textContent = formatearPrecio(total);
  document.getElementById("cantCarrito").textContent = cant;
}

function enviarPedido() {
  if (!carrito.length) return mostrarToast("Tu pedido está vacío");
  let total = 0;
  const lineas = carrito.map(i => {
    const p = buscarProducto(i.id);
    total += p.precio * i.cantidad;
    return `- ${i.cantidad} x ${p.nombre} (${formatearPrecio(p.precio * i.cantidad)})`;
  });
  const msg = `Hola! Quiero hacer este pedido:\n${lineas.join("\n")}\nTotal: ${formatearPrecio(total)}`;
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
}

function mostrarToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("ver");
  setTimeout(() => t.classList.remove("ver"), 1800);
}

/* ===== RENDER CATÁLOGO ===== */
function renderFiltros() {
  const cats = ["Todos", ...new Set(productos.map(p => p.categoria))];
  document.getElementById("filtros").innerHTML = cats.map(c =>
    `<button class="${c === filtroActual ? "activo" : ""}" onclick="filtrar('${c}')">${c}</button>`).join("");
}

function filtrar(cat) {
  filtroActual = cat;
  renderFiltros();
  renderCatalogo();
}

function renderCatalogo() {
  const lista = filtroActual === "Todos" ? productos : productos.filter(p => p.categoria === filtroActual);
  document.getElementById("listaProductos").innerHTML = lista.map(p => `
    <div class="producto">
      <div class="foto">${p.img ? `<img src="${p.img}" alt="${p.nombre}">` : p.emoji}</div>
      <div class="info">
        <div class="categoria">${p.categoria}</div>
        <h3>${p.nombre}</h3>
        <div class="precio">${formatearPrecio(p.precio)}</div>
        <div class="resenas">${p.resenas.map(r => `<blockquote>"${r.texto}" – ${r.autor}</blockquote>`).join("")}</div>
        <button class="btn" onclick="agregarAlCarrito(${p.id})">Agregar al pedido</button>
      </div>
    </div>`).join("");
}

document.getElementById("abrirCarrito").onclick = () => document.getElementById("carrito").classList.add("abierto");
document.getElementById("cerrarCarrito").onclick = () => document.getElementById("carrito").classList.remove("abierto");
document.getElementById("btnEnviarPedido").onclick = enviarPedido;

renderFiltros();
renderCatalogo();
actualizarCarrito();
