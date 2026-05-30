package com.javamastery.model;

import java.util.List;

public class Solution {
    private String code;
    private String explanation;
    private List<MethodSignature> methodSignatures;

    public Solution() {}

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public List<MethodSignature> getMethodSignatures() { return methodSignatures; }
    public void setMethodSignatures(List<MethodSignature> methodSignatures) { this.methodSignatures = methodSignatures; }
}
