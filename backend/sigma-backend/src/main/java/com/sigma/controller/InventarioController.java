package com.sigma.controller;

import com.sigma.dto.InventarioCreateRequest;
import com.sigma.dto.InventarioResponse;
import com.sigma.dto.InventarioUpdateRequest;
import com.sigma.service.InventarioService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<List<InventarioResponse>> listar() {

        return ResponseEntity.ok(
                inventarioService.listar()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventarioResponse> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                inventarioService.buscarPorId(id)
        );
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