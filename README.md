# Local Spots POI

## Project Overview
This web application allows users to manage and organize interesting locations (Points of Interest). The project was developed as part of the Full Stack Web Development assignment, focusing on a robust MVC architecture and secure authentication.

## Current Status: Level 3 – Frontend API Connection & Secure Passwords (`v3.0.0`)

## Features

### Level 1
- ✅ User authentication with cookie-based sessions
- ✅ Placemark CRUD (name, description, coordinates)
- ✅ JSON data storage (Lowdb)
- ✅ Core unit tests

### Level 2
- ✅ Admin dashboard (list/remove users)
- ✅ Categories for placemarks
- ✅ Image uploads via Cloudinary
- ✅ MongoDB with Mongoose
- ✅ OpenAPI/Swagger documentation
- ✅ Cloud deployment on Render
- ✅ Feature branches & tagged releases

### Level 3
- ✅ **Frontend API connection:** The backend now exposes RESTful endpoints for seamless integration with frontend clients.
- ✅ **Password hashing & salting:** User passwords are securely hashed and salted using bcrypt before storage, ensuring robust authentication security.
- ✅ **Release tagged as `v3.0.0`**

## Tech Stack
- **Backend:** Node.js, Hapi.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** @hapi/cookie, JWT, bcrypt
- **File Storage:** Cloudinary
- **Validation:** Joi
- **Testing:** Mocha, Chai
- **Documentation:** Hapi-Swagger

## Quick Start

### 1. Clone and install
```bash
git clone https://github.com/philipprsk/local-spots-poi.git
cd local-spots-poi
npm install
npm start 
