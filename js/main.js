const monto = new Cleave('#monto', {
    numeral: true,
    numeralThousandsGroupStyle: 'thousand',
});

const saldo_inicial = new Cleave('#saldo-inicial', {
    numeral: true,
    numeralThousandsGroupStyle: 'thousand',
});

const form_cuenta = document.getElementById('form-cuenta');
const btn_nueva_cuenta = document.getElementById('btn-nueva-cuenta');
let categorias = [];
const tipoMov = document.getElementById('tipo-movimiento');
tipoMov.addEventListener('change', () => renderizarCategorias());
const cuentas = JSON.parse(localStorage.getItem('cuentas')) || [];
const movimientos = JSON.parse(localStorage.getItem('movimientos')) || [];
const form_movimiento = document.getElementById('form-movimiento');

function limpiarformMovimiento() {
    tipoMov.value = 'ingreso';
    monto.setRawValue('');
}


btn_nueva_cuenta.addEventListener('click', (e) => {
    document.getElementById('cuenta-id').value = '';
    document.getElementById('nombre-cuenta').value = '';
    document.getElementById('moneda-cuenta').value = 'UYU';
    saldo_inicial.setRawValue('');
});

form_cuenta.addEventListener('submit', (e) => {
    e.preventDefault();
    agregarCuenta();
});

form_movimiento.addEventListener('submit', (e) => {
    e.preventDefault();
    agregarMovimiento();
})


async function obtenerCotizacionDolar() {
    const cotizacion = document.getElementById('cotizacion-usd');
    cotizacion.textContent = 'Cargando ...';

    const url = 'https://open.er-api.com/v6/latest/USD';

    try {
        const respuesta = await fetch(url);
        if (!respuesta.ok) {
            throw new Error(`HTTP ERROR status: ${respuesta.status}`);
        }

        const datos = await respuesta.json();
        const valor = datos.rates.UYU;

        cotizacion.textContent = valor.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    } catch (e) {
        console.error('Error al obtener la cotización:', e);
        cotizacion.textContent = 'No disponible';
    }

}


const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#fdfcfb',
    color: '#29211d',
    iconColor: '#388e3c',
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    },
});

const alertConfirmacion = Swal.mixin({
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    background: '#fdfcfb',
    color: '#29211d',
    confirmButtonColor: '#d32f2f',
    cancelButtonColor: '#857873'
});

const ToastConfirmar = Swal.mixin({
    toast: true,
    showCancelButton: true,
    confirmButtonText: 'Sí',
    cancelButtonText: 'No',
    timer: false,
    timerProgressBar: false,
    background: '#fdfcfb',
    color: '#29211d',
    confirmButtonColor: '#d32f2f',
    cancelButtonColor: '#857873',
    iconColor: '#d32f2f',
    icon: 'warning'
});
function obtenerSiguienteIdSecuencial(array) {
    if (array.length === 0) {
        return 1;
    }

    const idMasAlto = array.reduce((maximoAcumulado, cuentaActual) => {
        if (cuentaActual.id > maximoAcumulado) {
            return cuentaActual.id;
        } else {
            return maximoAcumulado;
        }
    }, 0);

    return idMasAlto + 1;
}

function agregarCuenta() {
    let id_cuenta = obtenerSiguienteIdSecuencial(cuentas);
    let nom_cuenta = document.getElementById('nombre-cuenta').value;
    let mon_cuenta = document.getElementById('moneda-cuenta').value;
    let saldo = saldo_inicial.getRawValue();
    let nuevaCuenta = new Cuenta(id_cuenta, nom_cuenta, mon_cuenta, saldo);
    cuentas.push(nuevaCuenta);
    localStorage.setItem('cuentas', JSON.stringify(cuentas));

    const modalElement = document.getElementById('modalCuenta');
    const modalInstancia =
        bootstrap.Modal.getInstance(modalElement) ||
        new bootstrap.Modal(modalElement);
    modalInstancia.hide();

    Toast.fire({
        icon: 'success',
        title: 'Cuenta creada con éxito',
    });

    renderizarCuentas();
}

