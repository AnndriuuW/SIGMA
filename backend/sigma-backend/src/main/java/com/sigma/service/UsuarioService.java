package com.sigma.service;

import com.sigma.dto.UsuarioCreateRequest;
import com.sigma.dto.UsuarioResponse;
import com.sigma.dto.UsuarioUpdateRequest;
import com.sigma.entity.Rol;
import com.sigma.entity.Usuario;
import com.sigma.repository.RolRepository;
import com.sigma.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.sigma.exception.RecursoDuplicadoException;
import com.sigma.exception.RecursoNoEncontradoException;
import java.util.List;

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

    public UsuarioResponse guardar(UsuarioCreateRequest request) {

        if (usuarioRepository.existsById(request.getCodigo())) {
            throw new RecursoDuplicadoException(
                    "El código de usuario ya existe"
            );
        }

        Rol rol = rolRepository.findById(request.getRolId())
        .orElseThrow(() -> new RecursoNoEncontradoException(
                "El rol no existe"
        ));

        Usuario usuario = new Usuario();

        usuario.setCodigo(request.getCodigo());
        usuario.setNombres(request.getNombres());
        usuario.setApellidos(request.getApellidos());

        String contrasenaHash = passwordEncoder.encode(request.getContrasena());
        usuario.setContrasena(contrasenaHash);

        usuario.setRol(rol);
        usuario.setActivo(true);

        Usuario usuarioGuardado = usuarioRepository.save(usuario);
        UsuarioResponse response = new UsuarioResponse();

        response.setCodigo(usuarioGuardado.getCodigo());
        response.setNombres(usuarioGuardado.getNombres());
        response.setApellidos(usuarioGuardado.getApellidos());
        response.setRol(usuarioGuardado.getRol().getNombre());
        response.setActivo(usuarioGuardado.getActivo());
        return response;
    }

    public List<UsuarioResponse> listarUsuarios() {

    return usuarioRepository.findAll()
            .stream()
            .map(usuario -> {
                UsuarioResponse response = new UsuarioResponse();

                response.setCodigo(usuario.getCodigo());
                response.setNombres(usuario.getNombres());
                response.setApellidos(usuario.getApellidos());
                response.setRol(usuario.getRol().getNombre());
                response.setActivo(usuario.getActivo());

                return response;
            })
            .toList();
    }

    public UsuarioResponse actualizar(
            String codigo,
            UsuarioUpdateRequest request) {

        Usuario usuario = usuarioRepository.findById(codigo)
                .orElseThrow(() ->
                        new RuntimeException("Usuario no encontrado"));

        usuario.setNombres(request.getNombres());
        usuario.setApellidos(request.getApellidos());

        if (request.getContrasena() != null &&
                !request.getContrasena().isBlank()) {

            usuario.setContrasena(
                    passwordEncoder.encode(request.getContrasena())
            );
        }

        if (request.getRolId() != null) {

            Rol rol = rolRepository.findById(request.getRolId())
                    .orElseThrow(() ->
                            new RuntimeException("Rol no encontrado"));

            usuario.setRol(rol);
        }

        Usuario actualizado = usuarioRepository.save(usuario);

        UsuarioResponse response = new UsuarioResponse();

        response.setCodigo(actualizado.getCodigo());
        response.setNombres(actualizado.getNombres());
        response.setApellidos(actualizado.getApellidos());
        response.setRol(actualizado.getRol().getNombre());
        response.setActivo(actualizado.getActivo());

        return response;
    }

    public void eliminar(String codigo) {

        Usuario usuario = usuarioRepository.findById(codigo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuarioRepository.delete(usuario);
    }
}
