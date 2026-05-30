package com.javamastery.model;

import java.util.List;

public class Lecture {
    private String id;
    private String topicId;
    private String title;
    private int order;
    private List<LectureSection> sections;

    public Lecture() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTopicId() { return topicId; }
    public void setTopicId(String topicId) { this.topicId = topicId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public int getOrder() { return order; }
    public void setOrder(int order) { this.order = order; }

    public List<LectureSection> getSections() { return sections; }
    public void setSections(List<LectureSection> sections) { this.sections = sections; }
}
