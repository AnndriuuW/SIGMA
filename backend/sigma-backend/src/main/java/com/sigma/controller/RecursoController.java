package com.sigma.controller;

import com.sigma.dto.RecursoCreateRequest;
import com.sigma.dto.RecursoResponse;
import com.sigma.dto.RecursoUpdateRequest;
import com.sigma.service.RecursoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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