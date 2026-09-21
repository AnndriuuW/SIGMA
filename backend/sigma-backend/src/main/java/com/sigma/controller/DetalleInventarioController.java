package com.sigma.controller;

import com.sigma.dto.DetalleInventarioCreateRequest;
import com.sigma.dto.DetalleInventarioResponse;
import com.sigma.dto.DetalleInventarioUpdateRequest;
import com.sigma.entity.EstadoInventario;
import com.sigma.service.DetalleInventarioService;
import com.sigma.service.InventarioService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/detalles-inventario")
public class DetalleInventarioController {

    private final DetalleInventarioService detalleInventarioService;
    private final InventarioService inventarioService;

    public DetalleInventarioController(
            DetalleInventarioService detalleInventarioService,
            InventarioService inventarioService) {

        this.detalleInventarioService = detalleInventarioService;
        this.inventarioService = inventarioService;
    }

    @PostMapping
    public ResponseEntity<DetalleInventarioResponse> crear(
            @RequestBody DetalleInventarioCreateRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(detalleInventarioService.crear(request));
    }

    @GetMapping
    public ResponseEntity<List<DetalleInventarioResponse>> listar(
            Authentication authentication) {

        boolean esBombero = authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_BOMBERO"));

        if (esBombero) {
            return ResponseEntity.ok(
                    detalleInventarioService.listarActuales()
            );
        }

        return ResponseEntity.ok(
                detalleInventarioService.listar()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(
            @PathVariable Long id,
            Authentication authentication) {

        DetalleInventarioResponse detalle =
                detalleInventarioService.buscarPorId(id);

        boolean esBombero = authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_BOMBERO"));

        if (esBombero) {

            var inventario =
                    inventarioService.buscarPorId(
                            detalle.getIdInventario()
                    );

            if (inventario.getEstado()
                    == EstadoInventario.FINALIZADO) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .build();
            }
        }

        return ResponseEntity.ok(detalle);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DetalleInventarioResponse> actualizar(
            @PathVariable Long id,
            @RequestBody DetalleInventarioUpdateRequest request) {

        return ResponseEntity.ok(
                detalleInventarioService.actualizar(id, request)
        );
    }
}