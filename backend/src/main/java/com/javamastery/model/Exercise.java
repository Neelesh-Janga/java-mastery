package com.javamastery.model;

import java.util.List;

public class Exercise {
    private String id;
    private String topic;
    private String subtopic;
    private String difficulty;
    private String title;
    private String description;
    private String starterCode;
    private List<String> hints;
    private Solution solution;

    public Exercise() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getSubtopic() { return subtopic; }
    public void setSubtopic(String subtopic) { this.subtopic = subtopic; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStarterCode() { return starterCode; }
    public void setStarterCode(String starterCode) { this.starterCode = starterCode; }

    public List<String> getHints() { return hints; }
    public void setHints(List<String> hints) { this.hints = hints; }

    public Solution getSolution() { return solution; }
    public void setSolution(Solution solution) { this.solution = solution; }
}
