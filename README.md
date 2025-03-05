# Real-Time Group Chat Frontend

## Overview
This is a real-time group chat application built using Next.js, React, and Socket.IO. The frontend provides a responsive and interactive chat experience with features like user joining, messaging, and online user tracking.

## Features
- Real-time messaging
- User authentication with unique user IDs
- Responsive design (mobile and desktop)
- Online users list
- Persistent user sessions
- Smooth message scrolling

## Prerequisites
- Node.js (v16 or later)
- npm or Yarn

## Technologies Used
- Next.js
- React
- Tailwind CSS
- Socket.IO Client
- UUID
- Vercel (recommended for deployment)

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Imranf620/algotix-task-frontend
cd algotix-task-frontend
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration
Create a `.env` file in the project root with the following variable:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

### 4. Running the Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Vercel Deployment Steps
1. Connect your GitHub repository
2. Configure project settings
3. Add environment variables
4. Deploy

## Project Structure
```
├── components/         # Reusable components
├── pages/              # Next.js pages
├── public/             # Static assets
├── services/           # Service configurations (socket)
├── styles/             # Global styles
└── README.md           # Project documentation
```

## Environment Variables
- `NEXT_PUBLIC_BACKEND_URL`: http://localhost:4000

## Socket Events
- `join`: User joins the chat
- `message`: Send/receive messages
- `userJoined`: New user notification
- `userLeft`: User disconnection notification
- `onlineUsers`: List of current online users

## Responsive Design
- Mobile-first approach
- Tailwind CSS for responsive utilities
- Adaptive sidebar and input layouts

## Performance Optimization
- Lazy loading
- Minimal re-renders
- Efficient state management

## Error Handling
- Graceful error messages
- Console error logging
- User-friendly alerts

## Security Considerations
- Unique user IDs
- Local storage for session persistence
- No sensitive data transmission

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request


## Contact
Imran Farooq
imranf620@gmail.com