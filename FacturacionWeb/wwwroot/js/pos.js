// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

function showError(id, message) {
    $(id).text(message);
}

let currentPage = 1;
let itemsPerPage = 10;
let totalArticulos = 0;

function findArticleById(articleId) {
    $.ajax({
        url: "/Articulo/GetArticulo", 
        type: "POST",
        data: {
            id: articleId
        },
        success: function (article) {
            console.log('Article:', article);
            openEditModal(article);
        },
        error: function (xhr, status, error) {
            console.error("Error fetching Article:", xhr.status, xhr.statusText);
        }
    });
}

function openEditModal(article) {
    $('#inputIdActualizar').val(article?.id);
    $('#inputCodigoActualizar').val(article?.codigo);
    $('#inputNombreActualizar').val(article?.nombre);
    $('#inputPrecioActualizar').val(article?.precio);
    $('#inputAplicaIvaActualizar').val(article?.aplicaIva);

    if (article?.aplicaIva == 1) {
        $("#inputAplicaIvaActualizar").prop("checked", true);
    } else {
        $("#inputAplicaIvaActualizar").prop("checked", false);
    }
    showError("#ErrorMessageUpdate", "");
    $('#actualizarModal').modal('show');
}

function openDeleteModal(articleId) {
    $('#inputIdEliminar').val(articleId);

    $('#deleteModal').modal('show');
}

function editArticle(button) {
    let articleId = $(button).data('article-id');

    findArticleById(articleId)
}

function deleteArticle(button) {
    let articleId = $(button).data('article-id');

    openDeleteModal(articleId)
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        getArticulos()
        updatePagination();
    }
}


function updatePagination() {

    if (currentPage === 1) {
        $('#pagination button:contains("Previous")').prop('disabled', true);
    } else {
        $('#pagination button:contains("Previous")').prop('disabled', false);
    }

    if (currentPage >= totalArticulos) {
        $('#pagination button:contains("Next")').prop('disabled', true);
    } else {
        $('#pagination button:contains("Next")').prop('disabled', false);
    }
}


function nextPage() {
    console.warn({ totalArticulos, currentPage, itemsPerPage })
    if (currentPage < totalArticulos) {
        currentPage++;
        getArticulos()
        updatePagination();
    }
}

function clearForm(id) {
    let form = $(id)[0];
    form.reset();
}

function fillTableBody(data) {
    let tableBody = $("#myTableBodyArticulos");

    tableBody.empty();

    const articulos = data.articulos;

    $.each(articulos, function (index, item) {
        let ivaMonto = 0;
        let total = 0;

        if (item.aplicaIva === 1) {

            ivaMonto = calculateIVA(item.precio);

            total = calculateTotal(item.precio, ivaMonto);
        } else {

            total = item.precio;
        }

        let row = `<tr>
            <td class="align-middle">${item.codigo}</td>
            <td class="align-middle">${item.nombre}</td>
            <td class="align-middle">${formatCurrency(item.precio)}</td>
            <td class="align-middle">${formatCurrency(ivaMonto)}</td>
            <td class="align-middle">${formatCurrency(total)}</td>
            <td class="align-middle">
                <a class="btn btn-outline-warning" data-article-id="${item.id}" onclick="editArticle(this)">
                    <i class="bg-info bi-pencil-square"></i> Edit
                </a>
                <a class="btn btn-outline-danger" data-article-id="${item.id}" onclick="deleteArticle(this)">
                    <i class="bg-info bi-pencil-trash"></i> Delete
                </a>
            </td>
        </tr>`;

        tableBody.append(row);
    });
}

function calculateIVA(price) {
    return price * 0.13;
}

function calculateTotal(price, iva) {
    return price + iva;
}

function formatCurrency(amount) {
    return amount.toFixed(2);
}

