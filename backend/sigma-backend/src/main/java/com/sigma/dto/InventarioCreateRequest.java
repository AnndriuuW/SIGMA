package com.sigma.dto;

import jakarta.validation.constraints.NotNull;

public class InventarioCreateRequest {

    @NotNull(message = "La unidad es obligatoria")
    private Long idUnidad;

    public Long getIdUnidad() {
        return idUnidad;
    }

    public void setIdUnidad(Long idUnidad) {
        this.idUnidad = idUnidad;
    }
}