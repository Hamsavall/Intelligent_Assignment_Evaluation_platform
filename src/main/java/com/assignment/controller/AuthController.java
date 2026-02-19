package com.assignment.controller;

import com.assignment.dto.AuthResponse;
import com.assignment.dto.LoginRequest;
import com.assignment.dto.RegisterRequest;
import com.assignment.model.User;
import com.assignment.security.JwtTokenProvider;
import com.assignment.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        String token = authentication.getCredentials().toString();
        UUID userId = tokenProvider.getUserIdFromToken(token);
        return ResponseEntity.ok(authService.getCurrentUser(userId));
    }
}