# Project Revival & Upgrade Changelog 📋

This document provides a detailed breakdown of all changes made during the modernization, database migration, and UI enhancement of the **Hotel Management System**.

---

## 🔍 1. Before vs. After Summary

| Aspect | Before | After (Revived & Modernized) |
| :--- | :--- | :--- |
| **Database Engine** | MySQL 8.x | **PostgreSQL 18** (compatible with all PostgreSQL 12+) |
| **Database Management** | Manual MySQL command line | **pgAdmin 4** compatible with ready-to-run SQL scripts |
| **JDBC Driver** | `com.mysql:mysql-connector-j` | Official `org.postgresql:postgresql` Type-4 Driver |
| **User Interface** | No graphical UI / raw REST endpoints only | **Modern Glassmorphism Single-Page Application** with fluid micro-animations |
| **Database Credentials** | Hard-coded inside `application.properties` | Centralized with **environment variable overrides** (`${DB_HOST}`, `${DB_PASSWORD}`, etc.) & `.env.example` |
| **SQL Initialization** | None provided | [`database/schema.sql`](database/schema.sql) & [`database/seed.sql`](database/seed.sql) |
| **Input Validation** | None (null/invalid data could reach DB) | **Jakarta Validation** annotations (`@NotBlank`, `@Email`, `@DecimalMin`, `@NotNull`, `@Valid`) |
| **Error Handling** | Unhandled `RuntimeException` with raw stack traces | **`GlobalExceptionHandler`** returning clean, user-friendly JSON error payloads |
| **Business Logic** | Basic CRUD without stay price calculation | Auto-calculation of nights and total amount (`nights * pricePerNight`), self-exclusion on booking update |
| **System Diagnostics** | None | Live PostgreSQL connection health inspector (`/api/system/status` and `/api/system/stats`) |

---

## 🛠️ 2. Detailed Breakdown of Changes

### A. Database Layer Migration (MySQL → PostgreSQL)
1. **Dependency Replacement (`pom.xml`)**:
   - Removed obsolete `com.mysql:mysql-connector-j`.
   - Added official PostgreSQL driver `org.postgresql:postgresql`.
   - Added `org.springframework.boot:spring-boot-starter-validation`.
2. **PostgreSQL Configuration (`application.properties`)**:
   - Connection URL updated: `jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:hotel_db}`.
   - Driver class updated: `org.postgresql.Driver`.
   - Hibernate dialect updated: `org.hibernate.dialect.PostgreSQLDialect`.
   - Added HikariCP connection pool parameters (`maximum-pool-size=10`, `idle-timeout=30000`, etc.).
3. **Database Scripts Created**:
   - [`database/schema.sql`](database/schema.sql): PostgreSQL-compliant DDL with `BIGSERIAL`, `CHECK` constraints, foreign keys, and indexes on frequently queried columns.
   - [`database/seed.sql`](database/seed.sql): Sample luxury suites, executive rooms, guest profiles, and reservations.
4. **Environment Template**:
   - Created [`.env.example`](.env.example) to guide credential configuration without hard-coding secrets in source code.

---

### B. User Interface & Glassmorphism Design System
1. **Glassmorphism Styling ([`src/main/resources/static/css/style.css`](src/main/resources/static/css/style.css))**:
   - Translucent frosted glass effect using `backdrop-filter: blur(20px) saturate(180%)`.
   - Ambient radial gradient background orbs with floating keyframe animations.
   - High-contrast, clean typography powered by Google Font **Plus Jakarta Sans**.
   - Custom status badges (*Available*, *Occupied*, *Room Categories*).
   - Glassmorphism modal dialogs with smooth scaling and fade transitions.
2. **Single Page Interface ([`src/main/resources/static/index.html`](src/main/resources/static/index.html))**:
   - **Executive Dashboard:** Live metrics for Total Rooms, Available Rooms, Occupancy Rate, Total Guests, and Revenue.
   - **Rooms Management:** Room inventory cards with filters for category and status, quick booking triggers, search, and edit/delete actions.
   - **Guest Directory:** Customer registry with search by name, email, or phone number.
   - **Bookings & Stays:** Reservation manager with real-time stay duration and total cost calculations.
   - **Invoice & Receipt Generator:** Modal providing a breakdown of nights, room rates, and printable hotel folio.
   - **PostgreSQL Database Inspector:** Diagnostic tab displaying live JDBC connection status, database product version, and pgAdmin 4 connection guide.
3. **Frontend Application Logic ([`src/main/resources/static/js/app.js`](src/main/resources/static/js/app.js))**:
   - Reactive API client communicating with backend endpoints.
   - Dynamic price calculation based on date pickers and chosen room rate.
   - Toast notifications for success, warning, and error alerts.

