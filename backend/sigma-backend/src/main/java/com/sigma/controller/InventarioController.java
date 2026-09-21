package com.sigma.controller;

import com.sigma.dto.InventarioCreateRequest;
import com.sigma.dto.InventarioResponse;
import com.sigma.dto.InventarioUpdateRequest;
import com.sigma.entity.EstadoInventario;
import com.sigma.service.InventarioService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventarios")
public class InventarioController {

    private final InventarioService inventarioService;

    public InventarioController(InventarioService inventarioService) {
        this.inventarioService = inventarioService;
    }

    @PostMapping
    public ResponseEntity<InventarioResponse> crear(
            @Valid @RequestBody InventarioCreateRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(inventarioService.crear(request));
    }

    @GetMapping
    public ResponseEntity<List<InventarioResponse>> listar(
            Authentication authentication) {

        boolean esBombero = authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_BOMBERO"));

        if (esBombero) {
            return ResponseEntity.ok(
                    inventarioService.listarActuales()
            );
        }

        return ResponseEntity.ok(
                inventarioService.listar()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(
            @PathVariable Long id,
            Authentication authentication) {

        InventarioResponse inventario =
                inventarioService.buscarPorId(id);

        boolean esBombero = authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_BOMBERO"));

        if (esBombero
                && inventario.getEstado() == EstadoInventario.FINALIZADO) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }

        return ResponseEntity.ok(inventario);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventarioResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody InventarioUpdateRequest request) {

        return ResponseEntity.ok(
                inventarioService.actualizar(id, request)
        );
    }
}