# Gestor de Finanzas Personal - Proyecto Final JavaScript 🚀

Bienvenido al repositorio de mi Proyecto Final para el curso de JavaScript en Coderhouse. 

Este proyecto es una aplicación web basada en un simulador interactivo de Home Banking y gestión financiera personal. Permite a los usuarios administrar múltiples cuentas, registrar ingresos y egresos, visualizar balances actualizados y filtrar su historial de movimientos.

## ⚙️ Características y Funcionalidades

* **Gestión de Múltiples Cuentas:** Creación de cuentas en diferentes divisas (UYU y USD) con saldos iniciales independientes.
* **Cotización en Tiempo Real:** Integración de una API externa para mostrar el valor actualizado del Dólar (USD) a Pesos Uruguayos (UYU).
* **Registro de Transacciones:** Formulario interactivo para cargar ingresos y egresos, afectando automáticamente el saldo de la cuenta seleccionada.
* **Validación de Saldos:** El sistema impide realizar egresos si la cuenta no dispone de los fondos suficientes.
* **Filtros Avanzados:** Panel para filtrar el historial de movimientos por tipo (ingreso/egreso), cuenta, categoría o rango de fechas.

## 🛠️ Requisitos Técnicos Cumplidos

El código fue desarrollado cumpliendo con las rúbricas de evaluación del curso:

1. **Uso de DOM y Eventos:** Toda la interfaz se genera y actualiza dinámicamente mediante JavaScript interaccionando con el HTML. No hay datos estáticos quemados en la vista.
2. **Sintaxis y Lógica Estructural:** Uso de Clases (`Cuenta`, `Movimientos`), Arrays, y funciones de orden superior (`filter`, `find`, `reduce`, `sort`).
3. **Uso de JSON y Fetch:** Las categorías de los movimientos se cargan de manera asíncrona desde el archivo local `categorias.json` mediante la API Fetch. Adicionalmente, se consume la API externa `open.er-api.com` para la cotización de la moneda.
4. **Almacenamiento Local:** Se utiliza `localStorage` para persistir las cuentas y el historial de movimientos, simulando una base de datos de usuario.
5. **Uso de Librerías Externas:** * **SweetAlert2:** Para el manejo UX de alertas, notificaciones (Toasts) y confirmaciones, eliminando por completo el uso de `alert()`, `prompt()` y `confirm()` nativos.
   * **Flatpickr:** Para la selección estilizada y amigable de rangos de fechas en los filtros.
   * **Cleave.js:** Para el formateo automático de los inputs de montos numéricos.
   * **Bootstrap 5:** Framework CSS utilizado para el diseño y la responsividad.

## 🚀 Instrucciones de Ejecución (Para el Tutor/Corrector) 

Debido a que el proyecto utiliza la tecnología Fetch para consumir un archivo `.json` local, es necesario correr la aplicación a través de un servidor local para evitar bloqueos por políticas de CORS del navegador.

1. Clonar el repositorio.
2. Abrir el proyecto en Visual Studio Code.
3. Iniciar el servidor local utilizando la extensión **Live Server**.
4. ¡Listo! La aplicación se abrirá en el navegador por defecto.
