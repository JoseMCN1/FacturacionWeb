using FacturacionWeb.API;
using FacturacionWeb.Models;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Diagnostics;
using System.Net;
using System.Net.Http.Headers;

namespace FacturacionWeb.Controllers
{
    public class FacturacionController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly HttpClient _httpClient;

        public FacturacionController(ILogger<HomeController> logger, IHttpClientFactory httpClientFactory)
        {
            _logger = logger;
            _httpClient = httpClientFactory.CreateClient("MyHttpClient");
        }
        public IActionResult Index()
        {
            string jwtToken = Request.Cookies["YourCookieName"];

            if (jwtToken == null)
            {
                return RedirectToAction("Index", "Home");
            }

            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Create(POSRequest pos)
        {
            string jwtToken = Request.Cookies["YourCookieName"];

            if (jwtToken == null)
            {
                return RedirectToAction("Index", "Home");
            }

            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwtToken);

            try
            {
                

                HttpResponseMessage response = await _httpClient.PostAsJsonAsync("pos", pos);

                POSResponse posResponse = await response.Content.ReadAsAsync<POSResponse>();

                if (response.IsSuccessStatusCode)
                {
                    return StatusCode(201, posResponse);
                }
                else if (response.StatusCode == HttpStatusCode.Unauthorized)
                {
                    return RedirectToAction("Index", "Home");
                }
                else if (response.StatusCode == HttpStatusCode.BadRequest)
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

        [HttpPost]
        public async Task<IActionResult> GetFactura(int id)
        {
            string jwtToken = Request.Cookies["YourCookieName"];

            if (jwtToken == null)
            {
                return RedirectToAction("Index", "Home");
            }

            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwtToken);

            try
            {
                HttpResponseMessage response = await _httpClient.GetAsync($"pos/{id}");

                if (response.IsSuccessStatusCode)
                {
                    return Ok(await response.Content.ReadAsAsync<FacturaResponse>());
                }
                else if (response.StatusCode == HttpStatusCode.Unauthorized)
                {
                    return RedirectToAction("Index", "Home");
                }

                return BadRequest();
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Error getting {ex.Message}");
                throw;
            }
            finally
            {
                _httpClient.DefaultRequestHeaders.Authorization = null;
            }
        }


    }
}