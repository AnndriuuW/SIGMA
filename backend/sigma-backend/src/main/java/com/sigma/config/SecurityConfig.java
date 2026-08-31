package com.sigma.config;

import com.sigma.service.UsuarioDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import com.sigma.security.JwtAuthenticationFilter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
public class SecurityConfig {

    private final UsuarioDetailsService usuarioDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(UsuarioDetailsService usuarioDetailsService, JwtAuthenticationFilter jwtAuthenticationFilter) {
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
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )
            .authorizeHttpRequests(auth -> auth

                .requestMatchers("/auth/login").permitAll()

                // USUARIOS
                .requestMatchers(
                    HttpMethod.GET,
                    "/usuarios",
                    "/usuarios/**"
                ).hasRole("ADMINISTRADOR")

                .requestMatchers(
                    HttpMethod.POST,
                    "/usuarios"
                ).hasRole("ADMINISTRADOR")

                .requestMatchers(
                    HttpMethod.PUT,
                    "/usuarios/**"
                ).hasRole("ADMINISTRADOR")

                .requestMatchers(
                    HttpMethod.DELETE,
                    "/usuarios/**"
                ).hasRole("ADMINISTRADOR")
                
                // UNIDADES
                .requestMatchers(
                        HttpMethod.GET,
                        "/unidades",
                        "/unidades/**"
                ).hasAnyRole("ADMINISTRADOR", "PERSONAL_ADJUNTO")

                .requestMatchers(
                        HttpMethod.POST,
                        "/unidades"
                ).hasAnyRole("ADMINISTRADOR", "PERSONAL_ADJUNTO")

                .requestMatchers(
                        HttpMethod.PUT,
                        "/unidades/**"
                ).hasAnyRole("ADMINISTRADOR", "PERSONAL_ADJUNTO")

                .requestMatchers(
                        HttpMethod.DELETE,
                        "/unidades/**"
                ).hasAnyRole("ADMINISTRADOR", "PERSONAL_ADJUNTO")

                // UBICACIONES
                .requestMatchers(
                        HttpMethod.GET,
                        "/ubicaciones",
                        "/ubicaciones/**"
                ).hasAnyRole("ADMINISTRADOR", "PERSONAL_ADJUNTO")

                .requestMatchers(
                        HttpMethod.POST,
                        "/ubicaciones"
                ).hasAnyRole("ADMINISTRADOR", "PERSONAL_ADJUNTO")

                .requestMatchers(
                        HttpMethod.PUT,
                        "/ubicaciones/**"
                ).hasAnyRole("ADMINISTRADOR", "PERSONAL_ADJUNTO")

                .requestMatchers(
                        HttpMethod.DELETE,
                        "/ubicaciones/**"
                ).hasAnyRole("ADMINISTRADOR", "PERSONAL_ADJUNTO")

                // TIPOS DE RECURSO
                .requestMatchers(
                        HttpMethod.GET,
                        "/tipos-recurso",
                        "/tipos-recurso/**"
                ).hasAnyRole("ADMINISTRADOR", "PERSONAL_ADJUNTO")

                .requestMatchers(
                        HttpMethod.POST,
                        "/tipos-recurso"
                ).hasAnyRole("ADMINISTRADOR", "PERSONAL_ADJUNTO")

                .requestMatchers(
                        HttpMethod.PUT,
                        "/tipos-recurso/**"
                ).hasAnyRole("ADMINISTRADOR", "PERSONAL_ADJUNTO")

                // RECURSOS
                .requestMatchers(
                        HttpMethod.GET,
                        "/recursos",
                        "/recursos/**"
                ).hasAnyRole("ADMINISTRADOR", "PERSONAL_ADJUNTO")

                .requestMatchers(
                        HttpMethod.POST,
                        "/recursos"
                ).hasAnyRole("ADMINISTRADOR", "PERSONAL_ADJUNTO")

                .requestMatchers(
                        HttpMethod.PUT,
                        "/recursos/**"
                ).hasAnyRole("ADMINISTRADOR", "PERSONAL_ADJUNTO")

                .requestMatchers(
                        HttpMethod.DELETE,
                        "/recursos/**"
                ).hasAnyRole("ADMINISTRADOR", "PERSONAL_ADJUNTO")

                // OCURRENCIAS
                .requestMatchers(
                        HttpMethod.GET,
                        "/ocurrencias",
                        "/ocurrencias/**"
                ).hasAnyRole("ADMINISTRADOR", "PERSONAL_ADJUNTO")

                .requestMatchers(
                        HttpMethod.POST,
                        "/ocurrencias"
                ).hasAnyRole("ADMINISTRADOR", "PERSONAL_ADJUNTO")

                // INVENTARIOS
                .requestMatchers(
                        HttpMethod.GET,
                        "/inventarios",
                        "/inventarios/**"
                ).hasAnyRole("ADMINISTRADOR", "PERSONAL_ADJUNTO")

                .requestMatchers(
                        HttpMethod.POST,
                        "/inventarios"
                ).hasAnyRole("ADMINISTRADOR", "PERSONAL_ADJUNTO")

                .requestMatchers(
                        HttpMethod.PUT,
                        "/inventarios/**"
                ).hasAnyRole("ADMINISTRADOR", "PERSONAL_ADJUNTO")

                .anyRequest().authenticated()
            )
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                })
            )
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}
