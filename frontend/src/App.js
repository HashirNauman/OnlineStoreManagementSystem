import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import axios from "axios";
import "./App.css";

// Import dashboard components
import AdminDashboard from "./dashboards/AdminDashboard.tsx";
import CashierDashboard from "./dashboards/CashierDashboard.tsx";
import CustomerDashboard from "./dashboards/CustomerDashboard.tsx";
// Import admin-specific components
import ManageCashier from "./dashboards/Admin-Components/ManageCashier";
import Feedback from "./dashboards/Admin-Components/Feedback";
import CustomerHistory from "./dashboards/Admin-Components/CustomerHistory";
import Inventory from "./dashboards/Admin-Components/Inventory";
import Notify_User from "./dashboards/Admin-Components/Notify_User.tsx";

import Explore from "./dashboards/Customer-Components/Explore.tsx";
import MyOrdersAndWishlist from "./dashboards/Customer-Components/MyOrdersAndWishlist.tsx";
import Notifications from "./dashboards/Customer-Components/Notifications.tsx";
import Send_Feedback from "./dashboards/Customer-Components/Send_Feedback.tsx";

import { UserRoundPlus } from "lucide-react";
function App() {
    const [view, setView] = useState("login");
    const [selectedRole, setSelectedRole] = useState(null);

    // Toggle between login, signup, and password reset views
    const toggleView = (newView) => {
        setView(newView);
        setSelectedRole(null);
    };

    // Handle role selection
    const handleRoleSelect = (role) => {
        setSelectedRole(role);
    };

    // Get CSRF token from cookies
    const getCSRFToken = () => {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith("csrftoken=")) {
                return cookie.split("=")[1];
            }
        }
        return null;
    };

    // Handle login functionality
    const handleLogin = async () => {
        const emailInput = document.querySelector('input[type="email"]').value;
        const passwordInput = document.querySelector('input[type="password"]').value;

        if (!emailInput || !passwordInput) {
            alert("Please enter both email and password.");
            return;
        }

        if (!selectedRole) {
            alert("Please select a role.");
            return;
        }

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/login/`,
                {
                    email: emailInput,
                    password: passwordInput,
                    role: selectedRole,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            );
            alert(response.data.message || "Login successful!");

            // Redirect based on role
            if (selectedRole === "Admin") {
                window.location.href = "/admin";
            } else if (selectedRole === "Cashier") {
                window.location.href = "/cashier";
            } else if (selectedRole === "Customer") {
                window.location.href = "/customer";
            }
        } catch (error) {
            alert(error.response?.data?.message || "An error occurred. Please try again.");
        }
    };

    // Handle signup functionality
    const handleSignup = async () => {
        const nameInput = document.querySelector('input[name="name"]').value;
        const emailInput = document.querySelector('input[type="email"]').value;
        const passwordInput = document.querySelector('input[type="password"]').value;
        const confirmPasswordInput = document.querySelectorAll('input[type="password"]')[1].value;

        if (passwordInput !== confirmPasswordInput) {
            alert("Passwords do not match.");
            return;
        }

        if (!nameInput || !emailInput || !passwordInput) {
            alert("Please enter all fields: name, email, and password.");
            return;
        }

        if (!selectedRole) {
            alert("Please select a role.");
            return;
        }

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/signup/`,
                {
                    name: nameInput,
                    email: emailInput,
                    password: passwordInput,
                    role: selectedRole,
                }
            );
            alert(response.data.message || "Signup successful!");
        } catch (error) {
            alert(error.response?.data?.message || "An error occurred. Please try again.");
        }
    };

    // Handle password reset functionality
    const handlePasswordReset = async () => {
        const emailInput = document.querySelector('input[type="email"]').value;

        if (!emailInput) {
            alert("Please enter your email address.");
            return;
        }

        try {
            const csrfToken = getCSRFToken();
            const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/reset_password/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrfToken, // Include CSRF token
                    },
                    credentials: "include", // Include cookies in the request
                    body: JSON.stringify({ email: emailInput }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                alert(data.message || "Password reset instructions sent to your email.");
            } else {
                const errorData = await response.json();
                alert(errorData.message || "An error occurred. Please try again.");
            }
        } catch (error) {
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <Router>
            <div className="container">
                <ConditionalForm
                    view={view}
                    toggleView={toggleView}
                    selectedRole={selectedRole}
                    handleRoleSelect={handleRoleSelect}
                    handleLogin={handleLogin}
                    handleSignup={handleSignup}
                    handlePasswordReset={handlePasswordReset}
                />
            </div>

            {/* Role-based routes */}
            <Routes>
                
                <Route path="/admin/manage-cashier" element={<ManageCashier />} />
                <Route path="/admin/feedback" element={<Feedback />} />
                <Route path="/admin/customer-history" element={<CustomerHistory />} />
                <Route path="/admin/inventory" element={<Inventory />} />                
                <Route path="/customer/explore" element={<Explore />} />
                <Route path="/customer/orders-wishlist" element={<MyOrdersAndWishlist />} />
                <Route path="/customer/send-feedback" element={<Send_Feedback />} />
                <Route path="/customer/notifications" element={<Notifications />} />

                <Route path="/cashier/inventory" element={<Inventory />} />
                <Route path="/cashier/notify-user" element={<Notifications />} />

                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/cashier" element={<CashierDashboard />} />
                <Route path="/customer" element={<CustomerDashboard />} />
            </Routes>
        </Router>
    );
}

