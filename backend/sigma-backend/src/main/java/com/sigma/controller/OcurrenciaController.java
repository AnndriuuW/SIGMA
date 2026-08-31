package com.sigma.controller;

import com.sigma.dto.OcurrenciaCreateRequest;
import com.sigma.dto.OcurrenciaResponse;
import com.sigma.service.OcurrenciaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ocurrencias")
public class OcurrenciaController {

    private final OcurrenciaService ocurrenciaService;

    public OcurrenciaController(OcurrenciaService ocurrenciaService) {
        this.ocurrenciaService = ocurrenciaService;
    }

    @PostMapping
    public ResponseEntity<OcurrenciaResponse> crear(
            @Valid @RequestBody OcurrenciaCreateRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ocurrenciaService.crear(request));
    }

    @GetMapping
    public ResponseEntity<List<OcurrenciaResponse>> listar() {

        return ResponseEntity.ok(
                ocurrenciaService.listar()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<OcurrenciaResponse> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ocurrenciaService.buscarPorId(id)
        );
    }
}