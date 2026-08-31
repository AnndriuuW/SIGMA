package com.sigma.repository;

import com.sigma.entity.Recurso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RecursoRepository extends JpaRepository<Recurso, Long> {

    Optional<Recurso> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);
}