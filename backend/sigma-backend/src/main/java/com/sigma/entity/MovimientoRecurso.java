package com.sigma.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "movimiento_recurso")
public class MovimientoRecurso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_recurso", nullable = false)
    private Recurso recurso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ubicacion_anterior")
    private Ubicacion ubicacionAnterior;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ubicacion_nueva", nullable = false)
    private Ubicacion ubicacionNueva;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "codigo_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    public MovimientoRecurso() {
    }

    public Long getId() {
        return id;
    }

    public Recurso getRecurso() {
        return recurso;
    }

    public void setRecurso(Recurso recurso) {
        this.recurso = recurso;
    }

    public Ubicacion getUbicacionAnterior() {
        return ubicacionAnterior;
    }

    public void setUbicacionAnterior(Ubicacion ubicacionAnterior) {
        this.ubicacionAnterior = ubicacionAnterior;
    }

    public Ubicacion getUbicacionNueva() {
        return ubicacionNueva;
    }

    public void setUbicacionNueva(Ubicacion ubicacionNueva) {
        this.ubicacionNueva = ubicacionNueva;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public LocalDateTime getFechaHora() {
        return fechaHora;
    }

    public void setFechaHora(LocalDateTime fechaHora) {
        this.fechaHora = fechaHora;
    }
}