function agregarMovimiento() {
    let fecha = (new Date).toISOString().split('T')[0];
    let cod_cuenta = parseInt(document.getElementById('cuenta-origen').value);
    let categoria = document.getElementById('categoria').value;
    let valor = parseFloat(monto.getRawValue());
    let tipoMov = document.getElementById('tipo-movimiento').value;
    let cuenta = cuentas.find(cu => cu.id === cod_cuenta);

    if (!cuenta) {
        Toast.fire({
            icon: 'error',
            title: 'Por favor, seleccione una cuenta válida',
            iconColor: '#d32f2f'
        });
        return;
    }

    if (tipoMov === 'egreso' && (parseFloat(cuenta.saldo) - valor < 0)) {
        Toast.fire({
            icon: 'warning',
            title: 'Saldo insuficiente',
            text: `La cuenta "${cuenta.nombre}" solo dispone de $ ${parseFloat(cuenta.saldo).toLocaleString('en-US')}`,
            iconColor: '#f5a133'
        });
        return;
    }

    let movimiento = new Movimientos(fecha, cod_cuenta, categoria, valor, tipoMov);
    movimientos.push(movimiento);

    cuenta.saldo = tipoMov === 'ingreso' ? parseFloat(cuenta.saldo) + valor : parseFloat(cuenta.saldo) - valor;

    localStorage.setItem('cuentas', JSON.stringify(cuentas));
    localStorage.setItem('movimientos', JSON.stringify(movimientos));

    renderizarCuentas();
    limpiarformMovimiento();
    aplicarFiltros();

    Toast.fire({
        icon: 'success',
        title: 'Transacción registrada con éxito'
    })
}

function renderizarCuentas() {
    const contenedor = document.getElementById('contenedor-cuentas');
    const selectCuentas = document.getElementById('cuenta-origen');

    contenedor.innerHTML = '';
    selectCuentas.innerHTML = '<option value="" disabled selected hidden>Seleccione cuenta...</option>';

    document.getElementById('filtro-cuenta').innerHTML = '<option value="todas">Todas las cuentas</option>';

    cuentas.forEach((cuenta) => {
        let moneda = cuenta.moneda === 'UYU' ? 'uyu' : 'usd';
        let simbolo = cuenta.moneda === 'UYU' ? '$' : 'U$S';
        let saldo = parseFloat(cuenta.saldo).toLocaleString('en-Us', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        const divCuenta = document.createElement('div');
        divCuenta.className = 'col-lg-4 col-md-6 mb-3';

        const tarjeta = document.createElement('div');
        tarjeta.className = `account-card ${moneda}`;

        const btnEliminar = document.createElement('button');
        btnEliminar.className = 'btn-delete-account';
        btnEliminar.textContent = '🗑️';

        btnEliminar.addEventListener('click', () => {
            alertConfirmacion.fire({
                title: `¿Eliminar ${cuenta.nombre}?`
            }).then((result) => {
                if (result.isConfirmed) {
                    eliminarCuenta(cuenta.id);
                }
            });
        });

        const divNombre = document.createElement('div');
        divNombre.className = 'acc-name';
        divNombre.textContent = cuenta.nombre;

        const divSaldo = document.createElement('div');
        divSaldo.className = 'acc-balance';
        divSaldo.textContent = `${simbolo} ${saldo}`;

        tarjeta.appendChild(btnEliminar);
        tarjeta.appendChild(divNombre);
        tarjeta.appendChild(divSaldo);

        divCuenta.appendChild(tarjeta);

        contenedor.appendChild(divCuenta);

        const option = document.createElement('option');
        option.value = cuenta.id;
        option.textContent = `${cuenta.nombre} (${simbolo})`;
        selectCuentas.appendChild(option);

        const optionFiltro = document.createElement('option');
        optionFiltro.value = cuenta.id;
        optionFiltro.textContent = cuenta.nombre;
        document.getElementById('filtro-cuenta').appendChild(optionFiltro);
    });
}

function eliminarCuenta(id) {
    const indice = cuentas.findIndex(c => c.id === id);

    if (indice !== -1) {
        const nombreEliminado = cuentas[indice].nombre;
        cuentas.splice(indice, 1);
        localStorage.setItem('cuentas', JSON.stringify(cuentas));
        renderizarCuentas();
        Toast.fire({
            icon: 'success',
            title: `Cuenta ${nombreEliminado} eliminada correctamente`,
        });
    }
}

function renderizarCategorias() {
    const tipoMov = document.getElementById('tipo-movimiento').value;
    const selectCategoria = document.getElementById('categoria');

    selectCategoria.innerHTML = '<option value="" disabled selected hidden>Seleccione categoría...</option>';
    const categoriasFiltradas = categorias.filter(cat => cat.tipo === tipoMov);

    categoriasFiltradas.forEach(cat => {
        const opcion = document.createElement('option');
        opcion.value = cat.id;
        opcion.textContent = cat.nombre;
        selectCategoria.appendChild(opcion);
    });

}

async function cargarCategorias() {
    try {

        const respuesta = await fetch('../json/categorias.json');
        if (!respuesta.ok) {
            throw new Error('Error al cargar las categorias');
        }
        categorias = await respuesta.json();
        renderizarCategorias();

        const filtroCategoria = document.getElementById('filtro-categoria');
        filtroCategoria.innerHTML = '<option value="todas">Todas las categorías</option>';
        categorias.forEach(cat => {
            const opcion = document.createElement('option');
            opcion.value = cat.id;
            opcion.textContent = cat.nombre;
            filtroCategoria.appendChild(opcion);
        });

    } catch (e) {
        console.log('Error obteniendo las categorias:', e);
    }
}

function renderizarTablaMovimientos(movimientosAMostrar) {
    const tbody = document.getElementById('tabla-movimientos');
    tbody.innerHTML = '';

    if (movimientosAMostrar.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    No se encontraron movimientos para los filtros seleccionados.
                </td>
            </tr>`;
        return;
    }

    movimientosAMostrar.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    movimientosAMostrar.forEach(mov => {
        const cuentaObj = cuentas.find(c => c.id === mov.cuenta);
        const nombreCuenta = cuentaObj ? cuentaObj.nombre : 'Cuenta Eliminada';
        const simbolo = cuentaObj && cuentaObj.moneda === 'USD' ? 'U$S' : '$';
        const categoriaObj = categorias.find(cat => cat.id === mov.categoria);
        const nombreCategoria = categoriaObj ? categoriaObj.nombre : 'Categoría Desconocida';
        const [year, month, day] = mov.fecha.split('-');
        const fechaFormateada = `${day}/${month}/${year}`;
        const montoNum = parseFloat(mov.monto).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const claseColor = mov.tipo === 'ingreso' ? 'text-income' : 'text-expense';
        const signo = mov.tipo === 'ingreso' ? '+' : '-';
        const textoTipo = mov.tipo === 'ingreso' ? 'Ingreso' : 'Egreso';
        const badgeTipo = mov.tipo === 'ingreso' ? 'bg-success bg-opacity-75' : 'bg-danger bg-opacity-75';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-medium">${fechaFormateada}</td>
            <td><span class="badge ${badgeTipo}">${textoTipo}</span></td>
            <td>${nombreCuenta}</td>
            <td><span class="badge" style="background-color: var(--border-warm); color: var(--text-primary);">${nombreCategoria}</span></td>
            <td class="${claseColor} fw-bold">${signo} ${simbolo} ${montoNum}</td>
        `;
        tbody.appendChild(tr);
    });    
}

