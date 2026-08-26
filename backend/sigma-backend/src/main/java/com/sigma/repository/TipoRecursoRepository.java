package com.sigma.repository;

import com.sigma.entity.TipoRecurso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TipoRecursoRepository extends JpaRepository<TipoRecurso, Long> {

    boolean existsByNombreIgnoreCase(String nombre);

    Optional<TipoRecurso> findByNombreIgnoreCase(String nombre);
}