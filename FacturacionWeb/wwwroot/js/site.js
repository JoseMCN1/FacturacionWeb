
function buscarArticulo(codigo,cantidad) {
    $.ajax({
        url: "/Articulo/GetArticulos?code=" + codigo,
        type: "GET",
        success: function (articulosData) {
            console.warn({ articulosData })
            if (articulosData.articulos && articulosData.articulos.length > 0) {
                agregarFilaArticulo(articulosData.articulos[0], cantidad);
            }
        },
        error: function (xhr, status, error) {
            console.error("Error fetching Articulos:", xhr.status, xhr.statusText);
        }
    });
}

function cleanFields() {
     $('#nombre').val("");
     $('#codigo').val("");
    $('#cantidad').val("");
    $('#btnAgregarArticulo').prop('disabled', true);
}

function checkToAddArticle() {
    var cantidadInput = $('#cantidad');
    cantidadInput.val(cantidadInput.val().replace(/\D/g, ''));

    let nombre = $('#nombre').val();
    let codigo = $('#codigo').val();
    let cantidad = $('#cantidad').val();

    if (cantidad && codigo && nombre) {
        if (parseInt(cantidad) > 0) {
            $('#btnAgregarArticulo').prop('disabled', false);
        } else {
            $('#btnAgregarArticulo').prop('disabled', true);
        }
    } else {
        $('#btnAgregarArticulo').prop('disabled', true);
    }
}


function agregarFilaArticulo(articulo, cantidad) {
    // Check if the article is already present in the table
    const existingRow = $("#myTableBodyFacturacion tr").filter(function () {
        return $(this).find("td:first").text() === articulo.codigo;
    });

    if (existingRow.length > 0) {
        // Article already exists, you can handle this situation as needed
        alert("Este artículo ya ha sido agregado.");
        return;
    }

    let precio = parseFloat(articulo.precio);
    let ivaMonto = 0;
    let total = 0;

    if (articulo.aplicaIva === 1) {

        ivaMonto = calculateIVA(precio*cantidad);

        total = calculateTotal(precio*cantidad, ivaMonto);
    } else {

        total = precio * cantidad;
    }

    const newRow = `<tr data-id="${articulo.id}" data-iva="${articulo.aplicaIva}" data-precio="${precio}" data-cantidad="${cantidad}" data-total="${total}">
            <td>${articulo.codigo}</td>
            <td>${articulo.nombre}</td>
            <td>${formatCurrency(precio)}</td>
            <td>${formatCurrency(ivaMonto)}</td>
            <td>${cantidad}</td>
            <td>${formatCurrency(total)}</td>
        </tr>`;

    $("#myTableBodyFacturacion").append(newRow);
    calcularTotal();
    cleanFields();
}

function calcularTotal() {
    let total = 0;

    $("#myTableBodyFacturacion tr").each(function () {
        let colum = $(this).find("td:eq(5)").text();
        let rowTotal = parseFloat(colum);
        console.warn({ colum, rowTotal })
        if (colum) {
            total += rowTotal;
        }
    });

    const totalRow = `<tr class="total-row">
            <td colspan="5" class="text-right"></td>
            <td>${formatCurrency(total)}</td>
        </tr>`;

    $("#myTableBodyFacturacion tr.total-row").remove();
    $("#myTableBodyFacturacion").append(totalRow);
}

let timeoutId;

function delayedAjaxCall() {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(function () {
        let codigoValue = document.getElementById('codigo').value;

        $.ajax({
            url: "/Articulo/GetArticulos?code=" + codigoValue,
            type: "GET",
            success: function (articulosData) {
                console.warn({ articulosData })
                if (articulosData.articulos && articulosData.articulos.length > 0) {
                    let articulo = articulosData.articulos[0];
                    $('#nombre').val(articulo?.nombre);
                } else {
                    $('#nombre').val("");
                    $('#btnAgregarArticulo').prop('disabled', true);
                }
            },
            error: function (xhr, status, error) {
                $('#nombre').val("");
                console.error("Error fetching Articulos:", xhr.status, xhr.statusText);
            }
        });

    }, 2000);
}


