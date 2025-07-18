# Marketplace: A Community E-commerce Platform

A full-stack web application that connects local buyers and sellers, providing a user-friendly platform for community-based commerce.

**Link to project:**
[Launch backend](https://marketplace-backend-7510.onrender.com)
[MarketPlace](https://marketplace-frontend-09i8.onrender.com)

## How It's Made:

**Tech used:** React, Node.js, Express, MongoDB, JWT, Cloudinary, Google Maps API, Tailwind CSS, Vite

This application was built using the MERN stack, following a modern architecture with a separate frontend and backend. The backend is a RESTful API built with **Node.js** and **Express**, responsible for handling all business logic, including user authentication with **JSON Web Tokens (JWT)** and data persistence with **MongoDB**. Location-based searches are powered by the **Google Maps API**. The frontend is a dynamic single-page application built with **React** and styled with **Tailwind CSS**, providing a fast and responsive user experience. Images are uploaded and managed through the **Cloudinary** API. The entire project is deployed on Render, with the frontend as a Static Site and the backend as a Web Service.

## Key Features

* **Full User Authentication:** Secure user registration and login system using JWT.
* **Listing Management:** Users can create, manage and upload images for their listings.
* **Advanced Search:** Robust search functionality with keyword and geolocation-based filtering.
* **Integrated Messaging:** A built-in system for buyers and sellers to communicate and negotiate directly.
* **Trust & Reputation:** A review and rating system to build user confidence in the community.
* **Wish List:** Allows users to save items they are interested in for later.

## Lessons Learned:

* **Full-Stack Deployment:** The biggest lesson was the end-to-end process of deploying a full-stack application with a separate frontend and backend. This involved managing two distinct services on Render and ensuring they could communicate with each other.
* **Environment Variables and CORS:** Troubleshooting the connection between the live frontend and backend was a critical experience. It solidified my understanding of how to use environment variables to handle different URLs for development vs. production and the importance of correctly configuring CORS on the server.
* **API Design:** Structuring the backend as a clean, RESTful API made the frontend development process much more organized. Defining clear endpoints for each resource (users, listings, messages) was essential for building a maintainable application.
* **Asynchronous Operations:** Handling asynchronous operations, from fetching data from the MongoDB database to uploading images to Cloudinary, was a core part of the development process and reinforced best practices for working with Promises and async/await in JavaScript.
