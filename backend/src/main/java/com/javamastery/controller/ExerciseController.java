package com.javamastery.controller;

import com.javamastery.model.Exercise;
import com.javamastery.model.Lecture;
import com.javamastery.model.Topic;
import com.javamastery.service.ExerciseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ExerciseController {

    private final ExerciseService exerciseService;

    public ExerciseController(ExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }

    @GetMapping("/topics")
    public List<Topic> getAllTopics() {
        return exerciseService.getAllTopics();
    }

    @GetMapping("/topics/{topicId}/exercises")
    public List<Exercise> getExercisesByTopic(@PathVariable String topicId) {
        return exerciseService.getExercisesByTopic(topicId);
    }

    @GetMapping("/topics/{topicId}/lectures")
    public List<Lecture> getLecturesByTopic(@PathVariable String topicId) {
        return exerciseService.getLecturesByTopic(topicId);
    }

    @GetMapping("/exercises/{id}")
    public ResponseEntity<Exercise> getExerciseById(@PathVariable String id) {
        return exerciseService.getExerciseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
