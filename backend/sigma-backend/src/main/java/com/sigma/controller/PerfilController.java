package com.sigma.controller;

import com.sigma.dto.PerfilResponse;
import com.sigma.dto.PerfilUpdateRequest;
import com.sigma.entity.Usuario;
import com.sigma.exception.RecursoNoEncontradoException;
import com.sigma.repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/perfil")
public class PerfilController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public PerfilController(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<PerfilResponse> obtenerPerfil() {

        Usuario usuario = obtenerUsuarioAutenticado();

        return ResponseEntity.ok(convertirRespuesta(usuario));
    }

    @PutMapping
    public ResponseEntity<PerfilResponse> actualizarPerfil(
            @Valid @RequestBody PerfilUpdateRequest request) {

        Usuario usuario = obtenerUsuarioAutenticado();

        usuario.setNombres(request.getNombres());
        usuario.setApellidos(request.getApellidos());

        if (request.getContrasena() != null
                && !request.getContrasena().isBlank()) {

            usuario.setContrasena(
                    passwordEncoder.encode(request.getContrasena())
            );
        }

        Usuario actualizado = usuarioRepository.save(usuario);

        return ResponseEntity.ok(
                convertirRespuesta(actualizado)
        );
    }

    private Usuario obtenerUsuarioAutenticado() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new RecursoNoEncontradoException(
                    "Usuario no autenticado");
        }

        String codigo = authentication.getName();

        return usuarioRepository.findByCodigo(codigo)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Usuario autenticado no encontrado"));
    }

    private PerfilResponse convertirRespuesta(Usuario usuario) {

        PerfilResponse response = new PerfilResponse();

        response.setCodigo(usuario.getCodigo());
        response.setNombres(usuario.getNombres());
        response.setApellidos(usuario.getApellidos());
        response.setRol(usuario.getRol().getNombre());

        return response;
    }
}