develitehub/
├── .env.example              # Environment variable template
├── .gitignore
├── docker-compose.yml        # Full-stack orchestration
├── README.md
├── scripts/
│   └── init.sql              # MySQL init script
│
├── backend/                  # Spring Boot API
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/develitehub/
│       │   ├── DevEliteHubApplication.java
│       │   ├── config/
│       │   │   ├── AppConfig.java         # CORS, beans
│       │   │   └── SecurityConfig.java    # JWT, RBAC (Phase 2)
│       │   ├── controller/                # REST controllers (per phase)
│       │   ├── service/                   # Business logic (per phase)
│       │   ├── repository/                # Spring Data JPA repos
│       │   ├── entity/
│       │   │   └── BaseEntity.java        # Auditing base class
│       │   ├── dto/
│       │   │   └── response/
│       │   │       └── ApiResponse.java   # Generic response wrapper
│       │   ├── exception/
│       │   │   ├── GlobalExceptionHandler.java
│       │   │   ├── ResourceNotFoundException.java
│       │   │   ├── ConflictException.java
│       │   │   ├── BadRequestException.java
│       │   │   ├── ForbiddenException.java
│       │   │   └── PaymentException.java
│       │   └── security/                  # JWT filter etc. (Phase 2)
│       └── resources/
│           └── application.yml            # All config with profiles
│
└── frontend/                 # React + Vite
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css          # Global design system
        ├── assets/
        ├── components/        # Reusable UI components
        ├── pages/             # Route-level pages
        ├── context/           # React Context (Auth, etc.)
        ├── services/          # Axios API calls
        └── hooks/             # Custom React hooks
