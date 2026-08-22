package com.sigma.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {

    private String codigo;
    private String nombres;
    private String apellidos;
    private String rol;
    private String token;

}
