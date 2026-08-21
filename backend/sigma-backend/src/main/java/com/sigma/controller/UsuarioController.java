package com.sigma.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import com.sigma.service.UsuarioService;
import com.sigma.entity.Usuario;

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
}
