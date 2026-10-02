# AURA GRAND - Hotel Management System 🏨✨

A modernized, high-performance, and beautifully designed **Hotel Management System** powered by **Java 17+ / 25**, **Spring Boot 3**, **Java Database Connectivity (JDBC)**, and **PostgreSQL 18** (managed seamlessly with **pgAdmin 4**).

The application features a **Glassmorphism Desktop-Style UI** with smooth micro-animations, real-time live availability calculations, booking receipt invoice generation, and diagnostic PostgreSQL connection monitoring.

---

## 🌟 Technologies Used

| Technology | Purpose | Description |
| :--- | :--- | :--- |
| **Java (17 / 21 / 25)** | Core Language | Robust, strongly-typed backend logic. |
| **Spring Boot 3.1.6** | Application Framework | Production-ready HTTP REST API engine & static web server. |
| **PostgreSQL JDBC Driver** | Database Connectivity | Official `org.postgresql:postgresql` Type-4 JDBC Driver. |
| **PostgreSQL 18** | Relational Database | ACID-compliant, scalable enterprise database. |
| **pgAdmin 4** | Database Tool | Graphical administration platform for PostgreSQL. |
| **HikariCP** | Connection Pool | Ultra-fast, zero-overhead JDBC connection pool. |
| **Vanilla CSS3 Glassmorphism** | UI Design System | Translucent frosted glass, ambient radial glow, dynamic animations. |
| **Vanilla JavaScript (ES6+)** | Frontend Engine | Reactive UI state management, real-time totals, and live API binding. |

---

## 🔌 How JDBC Works in This Project

```
+-------------------------------------------------------------+
|                   AURA GRAND Web & Desktop UI               |
|            (Translucent Glass Cards & Animations)           |
+-------------------------------------------------------------+
                              |
                              | HTTP REST Requests (/api/...)
                              v
+-------------------------------------------------------------+
|                    Java Backend Layer                       |
|           Controllers -> Services -> Repositories           |
+-------------------------------------------------------------+
                              |
                              | Java Database Connectivity (JDBC)
                              v
+-------------------------------------------------------------+
|               PostgreSQL JDBC Driver (Type 4)               |
|            org.postgresql.Driver / HikariCP Pool            |
+-------------------------------------------------------------+
                              |
                              | TCP/IP (Port 5432)
                              v
+-------------------------------------------------------------+
|                 PostgreSQL Database Engine                  |
|                   (Database: hotel_db)                      |
|                                                             |
|           [rooms] <---- [bookings] ----> [guests]           |
+-------------------------------------------------------------+
                              ^
                              | Inspect / Manage / Query
+-------------------------------------------------------------+
|                          pgAdmin 4                          |
|             (PostgreSQL GUI Management Console)             |
+-------------------------------------------------------------+
```

1. **User Action:** You interact with the Glassmorphism UI (e.g. creating a reservation or modifying a room).
2. **REST API:** The UI invokes the Java Spring REST endpoints (`/api/rooms`, `/api/guests`, `/api/bookings`).
3. **JDBC Driver & Connection Pool:** The Java service layer executes SQL queries via the **PostgreSQL JDBC Driver** through **HikariCP connection pooling**.
4. **PostgreSQL Server:** PostgreSQL processes transactions safely with ACID guarantees and foreign key constraints.
5. **pgAdmin 4:** You can open pgAdmin 4 at any time to inspect tables, view rows, or run custom SQL scripts.

---

## 🗄️ Database Setup (pgAdmin 4 & PostgreSQL)

### Step 1: Open pgAdmin 4
1. Launch **pgAdmin 4** on your machine.
2. Enter your master password to connect to the PostgreSQL server on `localhost:5432`.

### Step 2: Create the `hotel_db` Database
1. Right-click on **Databases** > **Create** > **Database...**.
2. Set the Database name to: `hotel_db`
3. Click **Save**.

*(Alternatively, run `CREATE DATABASE hotel_db;` in the Query Tool).*

### Step 3: Run the Schema Script
1. In pgAdmin 4, expand `hotel_db` > right-click and select **Query Tool**.
2. Open the file [`database/schema.sql`](database/schema.sql) (or copy-paste its content).
3. Press **F5** (or click the ▶️ Execute button) to create the `rooms`, `guests`, and `bookings` tables with all constraints and indexes.

### Step 4: Run the Sample Data Seed Script (Optional)
1. In the Query Tool, open [`database/seed.sql`](database/seed.sql).
2. Press **F5** to populate initial luxury suites, executive rooms, guests, and reservations.

---

## ⚙️ Configuration & Environment Variables

Credentials are centralized and not hard-coded. You can configure them via environment variables or in `src/main/resources/application.properties`:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `DB_HOST` | `localhost` | PostgreSQL server host |
| `DB_PORT` | `5432` | PostgreSQL server port |
| `DB_NAME` | `hotel_db` | Database name |
| `DB_USER` | `postgres` | Database username |
| `DB_PASSWORD` | `postgres` | Your PostgreSQL password |
| `SERVER_PORT` | `8080` | Web application port |

A sample template is provided in [`.env.example`](.env.example).

---

## 🚀 How to Run the Application

### Option A: Using Maven (Recommended)
Open PowerShell or your terminal in the project directory:

