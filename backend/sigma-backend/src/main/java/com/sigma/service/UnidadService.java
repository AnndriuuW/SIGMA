package com.sigma.service;

import com.sigma.dto.UnidadCreateRequest;
import com.sigma.dto.UnidadResponse;
import com.sigma.dto.UnidadUpdateRequest;
import com.sigma.entity.Unidad;
import com.sigma.repository.UnidadRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UnidadService {

    private final UnidadRepository unidadRepository;

    public UnidadService(UnidadRepository unidadRepository) {
        this.unidadRepository = unidadRepository;
    }

    public UnidadResponse crear(UnidadCreateRequest request) {

        if (unidadRepository.existsByNombre(request.getNombre())) {
            throw new RuntimeException("Ya existe una unidad con ese nombre");
        }

        if (unidadRepository.existsByIndicativo(request.getIndicativo())) {
            throw new RuntimeException("Ya existe una unidad con ese indicativo");
        }

        Unidad unidad = new Unidad();

        unidad.setNombre(request.getNombre());
        unidad.setIndicativo(request.getIndicativo());
        unidad.setEstado(request.getEstado());
        unidad.setActivo(true);

        Unidad guardada = unidadRepository.save(unidad);

        return convertirAResponse(guardada);
    }

    public List<UnidadResponse> listar() {

        return unidadRepository.findAll()
                .stream()
                .filter(Unidad::getActivo)
                .map(this::convertirAResponse)
                .toList();
    }

    public UnidadResponse buscarPorId(Long id) {

        Unidad unidad = unidadRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Unidad no encontrada"));

        if (!unidad.getActivo()) {
            throw new RuntimeException("Unidad no encontrada");
        }

        return convertirAResponse(unidad);
    }

    public UnidadResponse actualizar(
            Long id,
            UnidadUpdateRequest request) {

        Unidad unidad = unidadRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Unidad no encontrada"));

        if (!unidad.getActivo()) {
            throw new RuntimeException("Unidad no encontrada");
        }

        if (!unidad.getNombre().equals(request.getNombre())
                && unidadRepository.existsByNombre(request.getNombre())) {

            throw new RuntimeException(
                    "Ya existe una unidad con ese nombre");
        }

        if (!unidad.getIndicativo().equals(request.getIndicativo())
                && unidadRepository.existsByIndicativo(request.getIndicativo())) {

            throw new RuntimeException(
                    "Ya existe una unidad con ese indicativo");
        }

        unidad.setNombre(request.getNombre());
        unidad.setIndicativo(request.getIndicativo());
        unidad.setEstado(request.getEstado());

        Unidad actualizada = unidadRepository.save(unidad);

        return convertirAResponse(actualizada);
    }

    public void desactivar(Long id) {

        Unidad unidad = unidadRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Unidad no encontrada"));

        if (!unidad.getActivo()) {
            throw new RuntimeException("La unidad ya está desactivada");
        }

        unidad.setActivo(false);

        unidadRepository.save(unidad);
    }

    private UnidadResponse convertirAResponse(Unidad unidad) {

        UnidadResponse response = new UnidadResponse();

        response.setId(unidad.getId());
        response.setNombre(unidad.getNombre());
        response.setIndicativo(unidad.getIndicativo());
        response.setEstado(unidad.getEstado());
        response.setActivo(unidad.getActivo());

        return response;
    }
}