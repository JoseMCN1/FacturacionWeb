namespace FacturacionWeb.Models
{
    public class ErrorResponse
    {
        public string? Type { get; set; }
        public string? Title { get; set; }
        public int? Status { get; set; }
        public Dictionary<string, List<string>>? Errors { get; set; }

        public string? Mensaje { get; set; }
    }
}
