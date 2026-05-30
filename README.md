# Java Mastery — Interactive Learning Platform

A Docker-based interactive app to master Java Streams, Optional, CompletableFuture, and Java IO.

## Quick Start

```bash
cd java-mastery
docker-compose up --build
```

Open http://localhost:3000

> First build takes 3-5 minutes (Maven downloads dependencies). Subsequent builds are cached.

## What's Inside

| Topic | Exercises | Coverage |
|-------|-----------|----------|
| Java Streams | 40 | filter, map, flatMap, reduce, groupingBy, word/char frequency, sort Map, top-N, teeing, custom Collector, parallel streams, takeWhile/dropWhile, mapMulti |
| Optional | 12 | of/ofNullable/empty, orElse/orElseGet/orElseThrow, map, flatMap, filter, ifPresent, or(), stream(), chaining, anti-patterns |
| CompletableFuture | 14 | supplyAsync, thenApply, thenAccept, thenRun, thenCompose, thenCombine, allOf, anyOf, exceptionally, handle, whenComplete, completeExceptionally, orTimeout, full checkout pipeline |
| Java IO | 16 | FileInputStream/OutputStream, BufferedInput/OutputStream, DataInput/OutputStream, ObjectInput/OutputStream (serialization), FileReader/Writer, BufferedReader, PrintWriter, CSV read/write, JSON with Jackson |

## Features

- **Monaco Editor** — syntax-highlighted Java code editor with Cmd+Enter to run
- **JShell execution** — code runs in an isolated JShell snippet with a 10-second timeout
- **Hints system** — step-through hints before revealing the solution
- **Solution drawer** — full solution code + plain-English explanation + all method signatures with Javadoc
- **Progress tracking** — localStorage-persisted checkmarks per exercise, progress bars per topic
- **Difficulty badges** — Beginner / Intermediate / Advanced

## Architecture

```
Browser (:3000) → nginx → React SPA
                       ↳ /api/* → Spring Boot (:8080) → JShell API
```

## Ports

| Service | Port |
|---------|------|
| Frontend (nginx) | 3000 |
| Backend (Spring Boot) | 8080 |
