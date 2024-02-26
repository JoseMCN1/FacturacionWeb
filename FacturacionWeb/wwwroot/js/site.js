// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

function showError(id, message) {
    $(id).text(message);
}

let currentPage = 1;
let itemsPerPage = 10;
let totalArticulos = 0;

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

    // Disable/enable "Next" button based on the current page
    if (currentPage >= totalArticulos) {
        $('#pagination button:contains("Next")').prop('disabled', true);
    } else {
        $('#pagination button:contains("Next")').prop('disabled', false);
    }
}


// Function to change to the next page
function nextPage() {
    console.log("sss")
    console.warn({ totalArticulos, currentPage, itemsPerPage })
    if (currentPage < totalArticulos) {
        currentPage++;
        getArticulos()
        updatePagination();
    }
}


function fillTableBody(data) {
    var tableBody = $("#myTableBodyArticulos");

    // Clear existing rows
    tableBody.empty();

    const articulos = data.articulos;

    // Iterate through the data and append rows to the tbody
    $.each(articulos, function (index, item) {
        var row = '<tr>' +
            '<td class="align-middle">' + item.codigo + '</td>' +
            '<td class="align-middle">' + item.nombre + '</td>' +
            '<td class="align-middle">' + item.precio + '</td>' +
            '<td class="align-middle">' +
            '<a class="btn btn-outline-primary"><i class="bg-info bi-pencil-square"></i> Edit</a>' +
            '<a class="btn btn-outline-danger"><i class="bg-info bi-pencil-trash"></i> Delete</a>' +
            '</td>' +
            '</tr>';

        tableBody.append(row);
    });
}

function getArticulos() {
    $.ajax({
        url: "/Articulo/GetArticulos?page=" + currentPage + "&itemsPerPage=" + itemsPerPage,
        type: "GET",
        success: function (articulosData) {
            // Update the table or perform any other necessary actions with the new data
            console.warn({ articulosData})
            currentPage = articulosData.currentPage;
            itemsPerPage = articulosData.itemsPerPage;
            totalArticulos = articulosData.total;
            fillTableBody(articulosData);
        },
        error: function (xhr, status, error) {
            // Handle errors in the GetArticulos method if needed
            console.error("Error fetching Articulos:", xhr.status, xhr.statusText);
        }
    });
}

// Define a function to handle success and call GetArticulos
function handleCreateSuccess(data) {
    console.warn(data);
    // Handle success (e.g., close the modal, refresh the table)
    $("#agregarModal").modal("hide");

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

// Use a named function for clarity
function createArticulo(formData) {
    $.ajax({
        url: "/Articulo/Create",
        type: "POST",
        data: formData,
        success: handleCreateSuccess,
        error: handleCreateError
    });
}


$(document).ready(function () {

    getArticulos();

    // Attach an event listener to the form submission
    $("#agregarForm").submit(function (event) {
        // Prevent the default form submission
        event.preventDefault();
        showError("#ErrorMessage", "");
        // Get form data
        var formData = $(this).serialize();

        // Call the createArticulo function with the form data
        createArticulo(formData);
    });
});
