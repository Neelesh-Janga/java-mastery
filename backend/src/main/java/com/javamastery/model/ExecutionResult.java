package com.javamastery.model;

public class ExecutionResult {
    private String output;
    private String error;
    private boolean success;
    private long executionTimeMs;

    public ExecutionResult() {}

    public ExecutionResult(String output, String error, boolean success, long executionTimeMs) {
        this.output = output;
        this.error = error;
        this.success = success;
        this.executionTimeMs = executionTimeMs;
    }

    public String getOutput() { return output; }
    public void setOutput(String output) { this.output = output; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public long getExecutionTimeMs() { return executionTimeMs; }
    public void setExecutionTimeMs(long executionTimeMs) { this.executionTimeMs = executionTimeMs; }
}
