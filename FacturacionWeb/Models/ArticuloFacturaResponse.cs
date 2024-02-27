namespace FacturacionWeb.Models
{
    public class ArticuloFacturaResponse
    {
        public int IdArticulo { get; set; }
        public int IdFactura { get; set; }

        public string Codigo { get; set; }

        public decimal MontoTotal { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public byte AplicaIva { get; set; }
        public DateTime FechaAgregado { get; set; }
    }
}
