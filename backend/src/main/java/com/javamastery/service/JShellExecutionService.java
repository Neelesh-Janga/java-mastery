package com.javamastery.service;

import com.javamastery.model.ExecutionResult;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Service;

import java.io.*;
import java.util.List;
import java.util.Set;
import java.util.concurrent.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class JShellExecutionService {

    private static final int TIMEOUT_SECONDS = 30;
    private static final int MAX_OUTPUT_BYTES = 20_000;

    private static final Set<Pattern> BLOCKED_PATTERNS = Set.of(
        Pattern.compile("Runtime\\.getRuntime\\s*\\(\\s*\\)\\.exec", Pattern.CASE_INSENSITIVE),
        Pattern.compile("new\\s+ProcessBuilder", Pattern.CASE_INSENSITIVE),
        Pattern.compile("System\\s*\\.\\s*exit", Pattern.CASE_INSENSITIVE),
        Pattern.compile("Thread\\s*\\.\\s*sleep\\s*\\(\\s*[0-9]{5,}", Pattern.CASE_INSENSITIVE),
        Pattern.compile("Executors\\.newFixedThreadPool\\s*\\(\\s*[1-9][0-9]{2,}", Pattern.CASE_INSENSITIVE)
    );

    private static final String PREAMBLE = """
            import java.util.*;
            import java.util.stream.*;
            import java.util.function.*;
            import java.util.concurrent.*;
            import java.util.concurrent.atomic.*;
            import java.io.*;
            import java.nio.file.*;
            import java.nio.charset.*;
            import java.time.*;
            import java.time.format.*;
            import com.fasterxml.jackson.databind.*;
            import com.fasterxml.jackson.core.type.*;
            """;

    /**
     * Shared JShell instance — created once at startup with all imports
     * pre-loaded so every user execution is fast (no JVM spin-up cost).
     * Access is serialised through executionLock.
     */
    private jdk.jshell.JShell shell;
    private final Object executionLock = new Object();

    /** Resettable output buffer shared across executions. */
    private final ResettableStream outStream = new ResettableStream(MAX_OUTPUT_BYTES);
    private final ResettableStream errStream = new ResettableStream(MAX_OUTPUT_BYTES);

    @PostConstruct
    public void init() {
        createShell();
        System.out.println("[JShell] Warm-up complete — shared shell ready.");
    }

    @PreDestroy
    public void destroy() {
        synchronized (executionLock) {
            if (shell != null) {
                try { shell.close(); } catch (Exception ignored) {}
            }
        }
    }

    // ── public API ────────────────────────────────────────────────────────

    public ExecutionResult execute(String code) {
        for (Pattern p : BLOCKED_PATTERNS) {
            if (p.matcher(code).find()) {
                return new ExecutionResult("",
                        "Code contains a disallowed operation: " + extractMatch(p, code),
                        false, 0);
            }
        }

        long startTime = System.currentTimeMillis();
        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<ExecutionResult> future = executor.submit(() -> runCode(code, startTime));

        try {
            return future.get(TIMEOUT_SECONDS, TimeUnit.SECONDS);
        } catch (TimeoutException e) {
            future.cancel(true);
            // Shell may be in a bad state — recreate for next request
            synchronized (executionLock) {
                try { shell.close(); } catch (Exception ignored) {}
                createShell();
            }
            return new ExecutionResult("", "Execution timed out after " + TIMEOUT_SECONDS + " seconds.", false,
                    System.currentTimeMillis() - startTime);
        } catch (ExecutionException e) {
            return new ExecutionResult("", "Execution error: " + sanitise(e.getCause()), false,
                    System.currentTimeMillis() - startTime);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return new ExecutionResult("", "Execution interrupted.", false,
                    System.currentTimeMillis() - startTime);
        } finally {
            executor.shutdownNow();
        }
    }

    // ── internals ─────────────────────────────────────────────────────────

    /** Create (or recreate) the shared JShell with all preamble imports loaded. */
    private void createShell() {
        synchronized (executionLock) {
            outStream.reset();
            errStream.reset();

            jdk.jshell.JShell newShell = jdk.jshell.JShell.builder()
                    .out(new PrintStream(outStream))
                    .err(new PrintStream(errStream))
                    .build();

            for (String line : PREAMBLE.trim().split("\n")) {
                String l = line.trim();
                if (!l.isEmpty()) newShell.eval(l);
            }
            shell = newShell;
        }
    }

    private ExecutionResult runCode(String userCode, long startTime) {
        synchronized (executionLock) {
            outStream.reset();
            errStream.reset();

            PrintStream originalOut = System.out;
            PrintStream originalErr = System.err;

            try {
                System.setOut(new PrintStream(outStream));
                System.setErr(new PrintStream(errStream));

                List<jdk.jshell.SnippetEvent> events = shell.eval(userCode);

                StringBuilder output = new StringBuilder(outStream.toString());
                StringBuilder errors  = new StringBuilder(errStream.toString());

                for (jdk.jshell.SnippetEvent event : events) {
                    if (event.status() == jdk.jshell.Snippet.Status.REJECTED) {
                        shell.diagnostics(event.snippet())
                             .collect(Collectors.toList())
                             .forEach(d -> errors.append(d.getMessage(null)).append("\n"));
                    } else if (event.exception() != null) {
                        StringWriter sw = new StringWriter();
                        event.exception().printStackTrace(new PrintWriter(sw));
                        errors.append(sw);
                    } else if (event.value() != null && !event.value().equals("null")) {
                        String src = event.snippet().source().trim();
                        if (!src.endsWith(";") || src.contains("=")) {
                            if (!output.toString().contains(event.value())) {
                                output.append("=> ").append(event.value()).append("\n");
                            }
                        }
                    }
                }

                return new ExecutionResult(
                        truncate(output.toString().trim()),
                        truncate(errors.toString().trim()),
                        errors.length() == 0,
                        System.currentTimeMillis() - startTime
                );

            } catch (Exception e) {
                return new ExecutionResult("", "Internal error: " + sanitise(e), false,
                        System.currentTimeMillis() - startTime);
            } finally {
                System.setOut(originalOut);
                System.setErr(originalErr);

                // Drop all non-import snippets to reset state for next execution
                try {
                    shell.snippets()
                         .filter(s -> s.kind() != jdk.jshell.Snippet.Kind.IMPORT)
                         .collect(Collectors.toList())
                         .forEach(shell::drop);
                } catch (Exception ignored) {
                    // If cleanup fails recreate on next call
                    try { shell.close(); } catch (Exception e2) {}
                    createShell();
                }
            }
        }
    }

    // ── helpers ──────────────────────────────────────────────────────────

    private String extractMatch(Pattern p, String code) {
        var m = p.matcher(code);
        return m.find() ? m.group() : p.pattern();
    }

    private String sanitise(Throwable t) {
        if (t == null) return "unknown error";
        return t.getClass().getSimpleName() + ": " + t.getMessage();
    }

    private String truncate(String s) {
        if (s.length() <= MAX_OUTPUT_BYTES) return s;
        return s.substring(0, MAX_OUTPUT_BYTES) + "\n… [output truncated]";
    }

    /** OutputStream that can be reset between executions and caps byte count. */
    private static final class ResettableStream extends ByteArrayOutputStream {
        private final int limit;
        ResettableStream(int limit) { this.limit = limit; }

        @Override
        public synchronized void write(int b) {
            if (count < limit) super.write(b);
        }

        @Override
        public synchronized void write(byte[] b, int off, int len) {
            int remaining = limit - count;
            if (remaining > 0) super.write(b, off, Math.min(len, remaining));
        }
    }
}
