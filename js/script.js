document.addEventListener('DOMContentLoaded',() => {
    const botonHamburguesa = document.querySelector('.menu-hamburguesa');
    const menuDesplegable = document.querySelector('.menu-desplegable');
    const botonCerrarMenu = document.querySelector('.cerrar-menu');

    function abrirMenu () {
        menuDesplegable.classList.add('activo');
        botonHamburguesa.setAttribute('aria-expanded', 'true');
    }

    function cerrarMenu () {
        menuDesplegable.classList.remove('activo');
        botonHamburguesa.setAttribute('aria-expanded', 'false');
    }

    botonHamburguesa.addEventListener('click', abrirMenu);
    botonCerrarMenu.addEventListener('click', cerrarMenu);

    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape') {
            cerrarMenu();
        }
    });

    const botonIdioma = document.querySelector('.selector-idioma-boton');
    const listaIdiomas = document.getElementById('idioma-desplegable');

    botonIdioma.addEventListener('click', (evento) => {
        evento.stopPropagation();

        const estaAbierto = listaIdiomas.classList.toggle('activo');
        botonIdioma.setAttribute('aria-expanded', estaAbierto);
    });

    const opcionesIdioma = document.querySelectorAll('.idioma-opcion');
    opcionesIdioma.forEach((Option) => {
        option.addEventListener('click', () => {
            const idiomaElegido = opcion.dataset.idioma;
            console.log('idiomaElegido:', idiomaElegido);
        });
    });

    document.addEventListener ('click', (evento) => {
        const clicFueraDelSelector = !evento.target.closets('.selector-idioma');
        if (clicFueraDelSelector) {
            listaIdiomas.classList.remove('activo');
            botonIdioma.setAttribute ('aria-expanded', 'false');
        }
    });
})