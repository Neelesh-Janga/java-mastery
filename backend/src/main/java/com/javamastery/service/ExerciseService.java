package com.javamastery.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javamastery.model.Exercise;
import com.javamastery.model.Lecture;
import com.javamastery.model.Topic;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExerciseService {

    private final ObjectMapper mapper = new ObjectMapper();
    private final Map<String, List<Exercise>> exercisesByTopic = new LinkedHashMap<>();
    private final Map<String, List<Lecture>> lecturesByTopic = new LinkedHashMap<>();

    private static final List<Topic> TOPIC_DEFINITIONS = List.of(
        // Original topics
        new Topic("streams",           "Java Streams",              "Master the Stream API from filter/map basics to collectors, parallel streams, and custom collectors.", "⚡", 0),
        new Topic("optional",          "Optional",                  "Safely handle null values and chain transformations without NullPointerExceptions.", "🔒", 0),
        new Topic("completablefuture", "CompletableFuture",         "Async programming with chaining, combining, and exception handling through real-world scenarios.", "🚀", 0),
        new Topic("io",                "Java IO",                   "Read and write files with byte streams, character streams, CSV parsing, and JSON via Jackson.", "📁", 0),
        // New topics
        new Topic("collections",       "Java Collections",          "Deep-dive into HashMap, ArrayList, LinkedList, TreeMap, PriorityQueue, and Set implementations.", "🗂️", 0),
        new Topic("generics",          "Generics",                  "Wildcards, bounded type parameters, generic methods, and type erasure explained.", "🔷", 0),
        new Topic("functional",        "Functional Interfaces",     "Predicate, Function, Consumer, Supplier, BiFunction, UnaryOperator and method references.", "λ", 0),
        new Topic("concurrency",       "Concurrency",               "synchronized, locks, ExecutorService, CompletionService, CountDownLatch, and thread safety.", "🔀", 0),
        new Topic("exceptions",        "Exception Handling",        "Checked vs unchecked, custom exceptions, multi-catch, try-with-resources, and best practices.", "⚠️", 0),
        new Topic("strings",           "String Manipulation",       "String methods, StringBuilder, regex, split, format, and common interview patterns.", "🔤", 0),
        new Topic("datetime",          "Date & Time API",           "LocalDate, LocalDateTime, ZonedDateTime, Duration, Period, DateTimeFormatter (java.time).", "📅", 0),
        new Topic("spring-security",   "Spring Security",           "Authentication, authorization, JWT, filters, SecurityFilterChain, OAuth2, and method-level security.", "🛡️", 0),
        new Topic("jpa",               "JPA & Spring Data",         "Entity mapping, relationships (@OneToMany etc.), JPQL, Criteria API, repositories, and N+1 problem.", "🗄️", 0),
        new Topic("aws",               "AWS (Developer Associate)", "Comprehensive beginner-to-associate guide: every core service explained, configured, and scenario-tested for the AWS Dev Associate exam.", "☁️", 0)
    );

    @PostConstruct
    public void loadExercises() throws IOException {
        for (Topic t : TOPIC_DEFINITIONS) {
            ClassPathResource exerciseFile = new ClassPathResource("exercises/" + t.getId() + ".json");
            if (exerciseFile.exists()) {
                try (InputStream is = exerciseFile.getInputStream()) {
                    List<Exercise> exercises = mapper.readValue(is, new TypeReference<>() {});
                    exercisesByTopic.put(t.getId(), exercises);
                }
            }

            ClassPathResource lectureFile = new ClassPathResource("exercises/" + t.getId() + "-lectures.json");
            if (lectureFile.exists()) {
                try (InputStream is = lectureFile.getInputStream()) {
                    List<Lecture> lectures = mapper.readValue(is, new TypeReference<>() {});
                    lecturesByTopic.put(t.getId(), lectures);
                }
            }
        }
    }

    public List<Topic> getAllTopics() {
        return TOPIC_DEFINITIONS.stream().map(t -> {
            int count = exercisesByTopic.getOrDefault(t.getId(), List.of()).size();
            return new Topic(t.getId(), t.getTitle(), t.getDescription(), t.getIcon(), count);
        }).collect(Collectors.toList());
    }

    public List<Exercise> getExercisesByTopic(String topicId) {
        return exercisesByTopic.getOrDefault(topicId, List.of());
    }

    public Optional<Exercise> getExerciseById(String id) {
        return exercisesByTopic.values().stream()
                .flatMap(List::stream)
                .filter(e -> e.getId().equals(id))
                .findFirst();
    }

    public List<Lecture> getLecturesByTopic(String topicId) {
        return lecturesByTopic.getOrDefault(topicId, List.of());
    }
}
