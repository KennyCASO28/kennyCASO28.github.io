//BUSCAR
document.addEventListener('DOMContentLoaded', () => {
  const buscarInput = document.getElementById('buscar');
  const verTodoBtn = document.getElementById('verTodo');
  const secciones = document.querySelectorAll('main section');

  buscarInput.addEventListener('input', () => {
    const filtro = buscarInput.value.toLowerCase();

    secciones.forEach(seccion => {
      const productos = seccion.querySelectorAll('.producto');
      let coincidencias = 0;

      productos.forEach(prod => {
        const texto = prod.textContent.toLowerCase();
        const visible = texto.includes(filtro);
        prod.style.display = visible ? 'block' : 'none';
        if (visible) coincidencias++;
      });

      // Oculta la sección si no hay coincidencias
      seccion.style.display = coincidencias > 0 ? 'block' : 'none';
    });
  });

  verTodoBtn.addEventListener('click', () => {
    buscarInput.value = '';
    secciones.forEach(seccion => {
      seccion.style.display = 'block';
      seccion.querySelectorAll('.producto').forEach(prod => {
        prod.style.display = 'block';
      });
    });
  });
});

//ver todo
document.getElementById('verTodo').addEventListener('click', () => {
  document.querySelectorAll('.producto').forEach(prod => {
    prod.style.display = 'block';
  });
  document.getElementById('buscar').value = '';
});


document.addEventListener('DOMContentLoaded', () => {
    const carrusel = document.getElementById('carrusel');
    const tarjetas = carrusel.querySelectorAll('.tarjeta');
    const puntos = document.getElementById('puntos');
    let index = 0;

    // Crear puntos
    tarjetas.forEach((_, i) => {
      const punto = document.createElement('span');
      if (i === 0) punto.classList.add('activo');
      punto.addEventListener('click', () => moverCarrusel(i));
      puntos.appendChild(punto);
    });

    // Función para mover el carrusel
    function moverCarrusel(i) {
      index = i;
      const offset = tarjetas[i].offsetLeft;
      carrusel.scrollTo({ left: offset, behavior: 'smooth' });
      actualizarPuntos();
    }

    // Flechas (si las tienes)
    const izq = document.querySelector('.flecha.izquierda');
    const der = document.querySelector('.flecha.derecha');

    if (izq && der) {
      izq.addEventListener('click', () => {
        if (index > 0) moverCarrusel(index - 1);
      });

      der.addEventListener('click', () => {
        if (index < tarjetas.length - 1) moverCarrusel(index + 1);
      });
    }

    // Actualizar puntos activos
    function actualizarPuntos() {
      puntos.querySelectorAll('span').forEach((p, i) => {
        p.classList.toggle('activo', i === index);
      });
    }
  });
  
  //ocultar todo excepto lo que buscas
  document.addEventListener('DOMContentLoaded', () => {
    const buscarInput = document.getElementById('buscar');
    const verTodoBtn = document.getElementById('verTodo');
    const secciones = document.querySelectorAll('main section');
    const boletin = document.getElementById('boletin'); // Carrusel

    buscarInput.addEventListener('input', () => {
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

      // Oculta el banner si hay búsqueda activa
      boletin.style.display = filtro ? 'none' : 'block';
    });

    verTodoBtn.addEventListener('click', () => {
      buscarInput.value = '';
      secciones.forEach(seccion => {
        seccion.style.display = 'block';
        seccion.querySelectorAll('.producto').forEach(prod => {
          prod.style.display = 'block';
        });
      });
      boletin.style.display = 'block'; // Mostrar el banner nuevamente
    });
  });
  