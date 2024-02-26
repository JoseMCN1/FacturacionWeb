namespace FacturacionWeb.Models
{
    public class ArticulosResponse
    {
        public int? Total { get; set; }

        public List<Articulo> ?Articulos { get; set; }

        public int? CurrentPage { get; set; }

        public int? ItemsPerPage { get; set; }
    }

}
