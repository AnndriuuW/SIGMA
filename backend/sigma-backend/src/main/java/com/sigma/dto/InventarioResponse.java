package com.sigma.dto;

import com.sigma.entity.EstadoInventario;
import com.sigma.entity.ResultadoInventario;

import java.time.LocalDateTime;

public class InventarioResponse {

    private Long id;

    private Long idUnidad;
    private String nombreUnidad;

    private String codigoResponsable;
    private String nombreResponsable;

    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;

    private EstadoInventario estado;
    private ResultadoInventario resultadoGeneral;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdUnidad() {
        return idUnidad;
    }

    public void setIdUnidad(Long idUnidad) {
        this.idUnidad = idUnidad;
    }

    public String getNombreUnidad() {
        return nombreUnidad;
    }

    public void setNombreUnidad(String nombreUnidad) {
        this.nombreUnidad = nombreUnidad;
    }

    public String getCodigoResponsable() {
        return codigoResponsable;
    }

    public void setCodigoResponsable(String codigoResponsable) {
        this.codigoResponsable = codigoResponsable;
    }

    public String getNombreResponsable() {
        return nombreResponsable;
    }

    public void setNombreResponsable(String nombreResponsable) {
        this.nombreResponsable = nombreResponsable;
    }

    public LocalDateTime getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDateTime fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDateTime getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDateTime fechaFin) {
        this.fechaFin = fechaFin;
    }

    public EstadoInventario getEstado() {
        return estado;
    }

    public void setEstado(EstadoInventario estado) {
        this.estado = estado;
    }

    public ResultadoInventario getResultadoGeneral() {
        return resultadoGeneral;
    }

    public void setResultadoGeneral(ResultadoInventario resultadoGeneral) {
        this.resultadoGeneral = resultadoGeneral;
    }
}