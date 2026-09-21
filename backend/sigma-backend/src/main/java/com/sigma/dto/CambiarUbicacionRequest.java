package com.sigma.dto;

import jakarta.validation.constraints.NotNull;

public class CambiarUbicacionRequest {

    @NotNull(message = "La ubicación es obligatoria")
    private Long idUbicacion;

    public Long getIdUbicacion() {
        return idUbicacion;
    }

    public void setIdUbicacion(Long idUbicacion) {
        this.idUbicacion = idUbicacion;
    }
}