function showBillingInformation(facturaId) {
    $.ajax({
        url: "/facturacion/GetFactura",
        type: "POST",
        data: {
            id: facturaId
        },
        success: function (factura) {
            fillModal(factura)
        },
        error: function (xhr, status, error) {
            console.error("Error fetching Article:", xhr.status, xhr.statusText);
        }
    });
}

function fillModal(data) {
    $("#consecutivo").text(data.consecutivo);
    $("#numeroFactura").text(data.numeroFactura);
    $("#vendedorId").text(data.vendedorId);
    $("#fechaCreacion").text(new Date(data.fechaCreacion).toLocaleString());
    $("#subtotal").text(data.subtotal.toFixed(2));
    $("#montoTotal").text(data.montoTotal.toFixed(2));

    const $articulosTableBody = $("#articulosTableBody").empty();

    data.articuloFacturas.forEach(function (articulo) {
        $articulosTableBody.append(`
                <tr>
                    <td>${articulo.codigo}</td>
                    <td>${articulo.cantidad}</td>
                    <td>${articulo.precioUnitario.toFixed(2)}</td>
                    <td>${articulo.aplicaIva === 1 ? "Sí" : "No"}</td>
                    <td>${articulo.montoTotal.toFixed(2)}</td>
                </tr>
            `);
    });

    $('#modalFactura').modal('show');
}

function handleCreatePOSSuccess(data) {
    if (data && data?.id > 0) {
        $("#myTableBodyFacturacion").empty();
        showBillingInformation(data?.id);
    }
   
}


function handleCreatePOSError(xhr, status, error) {
    const errorResponse = xhr.responseJSON;

    console.warn({ xhr, status, error, errorResponse })
    if (xhr.status === 400 || xhr.status === 500) {
        alert(errorResponse?.mensaje);
    } else {
        alert(errorResponse?.mensaje);
    }
}


function createPOS(formData) {
    console.warn({ formData })
    $.ajax({
        url: "/facturacion/Create",
        type: "POST",
        data: formData,
        success: handleCreatePOSSuccess,
        error: handleCreatePOSError
    });
}

$(document).ready(function () {

    $("#btnAgregarArticulo").click(function () {
        const codigo = $("#codigo").val();
        let cantidad = $("#cantidad").val();
        if (codigo && codigo.length > 0 && parseInt(cantidad) > 0) {
            buscarArticulo(codigo,cantidad)
        }
    });

    $("#btnImprimir").click(function () {
        //showBillingInformation(1)
        //return;
        const allRows = $("#myTableBodyFacturacion tr");
        let montoTotalFactura = 0;
        let subTotalFactura = 0;
        let articulos = [];

        allRows.each(function () {
            const id = $(this).data("id");
            let precio = $(this).data("precio");
            let cantidad = $(this).data("cantidad");
            let total = $(this).data("total");
            let aplicaIVA = $(this).data("iva");
            let ivaMonto = 0;
           
            if (aplicaIVA == 1) {
                ivaMonto = calculateIVA(precio * cantidad);
            }

            if (id) {
                articulos.push({
                    idArticulo: id,
                    montoTotal: total,
                    cantidad: cantidad,
                    precioUnitario: precio,
                    aplicaIva: aplicaIVA,
                })

                subTotalFactura += (precio * cantidad)
                montoTotalFactura += total;

            }

          
        });

        console.warn({ subTotalFactura, montoTotalFactura, articulos });

        if (subTotalFactura && montoTotalFactura && articulos.length > 0) {
            const posRequest  = {
                MontoTotal: montoTotalFactura,
                SubTotal: subTotalFactura,
                Articulos: articulos
            };
            createPOS(posRequest);
        }

    });
});
