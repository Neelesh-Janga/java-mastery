# Stage 1: Build with Maven
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies first (cached layer)
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

# Stage 2: Run with full JDK (JShell requires JDK, not JRE)
FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY --from=build /app/target/java-mastery-backend-1.0.0.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", \
  "--add-opens=jdk.jshell/jdk.jshell=ALL-UNNAMED", \
  "--add-exports=jdk.jshell/jdk.jshell=ALL-UNNAMED", \
  "-jar", "app.jar"]