function ConditionalForm({
    view,
    toggleView,
    selectedRole,
    handleRoleSelect,
    handleLogin,
    handleSignup,
    handlePasswordReset,
}) {
    const location = useLocation();

    if (location.pathname !== "/") {
        return null;
    }

    if (view === "login") {
        return (
            <div className="form-box">
                <h2>Login</h2>
                <div className="role-selection">
                    <button
                        className={`role-button ${selectedRole === "Cashier" ? "selected" : ""}`}
                        onClick={() => handleRoleSelect("Cashier")}
                    >
                        Cashier
                    </button>
                    <button
                        className={`role-button ${selectedRole === "Admin" ? "selected" : ""}`}
                        onClick={() => handleRoleSelect("Admin")}
                    >
                        Admin
                    </button>
                    <button
                        className={`role-button ${selectedRole === "Customer" ? "selected" : ""}`}
                        onClick={() => handleRoleSelect("Customer")}
                    >
                        Customer
                    </button>
                </div>
                <input type="email" className="input" placeholder="Enter your email" />
                <input type="password" className="input" placeholder="Enter your password" />
                <button className="button" onClick={handleLogin}>
                    Login
                </button>
                <div className="toggle-link" onClick={() => toggleView("signup")}>
                    Not registered? Sign up...
                </div>
                <div className="toggle-link" onClick={() => toggleView("resetPassword")}>
                    Forgot Password?
                </div>
            </div>
        );
    } else if (view === "signup") {
        return (
            <div className="form-box">
                <h2>Sign Up</h2>
                <div className="role-selection">
                    <button
                        className={`role-button ${selectedRole === "Cashier" ? "selected" : ""}`}
                        onClick={() => handleRoleSelect("Cashier")}
                    >
                        Cashier
                    </button>
                    <button
                        className={`role-button ${selectedRole === "Admin" ? "selected" : ""}`}
                        onClick={() => handleRoleSelect("Admin")}
                    >
                        Admin
                    </button>
                    <button
                        className={`role-button ${selectedRole === "Customer" ? "selected" : ""}`}
                        onClick={() => handleRoleSelect("Customer")}
                    >
                        Customer
                    </button>
                </div>
                <input name="name" type="text" className="input" placeholder="Enter your name" />
                <input type="email" className="input" placeholder="Enter your email" />
                <input type="password" className="input" placeholder="Create a password" />
                <input type="password" className="input" placeholder="Confirm your password" />
                <button className="button" onClick={handleSignup}>
                    Sign Up
                </button>
                <div className="toggle-link" onClick={() => toggleView("login")}>
                    Already registered? Login...
                </div>
            </div>
        );
    } else if (view === "resetPassword") {
        return (
            <div className="form-box">
                <h2>Reset Password</h2>
                <input type="email" className="input" placeholder="Enter your email" />
                <button className="button" onClick={handlePasswordReset}>
                    Reset Password
                </button>
                <div className="toggle-link" onClick={() => toggleView("login")}>
                    Back to Login
                </div>
            </div>
        );
    }
}

export default App;
