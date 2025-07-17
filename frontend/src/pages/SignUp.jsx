import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../services/authService";
import Button from "../components/Button";

function SignUp() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [validation, setValidation] = useState({
        username: { valid: false, message: "" },
        email: { valid: false, message: "" },
        password: { valid: false, message: "" },
        confirmPassword: { valid: false, message: "" },
        formValid: false
    });

    const [touched, setTouched] = useState({
        username: false,
        email: false,
        password: false,
        confirmPassword: false
    });

    const [error, setError] = useState("");

    const validateUsername = (username) => {
        if (username.length < 4) {
            return { valid: false, message: "Username must be at least 4 characters" };
        }
        if (username.length > 20) {
            return { valid: false, message: "Username must be at most 20 characters" };
        }
        return { valid: true, message: "Username is valid" };
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { valid: false, message: "Please enter a valid email address" };
        }
        return { valid: true, message: "Email is valid" };
    };

    const validatePassword = (password) => {
        if (password.length < 8) {
            return { valid: false, message: "Password must be at least 8 characters" };
        }
        if (!/[A-Z]/.test(password)) {
            return { valid: false, message: "Password must contain at least one uppercase letter" };
        }
        if (!/[0-9]/.test(password)) {
            return { valid: false, message: "Password must contain at least one number" };
        }
        if (!/[!@#$%^&*]/.test(password)) {
            return { valid: false, message: "Password must contain at least one special character" };
        }
        return { valid: true, message: "Password is strong" };
    };

    const validateConfirmPassword = (confirmPassword, password) => {
        if (confirmPassword !== password) {
            return { valid: false, message: "Passwords do not match" };
        }
        return { valid: true, message: "Passwords match" };
    };

    useEffect(() => {
        const usernameValidation = validateUsername(formData.username);
        const emailValidation = validateEmail(formData.email);
        const passwordValidation = validatePassword(formData.password);
        const confirmPasswordValidation = validateConfirmPassword(formData.confirmPassword, formData.password);

        setValidation({
            username: usernameValidation,
            email: emailValidation,
            password: passwordValidation,
            confirmPassword: confirmPasswordValidation,
            formValid: usernameValidation.valid && emailValidation.valid &&
                passwordValidation.valid && confirmPasswordValidation.valid
        });
    }, [formData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched({ ...touched, [name]: true });
    };

    const handleSignup = async (e) => {
        e.preventDefault();


        setTouched({
            username: true,
            email: true,
            password: true,
            confirmPassword: true
        });

        if (!validation.formValid) {
            return;
        }

        setError("");

        try {
            await authService.signup(formData.username, formData.email, formData.password);
            alert("Account created successfully! Please log in.");
            navigate('/signin');
        } catch (error) {
            setError(error.response?.data?.error || "Failed to create account");
        }
    };

    const labelStyles = "block text-sm font-medium text-gray-700";

    const getInputClasses = (fieldName) => {
        const baseStyles = "mt-1 block w-full px-3 py-2 border rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

        if (!touched[fieldName]) {
            return `${baseStyles} bg-white border-gray-300`;
        }

        return validation[fieldName].valid
            ? `${baseStyles} bg-green-50 border-green-500 text-green-900 placeholder-green-700`
            : `${baseStyles} bg-red-50 border-red-500 text-red-900 placeholder-red-700`;
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="text-center text-3xl font-bold text-gray-900">
                    Create an account
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSignup}>
                        <div>
                            <label htmlFor="username" className={labelStyles}>
                                Username
                            </label>
                            <div className="mt-1">
                                <input
                                    id="username" name="username" type="text" required
                                    className={getInputClasses("username")}
                                    value={formData.username} onChange={handleChange} onBlur={handleBlur}
                                />
                                {touched.username && (
                                    <p className={`mt-1 text-sm ${validation.username.valid ? "text-green-600" : "text-red-600"}`}>
                                        {validation.username.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className={labelStyles}>
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email" name="email" type="email" autoComplete="email" required
                                    className={getInputClasses("email")}
                                    value={formData.email} onChange={handleChange} onBlur={handleBlur}
                                />
                                {touched.email && (
                                    <p className={`mt-1 text-sm ${validation.email.valid ? "text-green-600" : "text-red-600"}`}>
                                        {validation.email.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className={labelStyles}>
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password" name="password" type="password" autoComplete="new-password" required
                                    className={getInputClasses("password")}
                                    value={formData.password} onChange={handleChange} onBlur={handleBlur}
                                />
                                {touched.password && (
                                    <p className={`mt-1 text-sm ${validation.password.valid ? "text-green-600" : "text-red-600"}`}>
                                        {validation.password.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className={labelStyles}>
                                Confirm Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required
                                    className={getInputClasses("confirmPassword")}
                                    value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur}
                                />
                                {touched.confirmPassword && (
                                    <p className={`mt-1 text-sm ${validation.confirmPassword.valid ? "text-green-600" : "text-red-600"}`}>
                                        {validation.confirmPassword.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full"
                                disabled={!validation.formValid}
                            >
                                Sign Up
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
                                    Already have an account?
                                </span>
                            </div>
                        </div>
                        <div className="mt-6 text-center">
                            <Link to="/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;