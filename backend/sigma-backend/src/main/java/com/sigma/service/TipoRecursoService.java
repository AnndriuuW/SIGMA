package com.sigma.service;

import com.sigma.dto.TipoRecursoCreateRequest;
import com.sigma.dto.TipoRecursoResponse;
import com.sigma.dto.TipoRecursoUpdateRequest;
import com.sigma.entity.TipoRecurso;
import com.sigma.exception.RecursoDuplicadoException;
import com.sigma.exception.RecursoNoEncontradoException;
import com.sigma.repository.TipoRecursoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TipoRecursoService {

    private final TipoRecursoRepository tipoRecursoRepository;

    public TipoRecursoService(
            TipoRecursoRepository tipoRecursoRepository) {

        this.tipoRecursoRepository = tipoRecursoRepository;
    }

    public TipoRecursoResponse crear(
            TipoRecursoCreateRequest request) {

        if (tipoRecursoRepository.existsByNombreIgnoreCase(
                request.getNombre())) {

            throw new RecursoDuplicadoException(
                    "Ya existe un tipo de recurso con ese nombre");
        }

        TipoRecurso tipoRecurso = new TipoRecurso();

        tipoRecurso.setNombre(request.getNombre());
        tipoRecurso.setDescripcion(request.getDescripcion());

        TipoRecurso guardado =
                tipoRecursoRepository.save(tipoRecurso);

        return convertirAResponse(guardado);
    }

    public List<TipoRecursoResponse> listar() {

        return tipoRecursoRepository.findAll()
                .stream()
                .map(this::convertirAResponse)
                .toList();
    }

    public TipoRecursoResponse buscarPorId(Long id) {

        TipoRecurso tipoRecurso =
                tipoRecursoRepository.findById(id)
                        .orElseThrow(() ->
                                new RecursoNoEncontradoException(
                                        "Tipo de recurso no encontrado"));

        return convertirAResponse(tipoRecurso);
    }

    public TipoRecursoResponse actualizar(
            Long id,
            TipoRecursoUpdateRequest request) {

        TipoRecurso tipoRecurso =
                tipoRecursoRepository.findById(id)
                        .orElseThrow(() ->
                                new RecursoNoEncontradoException(
                                        "Tipo de recurso no encontrado"));

        var tipoExistente =
                tipoRecursoRepository.findByNombreIgnoreCase(
                        request.getNombre());

        if (tipoExistente.isPresent()
                && !tipoExistente.get().getId().equals(id)) {

            throw new RecursoDuplicadoException(
                    "Ya existe un tipo de recurso con ese nombre");
        }

        tipoRecurso.setNombre(request.getNombre());
        tipoRecurso.setDescripcion(request.getDescripcion());

        TipoRecurso actualizado =
                tipoRecursoRepository.save(tipoRecurso);

        return convertirAResponse(actualizado);
    }

    private TipoRecursoResponse convertirAResponse(
            TipoRecurso tipoRecurso) {

        TipoRecursoResponse response =
                new TipoRecursoResponse();

        response.setId(tipoRecurso.getId());
        response.setNombre(tipoRecurso.getNombre());
        response.setDescripcion(tipoRecurso.getDescripcion());

        return response;
    }
}