using System.ComponentModel.DataAnnotations;

namespace FacturacionWeb.Models
{
    public class LoginRequest
    {
        
            [Required(ErrorMessage = "Usuario Requerido")]
            public string Username { get; set; }

            [Required(ErrorMessage = "Contrasena requerida")]
            public string Contrasena { get; set; }
        
    }
}
