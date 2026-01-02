# Local Spots POI - Web Application (Level 1)

## Project Overview
This web application allows users to manage and organize interesting locations (Points of Interest). The project was developed as part of the Full Stack Web Development assignment, focusing on a robust MVC architecture and secure authentication.

### Status: Level 1 – Core API & Web App
- **Signup & Login:** Full user registration and authentication flow.
- **Cookie Authentication:** Secure session management using `@hapi/cookie`.
- **Placemark Features:** Users can create entries with Name, Description, and Geographic Coordinates (Latitude/Longitude).
- **Data Persistence:** File-based storage using JSON (Lowdb).
- **Deployment:** Optimized for Localhost environment.
- **DevOps:** Structured Git commit history and automated linting.

## Tech Stack
- **Backend:** Node.js with the Hapi.js framework.
- **Frontend:** Handlebars (HBS) templating engine with Bulma CSS framework.
- **Validation:** Joi Schemas for payload validation and data integrity.
- **Testing:** Mocha & Chai for Core Unit Tests.

## Installation & Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
3. Create a .env file in the root directory (refer to .env.example for required keys):
    COOKIE_NAME=your_cookie_name
    COOKIE_PASSWORD=your_32_character_password
4. Start the server: 
   npm run start
5. Access the application: http://localhost:3000
   Note: On the first launch, the application will use the initialized JSON structure. You can start by registering a new user.
6. API & Testing
This project includes automated unit tests to ensure the integrity of the models and stores. To run the test suite:
    Bash
    npm test

