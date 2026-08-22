package com.sigma.controller;

import com.sigma.dto.UsuarioCreateRequest;
import com.sigma.dto.UsuarioResponse;
import com.sigma.entity.Usuario;
import com.sigma.service.UsuarioService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {
    
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/{codigo}")
    public UsuarioResponse buscarPorCodigo(@PathVariable String codigo) {

        Usuario usuario = usuarioService.buscarPorCodigo(codigo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        UsuarioResponse response = new UsuarioResponse();

        response.setCodigo(usuario.getCodigo());
        response.setNombres(usuario.getNombres());
        response.setApellidos(usuario.getApellidos());
        response.setRol(usuario.getRol().getNombre());
        response.setActivo(usuario.getActivo());

        return response;
    }

    @PostMapping
    public UsuarioResponse crearUsuario(@Valid @RequestBody UsuarioCreateRequest request) {
        return usuarioService.guardar(request);
    }
}
