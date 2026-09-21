package com.sigma.repository;

import com.sigma.entity.MovimientoRecurso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimientoRecursoRepository
        extends JpaRepository<MovimientoRecurso, Long> {

    List<MovimientoRecurso> findByRecursoIdOrderByFechaHoraDesc(Long idRecurso);
}