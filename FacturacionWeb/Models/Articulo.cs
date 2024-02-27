using System.ComponentModel.DataAnnotations;

namespace FacturacionWeb.Models
{
    public class Articulo
    {
        public int? Id { get; set; }

        [Display(Name = "Codigo")]
        public string Codigo { get; set; } = null!;

        [Display(Name = "Nombre")]
        public string Nombre { get; set; }

        [Display(Name = "Precio")]
        public decimal Precio { get; set; }

        [Display(Name = "Aplica Iva ( 13% )")]
        public byte AplicaIva { get; set; }
    }
}
