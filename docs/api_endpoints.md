# API Specification Reference

Below is the API reference documentation detailing server-side route definitions, request methods, and expected payload schemas.

---

## Authentication Endpoints

### `POST /api/auth/register`
*   **Description**: Registers a new customer user and pre-allocates an empty shopping cart.
*   **Request Body**:
    ```json
    {
      "name": "Jane Doe",
      "email": "jane@domain.com",
      "password": "securepassword"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "message": "User registered successfully",
      "user": { "id": "uuid-string", "name": "Jane Doe", "email": "jane@domain.com", "role": "USER" }
    }
    ```

### `POST /api/auth/login`
*   **Description**: Verifies hashed passwords and stores a signed JWT session cookie in the client.
*   **Request Body**:
    ```json
    {
      "email": "jane@domain.com",
      "password": "securepassword"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "message": "Login successful",
      "user": { "id": "uuid", "name": "Jane", "email": "jane@domain.com", "role": "USER" }
    }
    ```

### `GET /api/auth/me`
*   **Description**: Extracts the active JWT cookie, cryptographically verifies its bounds, and queries the latest loyalty points.
*   **Response (200 OK)**:
    ```json
    {
      "user": { "id": "uuid", "email": "jane@domain.com", "loyaltyCoins": 150, "badges": ["VIP Buyer"] }
    }
    ```

---

## Cart & Checkout Endpoints

### `GET /api/cart`
*   **Description**: Fetches the authenticated shopper's shopping bag list.
*   **Response (200 OK)**:
    ```json
    {
      "items": [
        {
          "id": "item-uuid",
          "productId": "prod-uuid",
          "quantity": 1,
          "size": "M",
          "color": "Black",
          "product": { "name": "Cashmere Turtleneck", "price": 280 }
        }
      ]
    }
    ```

### `POST /api/orders`
*   **Description**: Submits active cart items, calculates coordinates bundle discounts, applies coupon codes, and records gifting messages.
*   **Request Body**:
    ```json
    {
      "address": "123 luxury street",
      "couponCode": "WINTER15",
      "isGift": true,
      "giftRecipient": "Alexander",
      "giftMessage": "Compliments of the season!"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "order": { "id": "order-uuid", "total": 238, "status": "PENDING" }
    }
    ```

---

## AI Services Endpoints

### `POST /api/ai/stylist`
*   **Description**: Compiles Gemini fashion suggestion prompts based on closet coordinates.
*   **Request Body**:
    ```json
    {
      "prompt": "Coordinate suggestions for linen jackets in winter seasons"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "narrative": "A cream-wool coat paired with heavy flannel trousers forms a stunning silhouette..."
    }
    ```
