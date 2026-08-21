package com.sigma.service;

import org.springframework.stereotype.Service;
import com.sigma.repository.UsuarioRepository;
import com.sigma.entity.Usuario;

import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Optional<Usuario> buscarPorCodigo(String codigo) {
        return usuarioRepository.findById(codigo);
    }
}
