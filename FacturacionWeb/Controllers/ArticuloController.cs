using FacturacionWeb.API;
using FacturacionWeb.Models;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Net;
using System.Net.Http.Headers;

namespace FacturacionWeb.Controllers
{
    public class ArticuloController : Controller
    {
        private readonly HttpClient _httpClient;

        public ArticuloController(IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient("MyHttpClient");
        }

        public async Task<IActionResult> Index()
        {
            string jwtToken = Request.Cookies["YourCookieName"];

            try
            {
                //if (jwtToken == null)
                //{
                //    return RedirectToAction("Index", "Home");
                //}

                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwtToken);


                HttpResponseMessage response = await _httpClient.GetAsync($"articulos");

                if (response.IsSuccessStatusCode)
                {
                    ArticulosResponse articulosResponse = await response.Content.ReadAsAsync<ArticulosResponse>();

                    return View(articulosResponse.Articulos);
                }
                else if (response.StatusCode == HttpStatusCode.Unauthorized)
                {
                    return RedirectToAction("Index", "Home");
                }
            }
            catch (HttpRequestException ex)
            {
                throw;
            }
            finally
            {
                _httpClient.DefaultRequestHeaders.Authorization = null;
            }

            return View();

        }

        [HttpGet]
        public async Task<IActionResult> GetArticulos(int page = 1, int itemsPerPage = 10)
        {
            string jwtToken = Request.Cookies["YourCookieName"];

            try
            {
                HttpResponseMessage response = await _httpClient.GetAsync($"articulos?Page={page}&PageSize={itemsPerPage}");

                if (response.IsSuccessStatusCode)
                {
                    return Ok(await response.Content.ReadAsAsync<ArticulosResponse>());
                }
                else if (response.StatusCode == HttpStatusCode.Unauthorized)
                {
                    return RedirectToAction("Index", "Home");
                }

                return BadRequest();
            }
            catch (HttpRequestException ex)
            {
                throw;
            }
            finally
            {
                _httpClient.DefaultRequestHeaders.Authorization = null;
            }
        }


        [HttpPost]
        public  async Task<IActionResult> Create(Articulo newArticulo)
        {
            string jwtToken = Request.Cookies["YourCookieName"];

            try
            {
                HttpResponseMessage response = await _httpClient.PostAsJsonAsync("articulos", newArticulo);


                if (response.IsSuccessStatusCode)
                {
                    return StatusCode(201,await response.Content.ReadAsAsync<Articulo>());
                }
                else if (response.StatusCode == HttpStatusCode.Unauthorized)
                {
                    return RedirectToAction("Index", "Home");
                }else if (response.StatusCode == HttpStatusCode.BadRequest)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    ErrorResponse errorResponse = JsonConvert.DeserializeObject<ErrorResponse>(content);
                    return BadRequest(errorResponse);

                }

                return BadRequest();
            }
            catch (HttpRequestException ex)
            {
                throw;
            }
            finally
            {
                _httpClient.DefaultRequestHeaders.Authorization = null;
            }
        }

    }
}
