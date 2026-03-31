# Convenience Store System

A full-stack web application for managing convenience store operations, including inventory management, point-of-sale (POS) functionality, and customer transactions.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development](#development)
- [Features](#features)
- [Contributing](#contributing)

## Overview

This project is a comprehensive convenience store management system built with modern web technologies. It provides an intuitive interface for store operations, from inventory tracking to customer checkout processes.

**Repository**: [kyoya156/Convenience_store_system](https://github.com/kyoya156/Convenience_store_system)

## Tech Stack

### Frontend
- **Framework**: Vue 3
- **Build Tool**: Vite
- **Language**: JavaScript/TypeScript

### Backend
- Location: `/backend` (Framework and technology TBD - to be configured)

### Development
- **Node.js**: v20.19.0 or later
- **Package Manager**: npm/yarn
- **Tool Manager**: [mise](https://mise.jq.rs/) (optional but recommended)

## Project Structure
. ├── frontend/ # Vue 3 + Vite frontend application 
├── backend/ # Backend API server 
├── .mise.toml # Mise configuration for development environment 
├── .gitignore # Git ignore rules └── README.md # This file


### Frontend Structure
The frontend is a Vue 3 application using the Script Setup composition API. It's built with Vite for fast development and optimized production builds.

### Backend Structure
The backend API server handles business logic and data persistence.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v20.19.0 or later
- **npm** or **yarn**: Package manager for dependencies

### Optional
- **mise**: Tool for managing development dependencies and environment variables
  - Install from: https://mise.jq.rs/

## Getting Started

### Quick Setup with mise

If you have [mise](https://mise.jq.rs/) installed, the quickest way to set up your environment is:

```bash
# Navigate to the project directory
cd Convenience_store_system

# Install dependencies and set up environment
mise install
```
Manual Setup
If you prefer not to use mise:
# Ensure you're using Node.js v20.19.0 or later
```bash
node --version

# Install dependencies
npm install
# or
yarn install

# Navigate to frontend and install its dependencies
cd frontend
npm install
cd ..

# Navigate to backend and install its dependencies (if applicable)
cd backend
npm install
cd ..
```
Frontend Development
```bash
cd frontend

# Start the Vite development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
The frontend will be available at http://localhost:5173 (default Vite port).

Backend Development
```bash
cd backend

# Start the backend server
npm run dev
```
See the backend README for specific setup instructions.

IDE Support
VS Code: Recommended with Vue 3 extensions
Install: Volar (Vue Language Features)
Install: TypeScript Vue Plugin (Volar)
For more information, see the Vue Docs Scaling up Guide

Features
Inventory Management: Track products and stock levels
Point of Sale (POS): Customer checkout and transactions
User Interface: Intuitive Vue 3-based UI with modern UX
API Integration: RESTful backend API
Responsive Design: Works on desktop and tablet devices

Contributing
Contributions are welcome! Please follow these steps:

Fork the repository
Create a feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request

Support
For issues, questions, or suggestions, please open an issue on GitHub.
