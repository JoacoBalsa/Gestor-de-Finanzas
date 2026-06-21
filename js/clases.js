class Cuenta {
    constructor(id,nombre,moneda,saldo){
        this.id = id;
        this.nombre = nombre;
        this.moneda = moneda;
        this.saldo = saldo;
    }
}

class Movimientos{
    constructor(fecha,cuenta,categoria,monto,tipo){
        this.id = crypto.randomUUID();
        this.fecha = fecha;
        this.cuenta = cuenta;
        this.categoria = categoria;
        this.monto = monto;
        this.tipo = tipo;
    }
}