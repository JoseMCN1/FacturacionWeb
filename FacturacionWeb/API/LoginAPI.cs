using FacturacionWeb.Models;
using Newtonsoft.Json;

namespace FacturacionWeb.API
{
    public static class LoginAPI
    {
        public static async Task<LoginResponse> Login(LoginRequest item, string endpoint,HttpClient client)
        {
            try
            {
                HttpResponseMessage response = await client.PostAsJsonAsync(endpoint, item);

                if (response.IsSuccessStatusCode)
                {
                    return await response.Content.ReadAsAsync<LoginResponse>();
                }
                else
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var json = JsonConvert.DeserializeObject<LoginResponse>(content);
                    return json;
                }
            }
            catch (HttpRequestException ex)
            {
                return new LoginResponse
                {
                    Mensaje = ex.Message,
                };
            }
        }
    }
}
