package com.sigma.service;

import com.sigma.dto.DetalleInventarioCreateRequest;
import com.sigma.dto.DetalleInventarioResponse;
import com.sigma.dto.DetalleInventarioUpdateRequest;
import com.sigma.dto.OcurrenciaCreateRequest;
import com.sigma.entity.DetalleInventario;
import com.sigma.entity.EstadoInventario;
import com.sigma.entity.Inventario;
import com.sigma.entity.Recurso;
import com.sigma.entity.TipoOcurrencia;
import com.sigma.entity.Usuario;
import com.sigma.exception.RecursoNoEncontradoException;
import com.sigma.exception.ReglaNegocioException;
import com.sigma.repository.DetalleInventarioRepository;
import com.sigma.repository.InventarioRepository;
import com.sigma.repository.RecursoRepository;
import com.sigma.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DetalleInventarioService {

    private final DetalleInventarioRepository detalleInventarioRepository;
    private final InventarioRepository inventarioRepository;
    private final RecursoRepository recursoRepository;
    private final UsuarioRepository usuarioRepository;
    private final OcurrenciaService ocurrenciaService;

    public DetalleInventarioService(
            DetalleInventarioRepository detalleInventarioRepository,
            InventarioRepository inventarioRepository,
            RecursoRepository recursoRepository,
            UsuarioRepository usuarioRepository,
            OcurrenciaService ocurrenciaService) {

        this.detalleInventarioRepository = detalleInventarioRepository;
        this.inventarioRepository = inventarioRepository;
        this.recursoRepository = recursoRepository;
        this.usuarioRepository = usuarioRepository;
        this.ocurrenciaService = ocurrenciaService;
    }

    public DetalleInventarioResponse crear(
            DetalleInventarioCreateRequest request) {

        Inventario inventario = inventarioRepository
                .findById(request.getIdInventario())
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Inventario no encontrado"));

        if (inventario.getEstado() == EstadoInventario.FINALIZADO) {
            throw new ReglaNegocioException(
                    "No se pueden registrar detalles en un inventario finalizado");
        }

        Recurso recurso = recursoRepository
                .findById(request.getIdRecurso())
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Recurso no encontrado"));

        if (recurso.getUbicacion() == null
                || recurso.getUbicacion().getUnidad() == null
                || !recurso.getUbicacion().getUnidad().getId()
                        .equals(inventario.getUnidad().getId())) {

            throw new ReglaNegocioException(
                    "El recurso no pertenece a la unidad del inventario");
        }

        if (detalleInventarioRepository
                .existsByInventarioIdAndRecursoId(
                        inventario.getId(),
                        recurso.getId())) {

            throw new ReglaNegocioException(
                    "El recurso ya fue registrado en este inventario");
        }

        Usuario usuarioVerificador = obtenerUsuarioAutenticado();

        DetalleInventario detalle = new DetalleInventario();

        detalle.setInventario(inventario);
        detalle.setRecurso(recurso);
        detalle.setVerificado(request.getVerificado());
        detalle.setVerificadoPor(usuarioVerificador);
        detalle.setFechaVerificacion(LocalDateTime.now());
        detalle.setObservacion(request.getObservacion());

        DetalleInventario guardado =
                detalleInventarioRepository.save(detalle);

        if (!request.getVerificado()) {
            generarNovedad(recurso);
        }

        return convertirRespuesta(guardado);
    }

    public List<DetalleInventarioResponse> listar() {

        return detalleInventarioRepository.findAll()
                .stream()
                .map(this::convertirRespuesta)
                .toList();
    }

    public DetalleInventarioResponse buscarPorId(Long id) {

        DetalleInventario detalle =
                detalleInventarioRepository.findById(id)
                        .orElseThrow(() ->
                                new RecursoNoEncontradoException(
                                        "Detalle de inventario no encontrado"));

        return convertirRespuesta(detalle);
    }

    public DetalleInventarioResponse actualizar(
            Long id,
            DetalleInventarioUpdateRequest request) {

        DetalleInventario detalle =
                detalleInventarioRepository.findById(id)
                        .orElseThrow(() ->
                                new RecursoNoEncontradoException(
                                        "Detalle de inventario no encontrado"));

        if (detalle.getInventario().getEstado()
                == EstadoInventario.FINALIZADO) {

            throw new ReglaNegocioException(
                    "No se puede modificar un detalle de un inventario finalizado");
        }

        Usuario usuarioVerificador = obtenerUsuarioAutenticado();

        Boolean verificadoAnterior = detalle.getVerificado();

        detalle.setVerificado(request.getVerificado());
        detalle.setVerificadoPor(usuarioVerificador);
        detalle.setFechaVerificacion(LocalDateTime.now());
        detalle.setObservacion(request.getObservacion());

        DetalleInventario actualizado =
                detalleInventarioRepository.save(detalle);

        /*
         * Generar novedad únicamente cuando el recurso
         * cambia de verificado a no verificado.
         */
        if (Boolean.TRUE.equals(verificadoAnterior)
                && Boolean.FALSE.equals(request.getVerificado())) {

            generarNovedad(actualizado.getRecurso());
        }

        return convertirRespuesta(actualizado);
    }

    private Usuario obtenerUsuarioAutenticado() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new RecursoNoEncontradoException(
                    "Usuario no autenticado");
        }

        String codigo = authentication.getName();

        Usuario usuario = usuarioRepository
                .findByCodigo(codigo)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Usuario autenticado no encontrado"));

        if (!usuario.getActivo()) {
            throw new ReglaNegocioException(
                    "El usuario autenticado está inactivo");
        }

        return usuario;
    }

    private void generarNovedad(Recurso recurso) {

        Usuario jefeMaquinas = usuarioRepository
                .findFirstByRolNombreAndActivoTrue("JEFE_MAQUINAS")
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "No existe un Jefe de Máquinas activo"));

        OcurrenciaCreateRequest ocurrenciaRequest =
                new OcurrenciaCreateRequest();

        ocurrenciaRequest.setTipo(TipoOcurrencia.RECURSO);

        ocurrenciaRequest.setDescripcion(
                "Novedad detectada durante inventario: el recurso "
                        + recurso.getCodigo()
                        + " - "
                        + recurso.getNombre()
                        + " no fue verificado."
        );

        ocurrenciaRequest.setCodigoDestinatario(
                jefeMaquinas.getCodigo()
        );

        ocurrenciaRequest.setIdRecurso(
                recurso.getId()
        );

        ocurrenciaService.crear(ocurrenciaRequest);
    }

    private DetalleInventarioResponse convertirRespuesta(
            DetalleInventario detalle) {

        DetalleInventarioResponse response =
                new DetalleInventarioResponse();

        response.setId(detalle.getId());

        response.setIdInventario(
                detalle.getInventario().getId());

        response.setIdRecurso(
                detalle.getRecurso().getId());

        response.setCodigoRecurso(
                detalle.getRecurso().getCodigo());

        response.setNombreRecurso(
                detalle.getRecurso().getNombre());

        if (detalle.getVerificadoPor() != null) {

            response.setCodigoVerificadoPor(
                    detalle.getVerificadoPor().getCodigo());

            response.setNombreVerificadoPor(
                    detalle.getVerificadoPor().getNombres()
                            + " "
                            + detalle.getVerificadoPor().getApellidos());
        }

        response.setVerificado(
                detalle.getVerificado());

        response.setFechaVerificacion(
                detalle.getFechaVerificacion());

        response.setObservacion(
                detalle.getObservacion());

        return response;
    }
}