---

### C. Backend & Business Logic Improvements
1. **Input Validation**:
   - Added validation constraints to [`Room.java`](src/main/java/com/example/hotelmanagement/model/Room.java), [`Guest.java`](src/main/java/com/example/hotelmanagement/model/Guest.java), and [`Booking.java`](src/main/java/com/example/hotelmanagement/model/Booking.java).
   - Added `@Valid` to all controller POST and PUT methods.
2. **Exception Handling**:
   - Created [`GlobalExceptionHandler.java`](src/main/java/com/example/hotelmanagement/exception/GlobalExceptionHandler.java) to catch validation errors, resource not found exceptions, illegal arguments, and SQL errors, converting them to standardized JSON messages.
   - Created [`ResourceNotFoundException.java`](src/main/java/com/example/hotelmanagement/exception/ResourceNotFoundException.java).
3. **Service Logic Refinements**:
   - **`BookingService`:** Ensures `checkOutDate` is strictly after `checkInDate`; automatically computes `totalAmount` if omitted; excludes the current booking when updating to avoid false conflict detections.
   - **`RoomService`:** Prevents duplicate room numbers with clear validation feedback.
   - **`GuestService`:** Enforces unique email addresses across guest registrations.
4. **System Controller**:
   - Created [`SystemController.java`](src/main/java/com/example/hotelmanagement/controller/SystemController.java) to provide `/api/system/status` (JDBC metadata & health) and `/api/system/stats` (dashboard aggregated numbers).

---

## 📁 3. List of Files Modified / Created

### New Files Created:
- `database/schema.sql`
- `database/seed.sql`
- `.env.example`
- `src/main/java/com/example/hotelmanagement/exception/ResourceNotFoundException.java`
- `src/main/java/com/example/hotelmanagement/exception/GlobalExceptionHandler.java`
- `src/main/java/com/example/hotelmanagement/controller/SystemController.java`
- `src/main/resources/static/index.html`
- `src/main/resources/static/css/style.css`
- `src/main/resources/static/js/app.js`
- `README.md`
- `REVIVAL_CHANGELOG.md`

### Files Modified & Upgraded:
- `pom.xml` (Migrated dependencies to PostgreSQL & validation)
- `src/main/resources/application.properties` (PostgreSQL JDBC datasource & HikariCP pool)
- `src/main/java/com/example/hotelmanagement/model/Room.java` (Validation annotations)
- `src/main/java/com/example/hotelmanagement/model/Guest.java` (Validation annotations)
- `src/main/java/com/example/hotelmanagement/model/Booking.java` (Validation annotations & eager loading)
- `src/main/java/com/example/hotelmanagement/service/RoomService.java` (Duplicate checks & domain exceptions)
- `src/main/java/com/example/hotelmanagement/service/GuestService.java` (Email uniqueness & domain exceptions)
- `src/main/java/com/example/hotelmanagement/service/BookingService.java` (Date logic, conflict checking, price computation)
- `src/main/java/com/example/hotelmanagement/controller/RoomController.java` (Validation & HTTP status codes)
- `src/main/java/com/example/hotelmanagement/controller/GuestController.java` (Validation & HTTP status codes)
- `src/main/java/com/example/hotelmanagement/controller/BookingController.java` (Validation & HTTP status codes)

---

## ✅ 4. Verification & Testing

- **Compilation:** Verified with Maven (`mvn clean compile` and `mvn clean package`). Build completed with **0 errors**.
- **Packaging:** Standalone executable JAR `target/hotel-management-1.0.0.jar` successfully produced.
- **Null Safety Compliance:** Resolved all Eclipse JDT `@NonNull` parameter conversion warnings using `Objects.requireNonNull(...)` across `GuestService.java`, `RoomService.java`, and `BookingService.java`.
- **MySQL Cleanup:** Searched the entire codebase for `mysql`, `com.mysql`, `mysql-connector-j`, and `jdbc:mysql` — verified **0 lingering occurrences**.

---

## 🛠️ 5. PostgreSQL Troubleshooting & Credentials Guide

If you see `FATAL: password authentication failed for user "postgres"` during boot:
1. Provide your PostgreSQL password via environment variable:
   ```powershell
   $env:DB_PASSWORD="your_actual_postgres_password"
   & "C:\Users\Lenovo\.maven\maven-3.9.12\bin\mvn.cmd" spring-boot:run
   ```
2. Or pass it as a JVM parameter:
   ```powershell
   java -Dspring.datasource.password=your_actual_postgres_password -jar target/hotel-management-1.0.0.jar
   ```
3. Or update `src/main/resources/application.properties`:
   ```properties
   spring.datasource.password=your_actual_postgres_password
   ```

