package com.sigma.dto;

import java.time.LocalDateTime;

public class DetalleInventarioResponse {

    private Long id;
    private Long idInventario;
    private Long idRecurso;
    private String codigoRecurso;
    private String nombreRecurso;

    private String codigoVerificadoPor;
    private String nombreVerificadoPor;

    private Boolean verificado;
    private LocalDateTime fechaVerificacion;
    private String observacion;

    public DetalleInventarioResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdInventario() {
        return idInventario;
    }

    public void setIdInventario(Long idInventario) {
        this.idInventario = idInventario;
    }

    public Long getIdRecurso() {
        return idRecurso;
    }

    public void setIdRecurso(Long idRecurso) {
        this.idRecurso = idRecurso;
    }

    public String getCodigoRecurso() {
        return codigoRecurso;
    }

    public void setCodigoRecurso(String codigoRecurso) {
        this.codigoRecurso = codigoRecurso;
    }

    public String getNombreRecurso() {
        return nombreRecurso;
    }

    public void setNombreRecurso(String nombreRecurso) {
        this.nombreRecurso = nombreRecurso;
    }

    public String getCodigoVerificadoPor() {
        return codigoVerificadoPor;
    }

    public void setCodigoVerificadoPor(String codigoVerificadoPor) {
        this.codigoVerificadoPor = codigoVerificadoPor;
    }

    public String getNombreVerificadoPor() {
        return nombreVerificadoPor;
    }

    public void setNombreVerificadoPor(String nombreVerificadoPor) {
        this.nombreVerificadoPor = nombreVerificadoPor;
    }

    public Boolean getVerificado() {
        return verificado;
    }

    public void setVerificado(Boolean verificado) {
        this.verificado = verificado;
    }

    public LocalDateTime getFechaVerificacion() {
        return fechaVerificacion;
    }

    public void setFechaVerificacion(LocalDateTime fechaVerificacion) {
        this.fechaVerificacion = fechaVerificacion;
    }

    public String getObservacion() {
        return observacion;
    }

    public void setObservacion(String observacion) {
        this.observacion = observacion;
    }
}