
//-------------------------------------Inicio funcionalidades generales--------------------------
async function mandarData(url, data){
    const response = await fetch(url, {
        method: 'POST',
        body: data
    })
    const resp = await response.json();
    return resp;
}

function navegar(liga){
    window.location.assign(liga);
}

function mostrar(divId){
    div = document.getElementById(divId);
    div.style.display = 'block';
}

function esconder(divId){
    div = document.getElementById(divId);
    div.style.display = 'none';
}

function mostrarPopUp(mensaje){
    div = document.getElementById('fondoPopUp');
    div.style.display = 'flex';
    document.getElementById('mensajePopUp').innerText = mensaje;
}

function esconderPopUp(){
    esconder('fondoPopUp');
    document.getElementById('mensajePopUp').innerText = "";
}

//Convertir div en imagen y esa imagen en PDF
function getPDF(divId){
    let div = document.getElementById(divId);
    domtoimage.toPng(div)
    .then(function(dataUrl){
        //Crear imagen y asignarle como src el div convertido a imagen
        let img = new Image();
        img.src = dataUrl;

        //Settings PDF
        const wid = div.offsetWidth - 40;
        const hgt = div.offsetHeight - 75;
        const hratio = hgt/wid;
        let doc = new jsPDF();
        const width = doc.internal.pageSize.getWidth();  
        const height = width * hratio;
        doc.addImage(img.src, 'JPEG', 20, 10, width-40, height);
        doc.save('LaPape.pdf');
    })
    .catch(function(error){
        console.log(error);
    });
}
//-------------------------------------Fin funcionalidades generales------------------------------------


//Validar si usuario existe
function validarUsuario(){
    if(!localStorage.getItem('usuario')){
        navegar('login.html');
    }
    
}


function validarUsuarioyCarrito(){
    if(!localStorage.getItem('carrito') || !localStorage.getItem('usuario')){
        navegar('index.html');
    }
}

// ------------------------------------INICIO funcionalidad nav---------------------------

function mostrarEsconder(divId){
    div = document.getElementById(divId);
    if(div.style.display == 'none' || div.style.display == ""){
        div.style.display = 'block';
    }
    else{
        if(div.style.display == 'block'){
            div.style.display = 'none';
        }
    }   
}

//Validar si hay items por comprar en el carrito
function navegarCompra(liga){
    if(localStorage.getItem('totales')){
        // const url = liga + '?carrito=T';
        navegar(liga);
    }
    else{
        mostrarPopUp('No hay artículos que comprar');
        // alert('No hay artículos que comprar');
    }
}

//Validar si al hacer la compra hay un usuario
function navegarCompraFinal(liga){
    if(localStorage.getItem('totales')){
        if(localStorage.getItem('usuario')){
            navegar(liga);
        }
        else{
            navegar('login.html');
        }
    }
    else{
        mostrarPopUp('No hay artículos que comprar');
    }
}

function cerrarSesion(){
    localStorage.clear();
    navegar('index.html');
}

// ------------------------------------Fin funcionalidad nav---------------------------


