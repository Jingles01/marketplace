import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Link, Route, Routes, Navigate, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

import HomePage from "./pages/HomePage.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import CreateListingPage from "./pages/CreateListingPage.jsx";
import ListingDetailsPage from "./pages/ListingDetailsPage.jsx";
import EditListingPage from "./pages/EditListingPage.jsx";
import MessagesPage from "./pages/MessagesPage.jsx";
import UserProfilePage from "./components/UserProfile.jsx";
import PublicProfilePage from "./pages/PublicProfilePage.jsx";

import "./index.css";
import Button from "./components/Button";
import authService from "./services/authService";


// eslint-disable-next-line react-refresh/only-export-components,react/prop-types
const ProtectedRoute = ({ children }) => {
    const isAuthenticated = authService.getCurrentUser();

    if (!isAuthenticated) {
        return <Navigate to="/signin" />;
    }

    return children;
};

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        authService.setupInterceptors();

        const checkAuth = () => {
            const token = authService.getCurrentUser();
            setIsLoggedIn(!!token);
        };

        window.addEventListener('storage', checkAuth);

        checkAuth();

        return () => {
            window.removeEventListener('storage', checkAuth);
        };
    }, []);

    const handleLogout = () => {
        authService.logout();
        setIsLoggedIn(false);
    };

    const getNavLinkClass = ({ isActive }) => {
        const baseClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150";
        if (isActive) {
            return `${baseClasses} text-indigo-600 font-semibold`;
        } else {
            return `${baseClasses} text-gray-600 hover:bg-gray-100 hover:text-gray-900`;
        }
    };


    return (
        <div>
            <header className="bg-white shadow-md sticky top-0 z-50">
                <nav
                    className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex-shrink-0">
                            <Link to="/"
                                  className="text-xl font-bold text-indigo-600 hover:text-indigo-800">
                                MarketPlace
                            </Link>
                        </div>

                        <div className="flex items-center">
                            <ul className="flex items-center space-x-4">
                                <li><NavLink to="/" className={getNavLinkClass} end>Home</NavLink></li>
                                {isLoggedIn ? (
                                    <>
                                        <li><NavLink to="/profile" className={getNavLinkClass}>Profile</NavLink></li>
                                        <li><NavLink to="/create-listing" className={getNavLinkClass}>Create
                                            Listing</NavLink></li>
                                        <li><NavLink to="/messages" className={getNavLinkClass}>Messages</NavLink></li>
                                        <li><Button onClick={handleLogout} variant="secondary" size="sm"
                                                    className="text-sm ml-2">Log Out</Button></li>
                                    </>
                                ) : (
                                    <>
                                        <li><NavLink to="/signin" className={getNavLinkClass}>Sign In</NavLink></li>
                                        <li><NavLink to="/signup" className={getNavLinkClass}>Sign Up</NavLink></li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                </nav>
            </header>

            <main className="container mx-auto px-4 py-8 mt-4">
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="/signin" element={<SignIn/>}/>
                    <Route path="/signup" element={<SignUp/>}/>
                    <Route path="/profile" element={<ProtectedRoute> <UserProfilePage/> </ProtectedRoute>}/>
                    <Route path="/create-listing" element={<ProtectedRoute> <CreateListingPage/> </ProtectedRoute>}/>
                    <Route path="/listings/:id" element={<ListingDetailsPage/>}/>
                    <Route path="/listings/:id/edit" element={<ProtectedRoute> <EditListingPage/> </ProtectedRoute>}/>
                    <Route path="/messages/*" element={<ProtectedRoute> <MessagesPage/> </ProtectedRoute>}/>
                    <Route path="/users/:userId" element={<PublicProfilePage />} />
                </Routes>
            </main>
        </div>
    );
};

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <App/>
        </BrowserRouter>
    </React.StrictMode>
);
