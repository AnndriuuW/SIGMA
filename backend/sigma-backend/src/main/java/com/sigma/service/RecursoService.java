package com.sigma.service;

import com.sigma.dto.RecursoCreateRequest;
import com.sigma.dto.RecursoResponse;
import com.sigma.dto.RecursoUpdateRequest;
import com.sigma.entity.Recurso;
import com.sigma.entity.TipoRecurso;
import com.sigma.entity.Ubicacion;
import com.sigma.exception.RecursoDuplicadoException;
import com.sigma.exception.RecursoNoEncontradoException;
import com.sigma.exception.ReglaNegocioException;
import com.sigma.repository.RecursoRepository;
import com.sigma.repository.TipoRecursoRepository;
import com.sigma.repository.UbicacionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecursoService {

    private final RecursoRepository recursoRepository;
    private final TipoRecursoRepository tipoRecursoRepository;
    private final UbicacionRepository ubicacionRepository;

    public RecursoService(
            RecursoRepository recursoRepository,
            TipoRecursoRepository tipoRecursoRepository,
            UbicacionRepository ubicacionRepository) {

        this.recursoRepository = recursoRepository;
        this.tipoRecursoRepository = tipoRecursoRepository;
        this.ubicacionRepository = ubicacionRepository;
    }

    public RecursoResponse crear(RecursoCreateRequest request) {

        if (recursoRepository.existsByCodigo(request.getCodigo())) {
            throw new RecursoDuplicadoException(
                    "Ya existe un recurso con ese código");
        }

        TipoRecurso tipoRecurso = tipoRecursoRepository.findById(
                request.getIdTipoRecurso()
        ).orElseThrow(() ->
                new RecursoNoEncontradoException(
                        "Tipo de recurso no encontrado"));

        Ubicacion ubicacion = ubicacionRepository.findById(
                request.getIdUbicacion()
        ).orElseThrow(() ->
                new RecursoNoEncontradoException(
                        "Ubicación no encontrada"));

        if (!ubicacion.getActivo()) {
            throw new ReglaNegocioException(
                    "No se puede asignar un recurso a una ubicación inactiva");
        }

        Recurso recurso = new Recurso();

        recurso.setCodigo(request.getCodigo());
        recurso.setNombre(request.getNombre());
        recurso.setMarca(request.getMarca());
        recurso.setModelo(request.getModelo());
        recurso.setNumeroSerie(request.getNumeroSerie());
        recurso.setLongitud(request.getLongitud());
        recurso.setEstado(request.getEstado());
        recurso.setTipoRecurso(tipoRecurso);
        recurso.setUbicacion(ubicacion);
        recurso.setActivo(true);

        Recurso guardado = recursoRepository.save(recurso);

        return convertirAResponse(guardado);
    }

    public List<RecursoResponse> listar() {

        return recursoRepository.findAll()
                .stream()
                .filter(Recurso::getActivo)
                .map(this::convertirAResponse)
                .toList();
    }

    public RecursoResponse buscarPorId(Long id) {

        Recurso recurso = recursoRepository.findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Recurso no encontrado"));

        if (!recurso.getActivo()) {
            throw new RecursoNoEncontradoException(
                    "Recurso no encontrado");
        }

        return convertirAResponse(recurso);
    }

    public RecursoResponse actualizar(
            Long id,
            RecursoUpdateRequest request) {

        Recurso recurso = recursoRepository.findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Recurso no encontrado"));

        if (!recurso.getActivo()) {
            throw new RecursoNoEncontradoException(
                    "Recurso no encontrado");
        }

        var recursoExistente =
                recursoRepository.findByCodigo(request.getCodigo());

        if (recursoExistente.isPresent()
                && !recursoExistente.get().getId().equals(id)) {

            throw new RecursoDuplicadoException(
                    "Ya existe un recurso con ese código");
        }

        TipoRecurso tipoRecurso = tipoRecursoRepository.findById(
                request.getIdTipoRecurso()
        ).orElseThrow(() ->
                new RecursoNoEncontradoException(
                        "Tipo de recurso no encontrado"));

        Ubicacion ubicacion = ubicacionRepository.findById(
                request.getIdUbicacion()
        ).orElseThrow(() ->
                new RecursoNoEncontradoException(
                        "Ubicación no encontrada"));

        if (!ubicacion.getActivo()) {
            throw new ReglaNegocioException(
                    "No se puede asignar un recurso a una ubicación inactiva");
        }

        recurso.setCodigo(request.getCodigo());
        recurso.setNombre(request.getNombre());
        recurso.setMarca(request.getMarca());
        recurso.setModelo(request.getModelo());
        recurso.setNumeroSerie(request.getNumeroSerie());
        recurso.setLongitud(request.getLongitud());
        recurso.setEstado(request.getEstado());
        recurso.setTipoRecurso(tipoRecurso);
        recurso.setUbicacion(ubicacion);

        Recurso actualizado = recursoRepository.save(recurso);

        return convertirAResponse(actualizado);
    }

    public void desactivar(Long id) {

        Recurso recurso = recursoRepository.findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Recurso no encontrado"));

        if (!recurso.getActivo()) {
            throw new ReglaNegocioException(
                    "El recurso ya está desactivado");
        }

        recurso.setActivo(false);

        recursoRepository.save(recurso);
    }

    private RecursoResponse convertirAResponse(Recurso recurso) {

        RecursoResponse response = new RecursoResponse();

        response.setId(recurso.getId());
        response.setCodigo(recurso.getCodigo());
        response.setNombre(recurso.getNombre());
        response.setMarca(recurso.getMarca());
        response.setModelo(recurso.getModelo());
        response.setNumeroSerie(recurso.getNumeroSerie());
        response.setLongitud(recurso.getLongitud());
        response.setEstado(recurso.getEstado());
        response.setActivo(recurso.getActivo());

        if (recurso.getTipoRecurso() != null) {
            response.setIdTipoRecurso(
                    recurso.getTipoRecurso().getId());

            response.setNombreTipoRecurso(
                    recurso.getTipoRecurso().getNombre());
        }

        if (recurso.getUbicacion() != null) {
            response.setIdUbicacion(
                    recurso.getUbicacion().getId());

            response.setNombreUbicacion(
                    recurso.getUbicacion().getNombre());
        }

        return response;
    }
}