package com.sigma.controller;

import com.sigma.dto.DetalleInventarioCreateRequest;
import com.sigma.dto.DetalleInventarioResponse;
import com.sigma.dto.DetalleInventarioUpdateRequest;
import com.sigma.service.DetalleInventarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/detalles-inventario")
public class DetalleInventarioController {

    private final DetalleInventarioService detalleInventarioService;

    public DetalleInventarioController(
            DetalleInventarioService detalleInventarioService) {
        this.detalleInventarioService = detalleInventarioService;
    }

    @PostMapping
    public ResponseEntity<DetalleInventarioResponse> crear(
            @Valid @RequestBody DetalleInventarioCreateRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(detalleInventarioService.crear(request));
    }

    @GetMapping
    public ResponseEntity<List<DetalleInventarioResponse>> listar() {

        return ResponseEntity.ok(
                detalleInventarioService.listar()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalleInventarioResponse> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                detalleInventarioService.buscarPorId(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<DetalleInventarioResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody DetalleInventarioUpdateRequest request) {

        return ResponseEntity.ok(
                detalleInventarioService.actualizar(id, request)
        );
    }
}