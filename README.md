# Local Spots POI

## Project Overview
This web application allows users to manage and organize interesting locations (Points of Interest). The project was developed as part of the Full Stack Web Development assignment, focusing on a robust MVC architecture and secure authentication.

## Current Status: Level 2 – Enhanced API & Cloud Deployment

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

## Tech Stack
- **Backend:** Node.js, Hapi.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** @hapi/cookie
- **File Storage:** Cloudinary
- **Validation:** Joi
- **Testing:** Mocha, Chai
- **Documentation:** Hapi-Swagger

## Quick Start

### 1. Clone and install:
```bash
git clone https://github.com/philipprsk/local-spots-poi-backend.git
cd local-spots-poi-backend
npm install
```

### 2. Configure .env:
```env
PORT=3000
COOKIE_NAME=local-spots-session
COOKIE_PASSWORD=your_secure_32_character_password
MONGODB_URI=mongodb://localhost:27017/local-spots
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Start server:
```bash
npm start
```

### 4. Access:
- API: `http://localhost:3000`
- Swagger Docs: `http://localhost:3000/documentation`

## Main API Endpoints

### Authentication
- `POST /api/users/authenticate` - Login
- `POST /api/users/create` - Register
- `GET /api/users/logout` - Logout

### Placemarks
- `GET /api/placemarks` - List all
- `POST /api/placemarks` - Create
- `PUT /api/placemarks/{id}` - Update
- `DELETE /api/placemarks/{id}` - Delete
- `POST /api/placemarks/{id}/images` - Upload images

### Admin
- `GET /api/users` - List all users
- `DELETE /api/users/{id}` - Remove user

## Testing
```bash
npm test
```

## Deployment
Deployed on **Render** with **MongoDB Atlas**. Configure environment variables in Render dashboard.

## Git Workflow
- `main` - Production
- `develop` - Integration
- `feature/*` - New features

### Releases
- `v1.0.0` - Level 1: Core API
- `v2.0.0` - Level 2: Categories & Cloud
- `v3.0.0` - Level 3: Password hashing (upcoming)

## Next Steps (Level 3)
- Password hashing with bcrypt
- SvelteKit frontend
- Interactive maps with layers
- Chart visualizations

## License
Academic project - Full Stack Web Development course