function getArticulos() {
    $.ajax({
        url: "/Articulo/GetArticulos?page=" + currentPage + "&itemsPerPage=" + itemsPerPage,
        type: "GET",
        success: function (articulosData) {
            console.warn({ articulosData})
            currentPage = articulosData.currentPage;
            itemsPerPage = articulosData.itemsPerPage;
            totalArticulos = articulosData.total;

            if (totalArticulos && totalArticulos>0) {
                $("#productTableContent").slideDown();
                fillTableBody(articulosData);
            }
            
        },
        error: function (xhr, status, error) {
            console.error("Error fetching Articulos:", xhr.status, xhr.statusText);
        }
    });
}

function handleCreateSuccess(data) {
    $("#agregarModal").modal("hide");
    clearForm("#agregarForm")
    getArticulos();
}

function handleUpdateSuccess(data) {
    $("#actualizarModal").modal("hide");
    clearForm("#modificarForm")
    getArticulos();
}

// Define a function to handle errors
function handleCreateError(xhr, status, error) {
    const errorResponse = xhr.responseJSON;

    console.warn({ xhr, status, error, errorResponse })
    if (xhr.status === 400 || xhr.status === 500) {
        // Bad Request or Internal Server Error
        console.error("Error:", errorResponse?.mensaje);
        showError("#ErrorMessage", errorResponse?.mensaje);
    } else {
        // Handle other statuses if needed
        console.error("Error:", xhr.status, xhr.statusText);
        showError("#ErrorMessage", "Internal Server Error");
    }
}

function createArticulo(formData) {
    console.warn({formData})
    $.ajax({
        url: "/Articulo/Create",
        type: "POST",
        data: formData,
        success: handleCreateSuccess,
        error: handleCreateError
    });
}

function handleUpdateError(xhr, status, error) {
    const errorResponse = xhr.responseJSON;

    console.warn({ xhr, status, error, errorResponse })
    if (xhr.status === 400 || xhr.status === 500) {
        console.error("Error:", errorResponse?.mensaje);
        showError("#ErrorMessageUpdate", errorResponse?.mensaje);
    } else {
        console.error("Error:", xhr.status, xhr.statusText);
        showError("#ErrorMessageUpdate", "Internal Server Error");
    }
}

function updateArticulo() {
    let formData = {
        Id: $("#inputIdActualizar").val(),
        Codigo: $("#inputCodigoActualizar").val(),
        Nombre: $("#inputNombreActualizar").val(),
        Precio: $("#inputPrecioActualizar").val(),
        AplicaIva: $("#inputAplicaIvaActualizar").prop("checked")?1:0
    };
    console.warn({ formData})
    $.ajax({
        type: "POST",
        url: "/Articulo/Update", 
        data: formData,
        success: handleUpdateSuccess,
        error: handleUpdateError
    });
}

function appendCheckboxToFormData(formData, checkboxName, isChecked) {
    let encodedValue = isChecked ? 1: 0;
    return formData + "&" + checkboxName + "=" + encodedValue;
}

$(document).ready(function () {

    getArticulos();

    $("#agregarForm").submit(function (event) {
        event.preventDefault();
        showError("#ErrorMessage", "");

        let formData = $(this).serialize();

        let isChecked = $("#AplicaIva").prop("checked");
        formData = appendCheckboxToFormData(formData, "AplicaIva", isChecked);

        createArticulo(formData);
    });


    $("#modificarForm").submit(function (event) {
        event.preventDefault();
        showError("#ErrorMessageUpdate", "");

        updateArticulo();
    });

    $("#confirmDeleteBtn").on("click", function () {
        var idToDelete = $("#inputIdEliminar").val(); 

        const deleteUrl = "/Articulo/Delete/";

        $.ajax({
            type: "POST",
            url: deleteUrl,
            data: {
                id: idToDelete
            },
            success: function (data) {
                // Handle success, if needed
                console.log("Success: ", data);
                $("#deleteModal").modal("hide"); // Hide the modal after successful deletion
                getArticulos()
            },
            error: function (error) {
                // Handle error, if needed
                $("#ErrorMessageDelete").text("Error deleting the article.");
                console.error("Error: ", error);
            }
        });
    });

});
