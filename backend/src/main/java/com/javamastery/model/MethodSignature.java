package com.javamastery.model;

public class MethodSignature {
    private String method;
    private String description;

    public MethodSignature() {}

    public MethodSignature(String method, String description) {
        this.method = method;
        this.description = description;
    }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