```powershell
# Compile and run
mvn spring-boot:run
```

If you have Maven in a custom path (e.g., `C:\Users\Lenovo\.maven\maven-3.9.12\bin\mvn.cmd`):
```powershell
& "C:\Users\Lenovo\.maven\maven-3.9.12\bin\mvn.cmd" spring-boot:run
```

### Option B: Running the Packaged JAR
```powershell
java -jar target/hotel-management-1.0.0.jar
```

### Option C: Passing Custom Database Password at Launch
```powershell
java -Dspring.datasource.password=YOUR_POSTGRES_PASSWORD -jar target/hotel-management-1.0.0.jar
```

Once started, open your browser and navigate to:
👉 **`http://localhost:8080`**

---

## 📋 Features Overview

- **Executive Glassmorphism Dashboard:** Translucent frosted glass panels, ambient glow animations, and live metrics (Total Rooms, Occupancy Rate, Total Guests, Revenue).
- **Rooms Management:**
  - View room cards or tabular lists.
  - Filter by availability (*Available* vs *Booked*) and room categories (*Deluxe*, *Executive Suite*, *Penthouse*, etc.).
  - Search by room number.
  - Add, edit, and delete rooms with live validation.
- **Guest Directory:**
  - Complete customer profile directory.
  - Search by Name, Email, or Phone.
  - Validation ensuring unique email addresses.
- **Reservation & Booking Engine:**
  - Interactive reservation modal with real-time duration and price calculations (`nights * rate`).
  - Overlap and conflict prevention logic.
  - Date validation ensuring check-out is strictly after check-in.
  - Printable / downloadable **Hotel Invoice & Receipt** modal.
- **Live PostgreSQL Database Inspector:**
  - Real-time connection ping showing product name, PostgreSQL version, driver version, and JDBC URL.
  - Instant diagnostic status pill in the sidebar.

---

## 📁 Project Directory Structure

```
hotel-management/
├── database/
│   ├── schema.sql                 # PostgreSQL DDL schema with indexes & constraints
│   └── seed.sql                   # Realistic sample data (Rooms, Guests, Bookings)
├── src/
│   ├── main/
│   │   ├── java/com/example/hotelmanagement/
│   │   │   ├── App.java                      # Spring Boot main entrypoint
│   │   │   ├── controller/
│   │   │   │   ├── BookingController.java    # REST API for bookings
│   │   │   │   ├── GuestController.java      # REST API for guests
│   │   │   │   ├── RoomController.java       # REST API for rooms
│   │   │   │   └── SystemController.java     # Health & dashboard metrics API
│   │   │   ├── exception/
│   │   │   │   ├── GlobalExceptionHandler.java # Standardized JSON error handler
│   │   │   │   └── ResourceNotFoundException.java # Custom domain exception
│   │   │   ├── model/
│   │   │   │   ├── Booking.java              # Booking entity with bean validation
│   │   │   │   ├── Guest.java                # Guest entity with email validation
│   │   │   │   └── Room.java                 # Room entity with price/number validation
│   │   │   ├── repository/
│   │   │   │   ├── BookingRepository.java    # Spring Data JPA / JDBC repository
│   │   │   │   ├── GuestRepository.java      # Guest data repository
│   │   │   │   └── RoomRepository.java       # Room data repository
│   │   │   └── service/
│   │   │       ├── BookingService.java       # Booking logic, overlap & price computation
│   │   │       ├── GuestService.java         # Guest business logic & validations
│   │   │       └── RoomService.java          # Room inventory logic
│   │   └── resources/
│   │       ├── application.properties        # Centralized PostgreSQL JDBC configuration
│   │       └── static/                       # Glassmorphism UI
│   │           ├── css/
│   │           │   └── style.css             # Glassmorphism design system & animations
│   │           ├── js/
│   │           │   └── app.js                # Frontend reactive application logic
│   │           └── index.html                # Single Page App interface
├── .env.example                              # Environment configuration template
├── pom.xml                                   # Maven dependencies (PostgreSQL, Validation)
├── README.md                                 # Complete documentation
└── REVIVAL_CHANGELOG.md                      # Detailed before/after changelog
```

---

## 🛠️ Troubleshooting

### 1. `Connection to localhost:5432 refused`
- **Cause:** The PostgreSQL service is not started.
- **Solution:** In Windows, open Services (`services.msc`) and ensure `postgresql-x64-18` is running, or start it via Command Prompt:
  ```powershell
  Start-Service postgresql-x64-18
  ```

### 2. `FATAL: password authentication failed for user "postgres"`
- **Cause:** The password in `application.properties` does not match your PostgreSQL installation password.
- **Solution:** Pass the correct password when launching the app or set the environment variable:
  ```powershell
  $env:DB_PASSWORD="your_actual_password"
  mvn spring-boot:run
  ```

### 3. `FATAL: database "hotel_db" does not exist`
- **Cause:** The database has not yet been created in PostgreSQL.
- **Solution:** Open pgAdmin 4, create a new database named `hotel_db`, and execute `database/schema.sql`.

### 4. `Room is already booked for this date range`
- **Cause:** Overlap prevention detected that the requested room is occupied during one or more selected days.
- **Solution:** Choose a different room or adjust the check-in/check-out dates.