function aplicarFiltros() {
    const tipo = document.getElementById('filtro-tipo').value;
    const cuenta = document.getElementById('filtro-cuenta').value;
    const categoria = document.getElementById('filtro-categoria').value;
    const fechaDesde = document.getElementById('filtro-fecha-desde').value;
    const fechaHasta = document.getElementById('filtro-fecha-hasta').value;

    let movimientosFiltrados = [...movimientos];

    if (tipo !== 'todos') {
        movimientosFiltrados = movimientosFiltrados.filter(mov => mov.tipo === tipo);
    }

    if (cuenta !== 'todas') {
        movimientosFiltrados = movimientosFiltrados.filter(mov => mov.cuenta === parseInt(cuenta));
    }

    if (categoria !== 'todas') {
        movimientosFiltrados = movimientosFiltrados.filter(mov => mov.categoria === categoria);
    }

    if (fechaDesde) {
        movimientosFiltrados = movimientosFiltrados.filter(mov => mov.fecha >= fechaDesde);
    }

    if (fechaHasta) {
        movimientosFiltrados = movimientosFiltrados.filter(mov => mov.fecha <= fechaHasta);
    }

    renderizarTablaMovimientos(movimientosFiltrados);
}


function inicializarFiltrosFecha() {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = hoy.getMonth();
    
    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);


    flatpickr("#filtro-fecha-desde", {
        dateFormat: "Y-m-d", 
        altInput: true,       
        altFormat: "d/m/Y",   
        locale: "es",         
        onChange: aplicarFiltros,
        defaultDate: primerDia
    });

    flatpickr("#filtro-fecha-hasta", {
        dateFormat: "Y-m-d", 
        altInput: true,       
        altFormat: "d/m/Y",   
        locale: "es",         
        onChange: aplicarFiltros,
        defaultDate: ultimoDia
    });
}
document.getElementById('filtro-tipo').addEventListener('change', aplicarFiltros);
document.getElementById('filtro-cuenta').addEventListener('change', aplicarFiltros);
document.getElementById('filtro-categoria').addEventListener('change', aplicarFiltros);
document.getElementById('filtro-fecha-desde').addEventListener('change', aplicarFiltros);
document.getElementById('filtro-fecha-hasta').addEventListener('change', aplicarFiltros);

async function cargarPagina() {
    limpiarformMovimiento();
    await cargarCategorias();
    renderizarCuentas();
    obtenerCotizacionDolar();
    inicializarFiltrosFecha();
    aplicarFiltros();
}

cargarPagina();