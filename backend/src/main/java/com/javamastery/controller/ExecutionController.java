package com.javamastery.controller;

import com.javamastery.model.ExecutionResult;
import com.javamastery.service.JShellExecutionService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class ExecutionController {

    /** Maximum allowed code length (chars). Blocks trivially large payloads. */
    private static final int MAX_CODE_LENGTH = 8_000;

    private final JShellExecutionService executionService;

    public ExecutionController(JShellExecutionService executionService) {
        this.executionService = executionService;
    }

    @PostMapping(value = "/execute",
                 consumes = MediaType.APPLICATION_JSON_VALUE,
                 produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ExecutionResult> execute(@RequestBody Map<String, String> request) {
        String code = request.getOrDefault("code", "").strip();

        if (code.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new ExecutionResult("", "No code provided.", false, 0));
        }
        if (code.length() > MAX_CODE_LENGTH) {
            return ResponseEntity.badRequest()
                    .body(new ExecutionResult("", "Code exceeds maximum allowed length (" + MAX_CODE_LENGTH + " chars).", false, 0));
        }

        return ResponseEntity.ok(executionService.execute(code));
    }
}
