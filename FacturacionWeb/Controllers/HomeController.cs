using FacturacionWeb.API;
using FacturacionWeb.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace FacturacionWeb.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly HttpClient _httpClient;

        public HomeController(ILogger<HomeController> logger, IHttpClientFactory httpClientFactory)
        {
            _logger = logger;
            _httpClient = httpClientFactory.CreateClient("MyHttpClient");
        }
        public IActionResult Index()
        {
            Response.Cookies.Delete("YourCookieName");

            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Index(LoginRequest model)
        {
            if (ModelState.IsValid)
            {
                LoginResponse result = await LoginAPI.Login(model, "autenticacion/login", _httpClient);

                if (result?.Errors != null && result?.Errors.Count > 0)
                {
                    foreach (var error in result.Errors)
                    {
                        foreach (var errorMessage in error.Value)
                        {
                            ModelState.AddModelError(error.Key, errorMessage);
                        }
                    }
                }
                else if (result?.Mensaje != null)
                {
                    ModelState.AddModelError(string.Empty, result?.Mensaje);
                }
                else
                {
                    var cookieOptions = new CookieOptions
                    {
                        Secure = true,
                        HttpOnly = true,
                        SameSite = SameSiteMode.Strict,
                        Expires = DateTimeOffset.UtcNow.Add(TimeSpan.FromDays(1)) // Adjust expiration as needed
                    };

                    Response.Cookies.Append("YourCookieName", result?.Token, cookieOptions);

                    return RedirectToAction("Index", "Articulo");
                }

            }

            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}