package com.sigma.repository;

import com.sigma.entity.DetalleInventario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DetalleInventarioRepository extends JpaRepository<DetalleInventario, Long> {

    boolean existsByInventarioIdAndRecursoId(Long idInventario, Long idRecurso);
}