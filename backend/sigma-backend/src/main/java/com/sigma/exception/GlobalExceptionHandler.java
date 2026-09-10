package com.sigma.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // =========================================================
    // ERRORES DE VALIDACIÓN
    // =========================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> manejarErroresValidacion(
            MethodArgumentNotValidException ex) {

        Map<String, String> errores = new HashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errores.put(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errores);
    }


    // =========================================================
    // RECURSO DUPLICADO
    // =========================================================

    @ExceptionHandler(RecursoDuplicadoException.class)
    public ResponseEntity<Map<String, String>> manejarRecursoDuplicado(
            RecursoDuplicadoException ex) {

        Map<String, String> respuesta = new HashMap<>();

        respuesta.put("mensaje", ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(respuesta);
    }


    // =========================================================
    // RECURSO NO ENCONTRADO
    // =========================================================

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<Map<String, String>> manejarRecursoNoEncontrado(
            RecursoNoEncontradoException ex) {

        Map<String, String> respuesta = new HashMap<>();

        respuesta.put("mensaje", ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(respuesta);
    }


    // =========================================================
    // REGLA DE NEGOCIO
    // =========================================================

    @ExceptionHandler(ReglaNegocioException.class)
    public ResponseEntity<Map<String, String>> manejarReglaNegocio(
            ReglaNegocioException ex) {

        Map<String, String> respuesta = new HashMap<>();

        respuesta.put("mensaje", ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(respuesta);
    }


    // =========================================================
    // ERROR NO CONTROLADO
    // =========================================================

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> manejarErrorGeneral(
            Exception ex) {

        Map<String, String> respuesta = new HashMap<>();

        respuesta.put(
                "mensaje",
                "Ocurrió un error interno en el servidor"
        );

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(respuesta);
    }
}