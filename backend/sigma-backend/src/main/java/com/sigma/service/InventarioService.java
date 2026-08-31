package com.sigma.service;

import com.sigma.dto.InventarioCreateRequest;
import com.sigma.dto.InventarioResponse;
import com.sigma.dto.InventarioUpdateRequest;
import com.sigma.entity.EstadoInventario;
import com.sigma.entity.Inventario;
import com.sigma.entity.Unidad;
import com.sigma.entity.Usuario;
import com.sigma.exception.RecursoNoEncontradoException;
import com.sigma.exception.ReglaNegocioException;
import com.sigma.repository.InventarioRepository;
import com.sigma.repository.UnidadRepository;
import com.sigma.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InventarioService {

    private final InventarioRepository inventarioRepository;
    private final UnidadRepository unidadRepository;
    private final UsuarioRepository usuarioRepository;

    public InventarioService(
            InventarioRepository inventarioRepository,
            UnidadRepository unidadRepository,
            UsuarioRepository usuarioRepository) {

        this.inventarioRepository = inventarioRepository;
        this.unidadRepository = unidadRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public InventarioResponse crear(InventarioCreateRequest request) {

        Unidad unidad = unidadRepository.findById(
                request.getIdUnidad()
        ).orElseThrow(() ->
                new RecursoNoEncontradoException(
                        "Unidad no encontrada"));

        if (!unidad.getActivo()) {
            throw new ReglaNegocioException(
                    "No se puede realizar un inventario sobre una unidad inactiva");
        }

        Usuario responsable = usuarioRepository.findByCodigo(
                request.getCodigoResponsable()
        ).orElseThrow(() ->
                new RecursoNoEncontradoException(
                        "Responsable no encontrado"));

        if (!responsable.getActivo()) {
            throw new ReglaNegocioException(
                    "El responsable seleccionado está inactivo");
        }

        Inventario inventario = new Inventario();

        inventario.setUnidad(unidad);
        inventario.setResponsable(responsable);
        inventario.setFechaInicio(LocalDateTime.now());
        inventario.setEstado(EstadoInventario.EN_PROCESO);

        Inventario guardado = inventarioRepository.save(inventario);

        return convertirAResponse(guardado);
    }

    public List<InventarioResponse> listar() {

        return inventarioRepository.findAll()
                .stream()
                .map(this::convertirAResponse)
                .toList();
    }

    public InventarioResponse buscarPorId(Long id) {

        Inventario inventario = inventarioRepository.findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Inventario no encontrado"));

        return convertirAResponse(inventario);
    }

    public InventarioResponse actualizar(
            Long id,
            InventarioUpdateRequest request) {

        Inventario inventario = inventarioRepository.findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Inventario no encontrado"));

        if (request.getEstado() == null) {
            throw new ReglaNegocioException(
                    "El estado del inventario es obligatorio");
        }

        if (request.getResultadoGeneral() != null
                && request.getEstado() != EstadoInventario.FINALIZADO) {

            throw new ReglaNegocioException(
                    "El resultado general solo puede registrarse cuando el inventario está finalizado");
        }

        inventario.setEstado(request.getEstado());

        if (request.getResultadoGeneral() != null) {
            inventario.setResultadoGeneral(
                    request.getResultadoGeneral()
            );
        }

        if (request.getEstado() == EstadoInventario.FINALIZADO) {

            if (inventario.getFechaFin() == null) {
                inventario.setFechaFin(LocalDateTime.now());
            }
        } else {
            inventario.setFechaFin(null);
        }

        Inventario actualizado = inventarioRepository.save(inventario);

        return convertirAResponse(actualizado);
    }

    private InventarioResponse convertirAResponse(
            Inventario inventario) {

        InventarioResponse response = new InventarioResponse();

        response.setId(inventario.getId());

        if (inventario.getUnidad() != null) {
            response.setIdUnidad(
                    inventario.getUnidad().getId());

            response.setNombreUnidad(
                    inventario.getUnidad().getNombre());
        }

        if (inventario.getResponsable() != null) {
            response.setCodigoResponsable(
                    inventario.getResponsable().getCodigo());

            response.setNombreResponsable(
                    inventario.getResponsable().getNombres()
                            + " "
                            + inventario.getResponsable().getApellidos());
        }

        response.setFechaInicio(
                inventario.getFechaInicio());

        response.setFechaFin(
                inventario.getFechaFin());

        response.setEstado(
                inventario.getEstado());

        response.setResultadoGeneral(
                inventario.getResultadoGeneral());

        return response;
    }
}