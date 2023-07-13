
class BaseDeDatos {
  constructor() {
    this.productos = [];
 
  }
 
  async traerRegistros() {
    const response = await fetch("json/productos.json");
    this.productos = await response.json();
    return this.productos;
  }

  registroPorId(id) {
    return this.productos.find((producto) => producto.id === id);
  }

  registrosPorNombre(palabra) {
    return this.productos.filter((producto) => producto.nombre.toLowerCase().includes(palabra));
  }
  registrosPorCategoria(categoria) {
    return this.productos.filter((producto) => producto.categoria == categoria);
  }
}


class Carrito {
  constructor() {
    const carritoStorage = JSON.parse(localStorage.getItem("carrito"));
    this.carrito = carritoStorage || [];
    this.total = 0;
    this.totalProductos = 0;
    this.listar();
  }

  estaEnCarrito({ id }) {
    return this.carrito.find((producto) => producto.id === id);
  }

  agregar(producto) {
    let productoEnCarrito = this.estaEnCarrito(producto);
    if (productoEnCarrito) {
      
      productoEnCarrito.cantidad++;
    } else {
    
      this.carrito.push({ ...producto, cantidad: 1 });
      localStorage.setItem("carrito", JSON.stringify(this.carrito));
    }
    this.listar();
  }

  quitar(id) {
    const indice = this.carrito.findIndex((producto) => producto.id === id);
    
    if (this.carrito[indice].cantidad > 100) {
      this.carrito[indice].cantidad--;
    } else {
      
      this.carrito.splice(indice, 1);
    }
    localStorage.setItem("carrito", JSON.stringify(this.carrito));
    this.listar();
  }
  restar(id) {
    const indice = this.carrito.findIndex((producto) => producto.id === id);
 
    if (this.carrito[indice].cantidad > 0) {
      this.carrito[indice].cantidad--;
    }localStorage.setItem("carrito", JSON.stringify(this.carrito));
    this.listar();
  }
  sumar(id) {
    const indice = this.carrito.findIndex((producto) => producto.id === id);
    if (this.carrito[indice].cantidad > -1) {
      this.carrito[indice].cantidad++;
    }
    localStorage.setItem("carrito", JSON.stringify(this.carrito));
    this.listar();
  }

  listar() {
    this.total = 0;
    this.totalProductos = 0;
    divCarrito.innerHTML = "";
    for (const producto of this.carrito) {
      divCarrito.innerHTML += `
      <div class="lista_carrito">
            <h5>${producto.nombre}</h5>
            <p>$${producto.precio}</p>
            <div class="btsumflex">
            <a href="#" data-id="${producto.id}" class="btnRestar">-</a><p>Cantidad: ${producto.cantidad}</p><a href="#" data-id="${producto.id}" class="btnSumar">+</a></div>
            <a href="#" data-id="${producto.id}" class="btnQuitar">Quitar</a>
            
        </div>
    `;
      this.total += producto.precio * producto.cantidad;
      this.totalProductos += producto.cantidad;
    }
    const botonesSumar = document.querySelectorAll(".btnSumar");
    for (const boton of botonesSumar) {
      boton.onclick = (event) => {
        event.preventDefault();
        this.sumar(Number(boton.dataset.id));
      };
    }
    const botonesRestar = document.querySelectorAll(".btnRestar");
    for (const boton of botonesRestar) {
      boton.onclick = (event) => {
        event.preventDefault();
        this.restar(Number(boton.dataset.id));
      };
    }

    
    const botonesQuitar = document.querySelectorAll(".btnQuitar");
    for (const boton of botonesQuitar) {
      boton.onclick = (event) => {
        event.preventDefault();
        this.quitar(Number(boton.dataset.id));
        Swal.fire({
          position: 'top',
          icon: 'warning',
          title: 'Su Producto fue quitado del carrito',
          showConfirmButton: false,
          timer: 1000
        })
      };
    }

    spanCantidadProductos.innerText = this.totalProductos;
    spanTotalCarrito.innerText = this.total;
  }
}

class Producto {
  constructor(id, nombre, precio, descripcion, imagen,categoria) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.descripcion = descripcion;
    this.imagen = imagen;
    this.categoria = categoria;

  }
}


const bd = new BaseDeDatos();

// Elementos
const divProductos = document.querySelector("#productos");
const divCarrito = document.querySelector("#carrito");
const spanCantidadProductos = document.querySelector("#cantidadProductos");
const spanTotalCarrito = document.querySelector("#totalCarrito");
const formBuscar = document.querySelector("#formBuscar");
const inputBuscar = document.querySelector("#inputBuscar");
const botonesAgregar = document.querySelectorAll(".btnAgregar");
const botonesCategorias = document.querySelectorAll(".btnCategoria");

botonesCategorias.forEach((boton) => {
  boton.addEventListener("click", (event) => {
    event.preventDefault();
    quitarClaseSeleccionado();
    boton.classList.add("seleccionado");
    const productosPorCategoria = bd.registrosPorCategoria(boton.innerText);
    cargarProductos(productosPorCategoria);
  });
});

const botonTodos = document.querySelector("#btnTodos");
botonTodos.addEventListener("click", (event) => {
  event.preventDefault();
  quitarClaseSeleccionado();
  botonTodos.classList.add("seleccionado");
  cargarProductos(bd.productos);
});

function quitarClaseSeleccionado() {
  const botonSeleccionado = document.querySelector(".seleccionado");
  if (botonSeleccionado) {
    botonSeleccionado.classList.remove("seleccionado");
  }
}
// Llamamos a la función
bd.traerRegistros().then((productos) => cargarProductos(productos));


// Muestra los registros de la base de datos en nuestro HTML
function cargarProductos(productos) {
  divProductos.innerHTML = "";
  for (const producto of productos) {
    divProductos.innerHTML += `
        <div class="producto container">
            <h3>${producto.nombre}</h3>
            <p>$${producto.precio}</p>
            <h6>${producto.descripcion}</h6>
            <img class="img" src="img/${producto.imagen}" />
            <p><a href="#" class="btnAgregar" data-id="${producto.id}">Agregar al carrito</a></p>
        </div>
    `;
  }
  
  const botonesAgregar = document.querySelectorAll(".btnAgregar");
  for (const boton of botonesAgregar) {
    boton.addEventListener("click", (event) => {
      event.preventDefault();
      const id = Number(boton.dataset.id);
      const producto = bd.registroPorId(id);
      carrito.agregar(producto);
      Swal.fire({
        position: 'top',
        icon: 'success',
        title: 'Su Producto fue agregado al carrito',
        showConfirmButton: false,
        timer: 1000
      })
    });
  }
}


formBuscar.addEventListener("submit", (event) => {
  event.preventDefault();
  const palabra = inputBuscar.value;
  cargarProductos(bd.registrosPorNombre(palabra.toLowerCase()));
});
inputBuscar.addEventListener("keyup", (event) => {
  event.preventDefault();
  const palabra = inputBuscar.value;
  cargarProductos(bd.registrosPorNombre(palabra.toLowerCase()));
});



const carrito = new Carrito();



