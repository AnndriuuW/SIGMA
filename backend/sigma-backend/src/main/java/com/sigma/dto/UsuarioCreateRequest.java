package com.sigma.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UsuarioCreateRequest {
    
    private String codigo;
    private String nombres;
    private String apellidos;
    private String contrasena;
    private Long rolId;

}
