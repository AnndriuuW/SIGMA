package com.sigma.controller;

import com.sigma.dto.UsuarioCreateRequest;
import com.sigma.entity.Usuario;
import com.sigma.service.UsuarioService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {
    
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/{codigo}")
    public Optional<Usuario> buscarPorCodigo(@PathVariable String codigo) {
        return usuarioService.buscarPorCodigo(codigo);
    }

    @PostMapping
    public Usuario crearUsuario(@RequestBody UsuarioCreateRequest request) {
        return usuarioService.guardar(request);
    }
}
