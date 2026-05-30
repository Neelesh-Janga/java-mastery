package com.javamastery.model;

public class Topic {
    private String id;
    private String title;
    private String description;
    private String icon;
    private int exerciseCount;

    public Topic() {}

    public Topic(String id, String title, String description, String icon, int exerciseCount) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.icon = icon;
        this.exerciseCount = exerciseCount;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public int getExerciseCount() { return exerciseCount; }
    public void setExerciseCount(int exerciseCount) { this.exerciseCount = exerciseCount; }
}
