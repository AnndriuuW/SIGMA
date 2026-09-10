package com.sigma.config;

import com.sigma.security.JwtAuthenticationFilter;
import com.sigma.service.UsuarioDetailsService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final UsuarioDetailsService usuarioDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            UsuarioDetailsService usuarioDetailsService,
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.usuarioDetailsService = usuarioDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(usuarioDetailsService);

        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager() {
        return new ProviderManager(authenticationProvider());
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of("http://localhost:5173")
        );

        configuration.setAllowedMethods(
                List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {})

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            .authorizeHttpRequests(auth -> auth

                // =====================================================
                // AUTENTICACIÓN
                // =====================================================

                .requestMatchers("/auth/login").permitAll()


                // =====================================================
                // USUARIOS
                // ADMINISTRADOR + JEFE DE MÁQUINAS
                // =====================================================

                .requestMatchers(
                    HttpMethod.GET,
                    "/usuarios",
                    "/usuarios/**"
                ).hasAnyRole(
                    "ADMINISTRADOR",
                    "JEFE_MAQUINAS"
                )

                .requestMatchers(
                    HttpMethod.POST,
                    "/usuarios"
                ).hasAnyRole(
                    "ADMINISTRADOR",
                    "JEFE_MAQUINAS"
                )

                .requestMatchers(
                    HttpMethod.PUT,
                    "/usuarios/**"
                ).hasAnyRole(
                    "ADMINISTRADOR",
                    "JEFE_MAQUINAS"
                )

                .requestMatchers(
                    HttpMethod.DELETE,
                    "/usuarios/**"
                ).hasAnyRole(
                    "ADMINISTRADOR",
                    "JEFE_MAQUINAS"
                )


                // =====================================================
                // UNIDADES
                // Consulta: todos
                // Operación: Administrador, Jefe, Adjunto
                // =====================================================

                .requestMatchers(
                    HttpMethod.GET,
                    "/unidades",
                    "/unidades/**"
                ).hasAnyRole(
                    "ADMINISTRADOR",
                    "JEFE_MAQUINAS",
                    "PERSONAL_ADJUNTO",
                    "BOMBERO"
                )

                .requestMatchers(
                    HttpMethod.POST,
                    "/unidades"
                ).hasAnyRole(
                    "ADMINISTRADOR",
                    "JEFE_MAQUINAS",
                    "PERSONAL_ADJUNTO"
                )

                .requestMatchers(
                    HttpMethod.PUT,
                    "/unidades/**"
                ).hasAnyRole(
                    "ADMINISTRADOR",
                    "JEFE_MAQUINAS",
                    "PERSONAL_ADJUNTO"
                )

                .requestMatchers(
                    HttpMethod.DELETE,
                    "/unidades/**"
                ).hasAnyRole(
                    "ADMINISTRADOR",
                    "JEFE_MAQUINAS",
                    "PERSONAL_ADJUNTO"
                )


                // =====================================================
                // UBICACIONES
                // =====================================================

                .requestMatchers(
                    HttpMethod.GET,
                    "/ubicaciones",
                    "/ubicaciones/**"
                ).hasAnyRole(
                    "ADMINISTRADOR",
                    "JEFE_MAQUINAS",
                    "PERSONAL_ADJUNTO",
                    "BOMBERO"
                )

                .requestMatchers(
                    HttpMethod.POST,
                    "/ubicaciones"
                ).hasAnyRole(
                    "ADMINISTRADOR",
                    "JEFE_MAQUINAS",
                    "PERSONAL_ADJUNTO"
                )

                .requestMatchers(
                    HttpMethod.PUT,
                    "/ubicaciones/**"
                ).hasAnyRole(
                    "ADMINISTRADOR",
                    "JEFE_MAQUINAS",
                    "PERSONAL_ADJUNTO"
                )

                .requestMatchers(
                    HttpMethod.DELETE,
                    "/ubicaciones/**"
                ).hasAnyRole(
                    "ADMINISTRADOR",
                    "JEFE_MAQUINAS",
                    "PERSONAL_ADJUNTO"
                )


                // =====================================================
                // TIPOS DE RECURSO
                // =====================================================

                .requestMatchers(
                    HttpMethod.GET,
                    "/tipos-recurso",
                    "/tipos-recurso/**"
                ).hasAnyRole(
                    "ADMINISTRADOR",
                    "JEFE_MAQUINAS",
                    "PERSONAL_ADJUNTO",
                    "BOMBERO"
                )

                .requestMatchers(
                    HttpMethod.POST,
                    "/tipos-recurso"
                ).hasAnyRole(
                    "ADMINISTRADOR",
                    "JEFE_MAQUINAS",
                    "PERSONAL_ADJUNTO"
                )

                .requestMatchers(
                    HttpMethod.PUT,
                    "/tipos-recurso/**"
                ).hasAnyRole(
                    "ADMINISTRADOR",
                    "JEFE_MAQUINAS",
                    "PERSONAL_ADJUNTO"
                )


                // =====================================================
                // RECURSOS
                // =====================================================

                .requestMatchers(
                    HttpMethod.GET,
                    "/recursos",
                    "/recursos/**"
                ).hasAnyRole(
                    "ADMINISTRADOR",
                    "JEFE_MAQUINAS",
                    "PERSONAL_ADJUNTO",
                    "BOMBERO"
                )

                .requestMatchers(
                    HttpMethod.POST,
                    "/recursos"
                ).hasAnyRole(
                    "ADMINISTRADOR",
                    "JEFE_MAQUINAS",
                    "PERSONAL_ADJUNTO"
                )

                .requestMatchers(
                    HttpMethod.PUT,
                    "/recursos/**"
                ).hasAnyRole(
                    "ADMINISTRADOR",
                    "JEFE_MAQUINAS",
                    "PERSONAL_ADJUNTO"
                )

                .requestMatchers(
                    HttpMethod.DELETE,
                    "/recursos/**"
                ).hasAnyRole(
                    "ADMINISTRADOR",
                    "JEFE_MAQUINAS",
                    "PERSONAL_ADJUNTO"
                )


                // =====================================================
                // OCURRENCIAS
                // =====================================================

                .requestMatchers(
                    HttpMethod.GET,
                    "/ocurrencias",
                    "/ocurrencias/**"
                ).hasAnyRole(
                    "ADMINISTRADOR",
                    "JEFE_MAQUINAS",
                    "PERSONAL_ADJUNTO",
                    "BOMBERO"
                )

                .requestMatchers(
                    HttpMethod.POST,
                    "/ocurrencias"
                ).hasAnyRole(
                    "ADMINISTRADOR",
                    "JEFE_MAQUINAS",
                    "PERSONAL_ADJUNTO"
                )


                // =====================================================
                // INVENTARIOS
                // =====================================================

                .requestMatchers(
                    HttpMethod.GET,
                    "/inventarios",
                    "/inventarios/**"
                ).hasAnyRole(
                    "ADMINISTRADOR",
                    "JEFE_MAQUINAS",
                    "PERSONAL_ADJUNTO",
                    "BOMBERO"
                )

                .requestMatchers(
                    HttpMethod.POST,
                    "/inventarios"
                ).hasAnyRole(
                    "ADMINISTRADOR",
                    "JEFE_MAQUINAS",
                    "PERSONAL_ADJUNTO"
                )

                .requestMatchers(
                    HttpMethod.PUT,
                    "/inventarios/**"
                ).hasAnyRole(
                    "ADMINISTRADOR",
                    "JEFE_MAQUINAS",
                    "PERSONAL_ADJUNTO"
                )


                // =====================================================
                // DETALLES DE INVENTARIO
                // =====================================================

                .requestMatchers(
                    HttpMethod.GET,
                    "/detalles-inventario",
                    "/detalles-inventario/**"
                ).hasAnyRole(
                    "ADMINISTRADOR",
                    "JEFE_MAQUINAS",
                    "PERSONAL_ADJUNTO",
                    "BOMBERO"
                )

                .requestMatchers(
                    HttpMethod.POST,
                    "/detalles-inventario"
                ).hasAnyRole(
                    "ADMINISTRADOR",
                    "JEFE_MAQUINAS",
                    "PERSONAL_ADJUNTO"
                )

                .requestMatchers(
                    HttpMethod.PUT,
                    "/detalles-inventario/**"
                ).hasAnyRole(
                    "ADMINISTRADOR",
                    "JEFE_MAQUINAS",
                    "PERSONAL_ADJUNTO"
                )


                // =====================================================
                // CUALQUIER OTRA RUTA
                // =====================================================

                .anyRequest().authenticated()
            )

            // =========================================================
            // MANEJO DE 401 Y 403
            // =========================================================

            .exceptionHandling(exception -> exception

                .authenticationEntryPoint(
                    (request, response, authException) -> {
                        response.setStatus(
                            HttpServletResponse.SC_UNAUTHORIZED
                        );
                    }
                )

                .accessDeniedHandler(
                    (request, response, accessDeniedException) -> {
                        response.setStatus(
                            HttpServletResponse.SC_FORBIDDEN
                        );
                    }
                )
            )

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}