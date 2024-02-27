namespace FacturacionWeb.Models
{
    public class ArticuloFacturaRequest
    {
        public int IdArticulo { get; set; }
        public int ?IdFactura { get; set; }
        public decimal MontoTotal { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public byte AplicaIva { get; set; }
    }
}
