using FacturacionWeb.Models;
using Newtonsoft.Json;
using System;
using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace FacturacionWeb.API
{
    public static class HttpClientGenericAPI<T>
    {
        private static readonly HttpClient client = new HttpClient
        {
            BaseAddress = new Uri("https://localhost:7005/api/"),
            DefaultRequestHeaders =
            {
                Accept = { new MediaTypeWithQualityHeaderValue("application/json") }
            }
        };

        public static async Task<T> GetAll(string endpoint, string token)
        {
            try
            {
                HttpResponseMessage response = await client.GetAsync($"{endpoint}");

                if (response.IsSuccessStatusCode)
                {
                    return await response.Content.ReadAsAsync<T>();
                }
                else if (response.StatusCode == HttpStatusCode.Unauthorized)
                {
                    // Handle 401 Unauthorized response
                    Console.WriteLine("Unauthorized: Token may be expired or invalid. Handle accordingly.");
                    // You might want to refresh the token, redirect to login, or perform other actions.
                    // throw new UnauthorizedAccessException("Token may be expired or invalid.");
                    return default; // Return a default value or handle as appropriate
                }
                else
                {
                    // Handle other non-success status codes
                    Console.WriteLine($"Error getting {typeof(T).Name}: {response.StatusCode}");
                    response.EnsureSuccessStatusCode(); // This will throw for other non-success status codes
                    return default; // Return a default value or handle as appropriate
                }
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Error getting {typeof(T).Name}: {ex.Message}");
                throw;
            }
        }


        public static async Task<T> GetAsync(int id, string endpoint)
        {
            try
            {
                HttpResponseMessage response = await client.GetAsync($"{endpoint}/{id}");
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadAsAsync<T>();
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Error getting {typeof(T).Name}: {ex.Message}");
                throw;
            }
        }

        public static async Task<LoginResponse> Login(LoginRequest item, string endpoint)
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
                Console.WriteLine($"Error login {ex.Message}");
                throw;
            }
        }


        public static async Task<T> CreateAsync(T item, string endpoint)
        {
            try
            {
                HttpResponseMessage response = await client.PostAsJsonAsync(endpoint, item);
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadAsAsync<T>();
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Error creating {typeof(T).Name}: {ex.Message}");
                throw;
            }
        }

        public static async Task<T> UpdateAsync(int id, T item, string endpoint)
        {
            try
            {
                HttpResponseMessage response = await client.PutAsJsonAsync($"{endpoint}/{id}", item);
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadAsAsync<T>();
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Error updating {typeof(T).Name}: {ex.Message}");
                throw;
            }
        }

        public static async Task<bool> DeleteAsync(int id, string endpoint)
        {
            try
            {
                HttpResponseMessage response = await client.DeleteAsync($"{endpoint}/{id}");
                response.EnsureSuccessStatusCode();
                // Assuming your API returns a boolean indicating success or failure
                return await response.Content.ReadAsAsync<bool>();
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Error deleting {typeof(T).Name}: {ex.Message}");
                throw;
            }
        }

        public static void Dispose()
        {
            client.Dispose();
        }
    }
}
