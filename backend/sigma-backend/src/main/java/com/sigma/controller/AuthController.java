package com.sigma.controller;

import com.sigma.dto.LoginRequest;
import com.sigma.dto.LoginResponse;
import com.sigma.security.UsuarioDetails;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.sigma.service.JwtService;

@RestController
@RequestMapping("/auth")
public class AuthController {

        private final AuthenticationManager authenticationManager;
        private final JwtService jwtService;

        public AuthController(AuthenticationManager authenticationManager, JwtService jwtService) {
                this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        }

        @PostMapping("/login")
        public LoginResponse login(@Valid @RequestBody LoginRequest request) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.getCodigo(),
                                request.getContrasena()
                        )
                );

        UsuarioDetails usuarioDetails =
                (UsuarioDetails) authentication.getPrincipal();

        String token = jwtService.generarToken(usuarioDetails);

        LoginResponse response = new LoginResponse();

        response.setCodigo(usuarioDetails.getUsername());
        response.setNombres(usuarioDetails.getUsuario().getNombres());
        response.setApellidos(usuarioDetails.getUsuario().getApellidos());
        response.setRol(usuarioDetails.getUsuario().getRol().getNombre());
        response.setToken(token);

        return response;
        }
}
