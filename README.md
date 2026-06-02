# AniVerse

AniVerse is a modern, full-stack web application for anime discovery, reviews, and community engagement. It features user authentication, profile management, anime search, detailed anime pages, persistent reviews, and a vibrant community section.

## Features

- 🔍 **Anime Search**: Find anime by title, type, and status with a beautiful, responsive UI.
- 📝 **Reviews**: Leave reviews and ratings for each anime. Reviews are persistent and user-friendly.
- 👤 **User Profiles**: Register, log in, edit your profile, and set a custom avatar.
- 🖼️ **Avatar Picker**: Choose from a variety of avatars during signup.
- 🏠 **Home & Trending**: See trending anime with a hero slideshow.
- 👥 **Community Page**: Connect with other anime fans and explore community features.
- 📬 **Contact Us**: Send feedback or bug reports, with social links.
- 🔒 **Protected Routes**: Only authenticated users can access main features.
- 🌗 **Modern UI**: Responsive, mobile-friendly, and visually appealing design.

## Technologies Used

- **Frontend**: React (with TypeScript), Tailwind CSS, React Router, React Query
- **Backend**: Node.js, Express, MongoDB (API endpoints assumed at `/api/...`)
- **Authentication**: JWT-based, with protected routes
- **State Management**: React Context API
- **Other**: Axios, Lucide Icons, Radix UI (for avatars)

## Getting Started

## Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB (for backend)

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/aniverse.git
   cd aniverse
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Start the backend:**
   ```bash
   cd backend
   npm install
   npm start
   ```
4. **Start the frontend:**
   ```bash
   cd ../
   npm run dev
   # or
   yarn dev
   ```
5. **Open in your browser:**
   Visit [http://localhost:5173](http://localhost:5173)

### Environment Variables
- Configure your backend `.env` for MongoDB URI, JWT secret, etc.
- The frontend expects the backend at `https://animenew.onrender.com` by default.

## Folder Structure
```
Anime Project/
  backend/           # Express backend (API, models, controllers)
  public/            # Static assets (avatars, backgrounds)
  src/               # React frontend (pages, components, context)
  ...
```

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)

---

**AniVerse** — Discover, review, and connect with the anime community!

