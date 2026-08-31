package com.sigma.repository;

import com.sigma.entity.Ocurrencia;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OcurrenciaRepository extends JpaRepository<Ocurrencia, Long> {
}