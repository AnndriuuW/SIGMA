package com.sigma.dto;

import java.time.LocalDateTime;

public class MovimientoRecursoResponse {

    private Long id;

    private Long idRecurso;
    private String codigoRecurso;
    private String nombreRecurso;

    private Long idUbicacionAnterior;
    private String nombreUbicacionAnterior;
    private String nombreUnidadAnterior;

    private Long idUbicacionNueva;
    private String nombreUbicacionNueva;
    private String nombreUnidadNueva;

    private String codigoUsuario;
    private String nombreUsuario;

    private LocalDateTime fechaHora;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Long getIdUbicacionAnterior() {
        return idUbicacionAnterior;
    }

    public void setIdUbicacionAnterior(Long idUbicacionAnterior) {
        this.idUbicacionAnterior = idUbicacionAnterior;
    }

    public String getNombreUbicacionAnterior() {
        return nombreUbicacionAnterior;
    }

    public void setNombreUbicacionAnterior(String nombreUbicacionAnterior) {
        this.nombreUbicacionAnterior = nombreUbicacionAnterior;
    }

    public String getNombreUnidadAnterior() {
        return nombreUnidadAnterior;
    }

    public void setNombreUnidadAnterior(String nombreUnidadAnterior) {
        this.nombreUnidadAnterior = nombreUnidadAnterior;
    }

    public Long getIdUbicacionNueva() {
        return idUbicacionNueva;
    }

    public void setIdUbicacionNueva(Long idUbicacionNueva) {
        this.idUbicacionNueva = idUbicacionNueva;
    }

    public String getNombreUbicacionNueva() {
        return nombreUbicacionNueva;
    }

    public void setNombreUbicacionNueva(String nombreUbicacionNueva) {
        this.nombreUbicacionNueva = nombreUbicacionNueva;
    }

    public String getNombreUnidadNueva() {
        return nombreUnidadNueva;
    }

    public void setNombreUnidadNueva(String nombreUnidadNueva) {
        this.nombreUnidadNueva = nombreUnidadNueva;
    }

    public String getCodigoUsuario() {
        return codigoUsuario;
    }

    public void setCodigoUsuario(String codigoUsuario) {
        this.codigoUsuario = codigoUsuario;
    }

    public String getNombreUsuario() {
        return nombreUsuario;
    }

    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
    }

    public LocalDateTime getFechaHora() {
        return fechaHora;
    }

    public void setFechaHora(LocalDateTime fechaHora) {
        this.fechaHora = fechaHora;
    }
}