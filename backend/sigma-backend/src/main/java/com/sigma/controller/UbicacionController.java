package com.sigma.controller;

import com.sigma.dto.UbicacionCreateRequest;
import com.sigma.dto.UbicacionResponse;
import com.sigma.dto.UbicacionUpdateRequest;
import com.sigma.service.UbicacionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ubicaciones")
public class UbicacionController {

    private final UbicacionService ubicacionService;

    public UbicacionController(UbicacionService ubicacionService) {
        this.ubicacionService = ubicacionService;
    }

    @PostMapping
    public UbicacionResponse crear(
            @Valid @RequestBody UbicacionCreateRequest request) {

        return ubicacionService.crear(request);
    }

    @GetMapping
    public List<UbicacionResponse> listar() {
        return ubicacionService.listar();
    }

    @GetMapping("/{id}")
    public UbicacionResponse buscarPorId(
            @PathVariable Long id) {

        return ubicacionService.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public UbicacionResponse actualizar(
            @PathVariable Long id,
            @Valid @RequestBody UbicacionUpdateRequest request) {

        return ubicacionService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public void desactivar(
            @PathVariable Long id) {

        ubicacionService.desactivar(id);
    }
}