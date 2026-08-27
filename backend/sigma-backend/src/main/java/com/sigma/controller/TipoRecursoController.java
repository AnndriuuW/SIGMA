package com.sigma.controller;

import com.sigma.dto.TipoRecursoCreateRequest;
import com.sigma.dto.TipoRecursoResponse;
import com.sigma.dto.TipoRecursoUpdateRequest;
import com.sigma.service.TipoRecursoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tipos-recurso")
public class TipoRecursoController {

    private final TipoRecursoService tipoRecursoService;

    public TipoRecursoController(
            TipoRecursoService tipoRecursoService) {

        this.tipoRecursoService = tipoRecursoService;
    }

    @PostMapping
    public ResponseEntity<TipoRecursoResponse> crear(
            @Valid @RequestBody TipoRecursoCreateRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(tipoRecursoService.crear(request));
    }

    @GetMapping
    public ResponseEntity<List<TipoRecursoResponse>> listar() {

        return ResponseEntity.ok(
                tipoRecursoService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipoRecursoResponse> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                tipoRecursoService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TipoRecursoResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody TipoRecursoUpdateRequest request) {

        return ResponseEntity.ok(
                tipoRecursoService.actualizar(id, request));
    }
}