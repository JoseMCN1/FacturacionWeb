using System.ComponentModel.DataAnnotations;

namespace FacturacionWeb.Models
{
    public class LoginRequest
    {
        
            [Required(ErrorMessage = "Email Requerido")]
            public string Email { get; set; }

            [Required(ErrorMessage = "Contrasena requerida")]
            public string Contrasena { get; set; }
        
    }
}
