package com.sigma.service;

import com.sigma.dto.UsuarioCreateRequest;
import com.sigma.entity.Rol;
import com.sigma.entity.Usuario;
import com.sigma.repository.RolRepository;
import com.sigma.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final RolRepository rolRepository;
    
    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, RolRepository rolRepository) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.rolRepository = rolRepository;
    }

    public Optional<Usuario> buscarPorCodigo(String codigo) {
        return usuarioRepository.findById(codigo);
    }

    public Usuario guardar(UsuarioCreateRequest request) {

        Rol rol = rolRepository.findById(request.getRolId())
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        Usuario usuario = new Usuario();

        usuario.setCodigo(request.getCodigo());
        usuario.setNombres(request.getNombres());
        usuario.setApellidos(request.getApellidos());

        String contrasenaHash = passwordEncoder.encode(request.getContrasena());
        usuario.setContrasena(contrasenaHash);

        usuario.setRol(rol);
        usuario.setActivo(true);

        return usuarioRepository.save(usuario);
    }
}
