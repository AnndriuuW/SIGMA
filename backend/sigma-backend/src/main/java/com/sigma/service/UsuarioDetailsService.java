package com.sigma.service;

import com.sigma.entity.Usuario;
import com.sigma.repository.UsuarioRepository;
import com.sigma.security.UsuarioDetails;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String codigo)
            throws UsernameNotFoundException {

        Usuario usuario = usuarioRepository.findById(codigo)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "Usuario no encontrado"
                        )
                );

        return new UsuarioDetails(usuario);
    }
}
