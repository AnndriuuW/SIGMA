package com.sigma.controller;

import com.sigma.dto.UnidadCreateRequest;
import com.sigma.dto.UnidadResponse;
import com.sigma.dto.UnidadUpdateRequest;
import com.sigma.service.UnidadService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/unidades")
public class UnidadController {

    private final UnidadService unidadService;

    public UnidadController(UnidadService unidadService) {
        this.unidadService = unidadService;
    }

    @GetMapping
    public List<UnidadResponse> listar() {
        return unidadService.listar();
    }

    @GetMapping("/{id}")
    public UnidadResponse buscarPorId(@PathVariable Long id) {
        return unidadService.buscarPorId(id);
    }

    @PostMapping
    public UnidadResponse crear(
            @Valid @RequestBody UnidadCreateRequest request) {

        return unidadService.crear(request);
    }

    @PutMapping("/{id}")
    public UnidadResponse actualizar(
            @PathVariable Long id,
            @Valid @RequestBody UnidadUpdateRequest request) {

        return unidadService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public void desactivar(@PathVariable Long id) {
        unidadService.desactivar(id);
    }
}