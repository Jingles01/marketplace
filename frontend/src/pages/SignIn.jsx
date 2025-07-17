import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../services/authService";
import Button from "../components/Button";

function SignIn() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await authService.login(email, password);
            window.dispatchEvent(new Event("storage"));
            navigate('/');
        } catch (error) {
            setError(error.response?.data?.message || "Failed to login. Please check your credentials.");
        }
    };

    const inputStyles = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
    const labelStyles = "block text-sm font-medium text-gray-700";

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="text-center text-3xl font-bold text-gray-900">
                    Login to your account
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="email" className={labelStyles}>
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={inputStyles}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className={labelStyles}>
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={inputStyles}
                                />
                            </div>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full"
                            >
                                Sign In
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    New user?
                                </span>
                            </div>
                        </div>
                        <div className="mt-6 text-center">
                            <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Create an account
                            </Link>
                        </div>
                    </div>
                    <div className="mt-8 p-4 rounded border border-gray-200 bg-gray-50 text-sm text-gray-600">
                        <p className="font-semibold text-gray-700 mb-1">Test User Credentials:</p>
                        <p>Email: test@example.com</p>
                        <p>Password: Password123!</p>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default SignIn;