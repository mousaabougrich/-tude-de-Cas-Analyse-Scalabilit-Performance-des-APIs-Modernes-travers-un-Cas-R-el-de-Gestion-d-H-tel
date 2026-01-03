FROM maven:3.8.6-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and proto files, then build
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy jar from build stage (use the jar-with-dependencies)
COPY --from=build /app/target/*-jar-with-dependencies.jar app.jar

# Expose gRPC port
EXPOSE 9090

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