// ------------------------------------INCIO funcionalidad carrito---------------------------

    //Agregar funcionalidad a botones de cada tarjeta
    function addBtnFunctionality(){
        let btns = document.getElementsByClassName('btnTarjeta');
        for (let index = 0; index < btns.length; index++) {
            btns[index].addEventListener('click', agregarCarrito);
        }
    }

    //Vaciar carrito
    async function vaciarCarrito(){
        if(document.getElementById('subtotal').innerText == "0.00"){
            mostrarPopUp('Carrito de compras está vacío');
            // alert('Carrito está vacío');
        }
        document.getElementById('shopping-cart-items').innerHTML = "";
        await datosDineroCompra();
        await guardarCarrito();
        //await actualizarTotales();
    }

    //Borrar item de carrito
    async function deleteItem(){
        const div = event.target.parentElement;
        div.parentNode.removeChild(div);
        await datosDineroCompra();
        await guardarCarrito();
        //await actualizarTotales();
    }


    //Actualizar datos de subtotal, envio y total
    async function datosDineroCompra(){
        const subtotal = document.getElementById('subtotal');
        const envio = document.getElementById('envio');                
        const total = document.getElementById('total');
        const sub = await obtenerSubtotal();
        const tot = sub + 50;
        subtotal.innerText = sub;
        if(sub == 0){
            subtotal.innerText = "0.00";
            envio.innerText = "0.00";
            total.innerText = "0.00";
        }
        else{
            envio.innerText = 50.00;
            total.innerText = tot;
            document.getElementById('cart-icon').style.backgroundColor = '#00609F';
            setTimeout(function(){
                document.getElementById('cart-icon').style.backgroundColor = '#1C1B1B';
            }, 800);
        }
        
    }

    //Agregar item a carrito
    async function agregarCarrito(){
        //Obtener div padre (div.tarjeta)
        let div = event.target.parentElement;
        if(div.id == 'detalles-tarjeta'){
            div = document.getElementById('tarjeta');
        }
        //Obtener valores de la tarjeta seleccionada
        const cantidad = div.getElementsByClassName('cant')[0].value;
        const id = div.getElementsByClassName('idProducto')[0].value;
        if(cantidad>0){
            const banderaItemExiste = await validarItemCarrito(id);
            if(!banderaItemExiste){
                const nombre = div.getElementsByClassName('nombre')[0].innerText;
                const imagen = div.getElementsByClassName('imagen')[0].src;
                const precio = div.getElementsByClassName('costo')[0].innerText;

                //Crear item y agrergarlo a carrito
                document.getElementById('shopping-cart-items').innerHTML += 
                    `
                    <div class="shopping-cart-item">
                        <img src=${imagen} alt="" class="shopping-cart-item-img">
                        <div class="shopping-cart-item-data">
                            <input type="hidden" class="idItem" name="" value=${id}>
                            <p class="shopping-cart-item-nombre">${nombre}</p>
                            <p class="shopping-cart-item-precio">Precio: $<span class="cart-item-precio">${precio}</span></p>
                            <p class="shopping-cart-item-cantidad">Cantidad: <span class="cart-item-cantidad">${cantidad}</span></p>
                        </div>
                        <i class="fas fa-trash eliminarItem" onclick="deleteItem()"></i>
                    </div>
                `;
                await datosDineroCompra();
                await guardarCarrito();
            }

            else{
                mostrarPopUp('Elemento ya está en el carrito');
                // alert('Elemento ya está en el carrito');
            }   
        }
        else{
            if(cantidad == ""){
                mostrarPopUp('Ingrese una cantidad');
                // alert('Ingrese una cantidad');
            }
            else{
                mostrarPopUp('Ingrese una cantidad válida');
                // alert('Cantidad inválida');
            }
        }
    }

    //Función para validar si ya está el item en el carrito
    async function validarItemCarrito(idItem){
        let bandera = false;
        const items = await document.querySelectorAll('.shopping-cart-item');
        items.forEach(element => {
            const id = element.getElementsByClassName('idItem')[0].value;
            if(idItem == id){
                bandera = true;
            }
        });
        
        return bandera;
    }

    //Obtener subtotal de las cantidades * el de cada item
    async function obtenerSubtotal(){
        const items = await document.querySelectorAll('.shopping-cart-item');
        let subtotal = 0;
        items.forEach(element => {
            let precio = element.getElementsByClassName('cart-item-precio')[0].innerText;
            let cantidad = element.getElementsByClassName('cart-item-cantidad')[0].innerText;
            cantidad = parseInt(cantidad);
            precio = parseFloat(precio);
            subtotal += cantidad * precio;
        });
        
        return subtotal;
    }

    //Guardar en localstorage items de carrito
    async function guardarCarrito(){

        const subtotal = document.getElementById('subtotal').innerText;

        if(subtotal != 0.00){
            const envio = document.getElementById('envio').innerText;                
            const total = document.getElementById('total').innerText;

            let cartTotals = {
                subtotal: subtotal,
                envio: envio,
                total: total,
            };

            let arrayCarrito = [];

            const items = await document.querySelectorAll('.shopping-cart-item');
            items.forEach(element => {
                const id = element.getElementsByClassName('idItem')[0].value;
                const nombre = element.getElementsByClassName('shopping-cart-item-nombre')[0].innerText;
                const imagen = element.getElementsByClassName('shopping-cart-item-img')[0].src;
                const precio = element.getElementsByClassName('cart-item-precio')[0].innerText;
                const cantidad = element.getElementsByClassName('cart-item-cantidad')[0].innerText;

                let cartItem = {
                    id: id,
                    nombre: nombre,
                    imagen: imagen,
                    precio: precio,
                    cantidad: cantidad
                };
                arrayCarrito.push(cartItem);
            });

            const carrito = JSON.stringify(arrayCarrito);
            localStorage.setItem('carrito', carrito);
            const tots = JSON.stringify(cartTotals);
            localStorage.setItem('totales', tots);
        }
        else{
            localStorage.removeItem('carrito');
            localStorage.removeItem('totales');
        }
    }

    //Checar si hay un carrito en el localstorage
    async function obtenerItemsCarrito(){
        let carrito = await localStorage.getItem('carrito');
        if(carrito){
            carrito = JSON.parse(carrito);

            carrito.forEach(element => {
                document.getElementById('shopping-cart-items').innerHTML += 
                    `
                    <div class="shopping-cart-item">
                        <img src=${element.imagen} alt="" class="shopping-cart-item-img">
                        <div class="shopping-cart-item-data">
                            <input type="hidden" class="idItem" name="" value=${element.id}>
                            <p class="shopping-cart-item-nombre">${element.nombre}</p>
                            <p class="shopping-cart-item-precio">Precio: $<span class="cart-item-precio">${element.precio}</span></p>
                            <p class="shopping-cart-item-cantidad">Cantidad: <span class="cart-item-cantidad">${element.cantidad}</span></p>
                        </div>
                        <i class="fas fa-trash eliminarItem" onclick="deleteItem()"></i>
                    </div>
                `;
             });

            await mostrarTotales('subtotal', 'envio', 'total');
        }
    }


    async function mostrarTotales(idSubtotal, idEnvio, idTotal){
        let totales = await localStorage.getItem('totales');
        if(totales){
            totales = JSON.parse(totales);
            const subtotal = totales.subtotal;
            const envio = totales.envio;
            const total = totales.total;
            document.getElementById(idSubtotal).innerText = subtotal;
            document.getElementById(idEnvio).innerText = envio;
            document.getElementById(idTotal).innerText = total;
        }
        else{
            document.getElementById(idSubtotal).innerText = "0.00";
            document.getElementById(idEnvio).innerText = "0.00";
            document.getElementById(idTotal).innerText = "0.00";
        }
    }


// ------------------------------------Fin funcionalida carrito---------------------------
