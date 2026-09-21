package com.sigma.controller;

import com.sigma.dto.CambiarUbicacionRequest;
import com.sigma.dto.RecursoCreateRequest;
import com.sigma.dto.RecursoResponse;
import com.sigma.dto.RecursoUpdateRequest;
import com.sigma.service.RecursoService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.sigma.dto.MovimientoRecursoResponse;

import java.util.List;

@RestController
@RequestMapping("/recursos")
public class RecursoController {

    private final RecursoService recursoService;

    public RecursoController(RecursoService recursoService) {
        this.recursoService = recursoService;
    }

    @PostMapping
    public ResponseEntity<RecursoResponse> crear(
            @Valid @RequestBody RecursoCreateRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(recursoService.crear(request));
    }

    @GetMapping
    public ResponseEntity<List<RecursoResponse>> listar() {

        return ResponseEntity.ok(
                recursoService.listar()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecursoResponse> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                recursoService.buscarPorId(id)
        );
    }

    @GetMapping("/{id}/historial")
    public ResponseEntity<List<MovimientoRecursoResponse>> listarHistorial(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                recursoService.listarHistorial(id)
        );
    }

    @PutMapping("/{id}/ubicacion")
    public ResponseEntity<RecursoResponse> cambiarUbicacion(
            @PathVariable Long id,
            @Valid @RequestBody CambiarUbicacionRequest request) {

        return ResponseEntity.ok(
                recursoService.cambiarUbicacion(
                        id,
                        request.getIdUbicacion()
                )
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecursoResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody RecursoUpdateRequest request) {

        return ResponseEntity.ok(
                recursoService.actualizar(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(
            @PathVariable Long id) {

        recursoService.desactivar(id);

        return ResponseEntity.noContent().build();
    }
}