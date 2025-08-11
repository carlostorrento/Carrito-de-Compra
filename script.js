/**********************
 * Carrito Universitario Pruebav1 Carlos
 **********************/

// Datos base (si no hay nada guardado) 
let productos = [
  { id: 1, nombre: "Cuaderno", precio: 3.5, stock: 15 },
  { id: 2, nombre: "Lápiz", precio: 1.2, stock: 30 },
  { id: 3, nombre: "Calculadora", precio: 25, stock: 5 },
  { id: 4, nombre: "Mochila", precio: 45, stock: 8 }
];

let carrito = [];

// Claves de localStorage
const LS_KEYS = {
  carrito: "carrito",
  productos: "productos"
};

// LocalStorage 
function guardarEstado() {
  localStorage.setItem(LS_KEYS.carrito, JSON.stringify(carrito));
  localStorage.setItem(LS_KEYS.productos, JSON.stringify(productos));
}

function cargarEstado() {
  try {
    const c = localStorage.getItem(LS_KEYS.carrito);
    const p = localStorage.getItem(LS_KEYS.productos);
    if (p) productos = JSON.parse(p);
    if (c) carrito = JSON.parse(c);
  } catch (e) {
    console.warn("No se pudo cargar desde localStorage:", e);
  }
}

// Render de productos 
function mostrarProductos() {
  const contenedor = document.getElementById("lista-productos");
  contenedor.innerHTML = "";

  productos.forEach((producto) => {
    const col = document.createElement("div");
    col.className = "col-md-3 mb-4";

    col.innerHTML = `
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">${producto.nombre}</h5>
          <p class="card-text">Precio: $${producto.precio.toFixed(2)}</p>
          <p class="card-text">Stock: ${producto.stock}</p>
          <input type="number" min="1" max="${producto.stock}" id="cantidad-${producto.id}"
                 class="form-control mb-2" placeholder="Cantidad" ${producto.stock === 0 ? "disabled" : ""}>
          <button class="btn btn-sm btn-success w-100" onclick="agregarAlCarrito(${producto.id})"
                  ${producto.stock === 0 ? "disabled" : ""}>
            Agregar al carrito
          </button>
        </div>
      </div>
    `;
    contenedor.appendChild(col);
  });
}

//  Lógica de carrito 
function agregarAlCarrito(id) {
  const producto = productos.find((p) => p.id === id);
  const input = document.getElementById(`cantidad-${id}`);
  const cantidad = parseInt(input?.value, 10);

  if (!input || isNaN(cantidad) || cantidad <= 0) {
    alert("Por favor, ingresa una cantidad válida.");
    return;
  }

  // ✅ Validación correcta: contra stock restante
  if (cantidad > producto.stock) {
    alert("Stock insuficiente.");
    return;
  }

  const existente = carrito.find((item) => item.id === id);

  if (existente) {
    // Ya no sumamos existente.cantidad para validar
    existente.cantidad += cantidad;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad
    });
  }

  // Reducir el stock disponible
  producto.stock -= cantidad;

  // Limpiar input, guardar y re-renderizar
  input.value = "";
  guardarEstado();
  mostrarProductos();
  mostrarCarrito();
}

function eliminarDelCarrito(id) {
  const item = carrito.find((p) => p.id === id);
  const original = productos.find((p) => p.id === id);

  if (item) {
    // Regresar stock a productos
    original.stock += item.cantidad;
    // Quitar del carrito
    carrito = carrito.filter((p) => p.id !== id);
  }

  guardarEstado();
  mostrarProductos();
  mostrarCarrito();
}

function mostrarCarrito() {
  const lista = document.getElementById("items-carrito");
  const totalElem = document.getElementById("total");
  lista.innerHTML = "";

  let total = 0;

  carrito.forEach((item) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    const li = document.createElement("li");
    li.className =
      "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      ${item.nombre} x ${item.cantidad} = $${subtotal.toFixed(2)}
      <button class="btn btn-sm btn-danger" onclick="eliminarDelCarrito(${item.id})">Eliminar</button>
    `;
    lista.appendChild(li);
  });

  totalElem.innerText = `Total: $${total.toFixed(2)}`;
}

// ====== Facturación ======
function generarFacturaHTML() {
  let html = `<table class="table">
    <thead><tr>
      <th>Producto</th>
      <th>Cantidad</th>
      <th>Precio Unitario</th>
      <th>Total</th>
    </tr></thead>
    <tbody>`;

  let subtotal = 0;

  carrito.forEach((item) => {
    const total = item.precio * item.cantidad;
    subtotal += total;

    html += `<tr>
      <td>${item.nombre}</td>
      <td>${item.cantidad}</td>
      <td>$${item.precio.toFixed(2)}</td>
      <td>$${total.toFixed(2)}</td>
    </tr>`;
  });

  const impuestos = subtotal * 0.15;
  const totalFinal = subtotal + impuestos;

  html += `
    <tr><td colspan="3"><strong>Subtotal</strong></td><td>$${subtotal.toFixed(2)}</td></tr>
    <tr><td colspan="3"><strong>IVA (15%)</strong></td><td>$${impuestos.toFixed(2)}</td></tr>
    <tr><td colspan="3"><strong>Total a Pagar</strong></td><td><strong>$${totalFinal.toFixed(2)}</strong></td></tr>
  </tbody></table>`;

  return html;
}

function confirmarCompra() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  // Render del detalle
  document.getElementById("detalle-factura").innerHTML = generarFacturaHTML();

  // Mostrar modal
  const modalEl = document.getElementById("facturaModal");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  // Guardar por si el usuario recarga mientras está el modal
  guardarEstado();
}

// 👉 Mantiene el carrito y cierra el modal
function seguirComprando() {
  guardarEstado();

  const modalEl = document.getElementById("facturaModal");
  let modal = bootstrap.Modal.getInstance(modalEl);
  if (!modal) modal = new bootstrap.Modal(modalEl);
  modal.hide();

  // Re-render para continuar comprando
  mostrarProductos();
  mostrarCarrito();
}

// ====== Inicialización ======
cargarEstado();
mostrarProductos();
mostrarCarrito();

// Eventos
document.getElementById("btn-facturar").addEventListener("click", confirmarCompra);
document.getElementById("btn-seguir").addEventListener("click", seguirComprando);
