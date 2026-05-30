package com.javamastery.service;

import com.javamastery.model.ExecutionResult;
import org.springframework.stereotype.Service;

import java.io.*;
import java.util.List;
import java.util.Set;
import java.util.concurrent.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class JShellExecutionService {

    private static final int TIMEOUT_SECONDS = 10;

    /** Max bytes captured from stdout/stderr before truncating */
    private static final int MAX_OUTPUT_BYTES = 20_000;

    /**
     * Patterns that attempt OS escape, process spawning, or JVM shutdown.
     * These are blocked before even reaching JShell.
     */
    private static final Set<Pattern> BLOCKED_PATTERNS = Set.of(
        Pattern.compile("Runtime\\.getRuntime\\s*\\(\\s*\\)\\s*\\.exec", Pattern.CASE_INSENSITIVE),
        Pattern.compile("new\\s+ProcessBuilder", Pattern.CASE_INSENSITIVE),
        Pattern.compile("System\\s*\\.\\s*exit", Pattern.CASE_INSENSITIVE),
        Pattern.compile("Thread\\s*\\.\\s*sleep\\s*\\(\\s*[0-9]{5,}", Pattern.CASE_INSENSITIVE), // sleep > 9999ms
        Pattern.compile("new\\s+Thread\\s*\\(.*\\)\\.start\\s*\\(\\s*\\)", Pattern.CASE_INSENSITIVE),
        Pattern.compile("Executors\\.newFixedThreadPool\\s*\\(\\s*[1-9][0-9]{2,}", Pattern.CASE_INSENSITIVE) // pools >= 100
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

    public ExecutionResult execute(String code) {
        // Pre-flight security check
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

    private ExecutionResult runCode(String userCode, long startTime) {
        LimitedOutputStream outBuffer = new LimitedOutputStream(MAX_OUTPUT_BYTES);
        LimitedOutputStream errBuffer = new LimitedOutputStream(MAX_OUTPUT_BYTES);
        PrintStream originalOut = System.out;
        PrintStream originalErr = System.err;

        try (jdk.jshell.JShell shell = jdk.jshell.JShell.builder()
                .out(new PrintStream(outBuffer))
                .err(new PrintStream(errBuffer))
                .build()) {

            System.setOut(new PrintStream(outBuffer));
            System.setErr(new PrintStream(errBuffer));

            for (String importLine : PREAMBLE.trim().split("\n")) {
                String line = importLine.trim();
                if (!line.isEmpty()) shell.eval(line);
            }

            List<jdk.jshell.SnippetEvent> events = shell.eval(userCode);

            StringBuilder output = new StringBuilder(outBuffer.toString());
            StringBuilder errors  = new StringBuilder(errBuffer.toString());

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
        }
    }

    // ── helpers ──────────────────────────────────────────────────────────

    private String extractMatch(Pattern p, String code) {
        var m = p.matcher(code);
        return m.find() ? m.group() : p.pattern();
    }

    /** Return exception class + message only — never a full stack trace to the client. */
    private String sanitise(Throwable t) {
        if (t == null) return "unknown error";
        return t.getClass().getSimpleName() + ": " + t.getMessage();
    }

    private String truncate(String s) {
        if (s.length() <= MAX_OUTPUT_BYTES) return s;
        return s.substring(0, MAX_OUTPUT_BYTES) + "\n… [output truncated]";
    }

    /** OutputStream that stops accepting bytes once the limit is reached */
    private static final class LimitedOutputStream extends ByteArrayOutputStream {
        private final int limit;
        LimitedOutputStream(int limit) { this.limit = limit; }

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
