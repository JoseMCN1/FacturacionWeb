namespace FacturacionWeb.Models
{
    public class FacturaResponse
    {
        public int Id { get; set; }
        public string Consecutivo { get; set; }
        public string NumeroFactura { get; set; }
        public int VendedorId { get; set; }
        public DateTime FechaCreacion { get; set; }
        public decimal Subtotal { get; set; }
        public decimal MontoTotal { get; set; }
        public List<ArticuloFacturaResponse> ArticuloFacturas { get; set; }
    }
}
