# System Architecture Specification

Below is the production monorepo deployment architecture designed for the Veloura AI fashion platform.

```mermaid
graph TD
    subgraph Clients ["Client Applications"]
        Web["Customer Web App (Next.js 15)"]
        Admin["Admin Console (Recharts dashboard)"]
    end

    subgraph CDN ["Content Delivery & Edge Router"]
        CF["Cloudflare / Nginx Reverse Proxy"]
        MW["Next.js Edge Middleware (JWT decoders)"]
    end

    subgraph API_GW ["Application API Gateway"]
        AuthGW["/api/auth/ (BCrypt + JWT signatures)"]
        OrderGW["/api/orders/ (Atomic checkout operations)"]
        AIGW["/api/ai/ (Gemini prompt compilers)"]
        CartGW["/api/cart/ (Cart item state synchronizers)"]
    end

    subgraph Databases ["Persistent Storage Layer"]
        PG["PostgreSQL Server (RDS instances)"]
        Redis["Redis (Cart items + session caches)"]
    end

    subgraph External ["External Services Services"]
        Stripe["Stripe Gateway (Tokenized checkout sessions)"]
        Gemini["Google Gemini AI API (Stylist prompt models)"]
    end

    Web --> CF
    Admin --> CF
    CF --> MW
    MW --> AuthGW
    MW --> OrderGW
    MW --> AIGW
    MW --> CartGW

    AuthGW --> PG
    OrderGW --> PG
    CartGW --> PG
    CartGW --> Redis

    OrderGW --> Stripe
    AIGW --> Gemini
```

### Components Curation
1. **Next.js 15 Edge Middleware**: Intercepts requests to `/checkout`, `/orders`, and `/admin`. Parsers decode base64 payloads to run route protections.
2. **Prisma Client ORM**: Encapsulates PostgreSQL database connections inside a connection pool. Enforces strict schema normalization.
3. **Stripe Payments integration**: Initializes Stripe session IDs. Webhook listener parses checkout notifications to flag invoice fulfillment status.
