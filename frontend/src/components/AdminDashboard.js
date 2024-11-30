import React from "react";
import "./styles.css";

const AdminDashboard = () => {
    return (
        <div>
            <header>
                <div className="logo">Store Management System</div>
                <nav>
                    <a href="/">Home</a>
                </nav>
            </header>

            <div className="sidebar">
                <ul>
                    <li><a href="/admin">Admin Dashboard</a></li>
                    <li><a href="#">Manage Cashiers</a></li>
                    <li><a href="#">View Customer History</a></li>
                </ul>
            </div>

            <main>
                <section id="admin-dashboard">
                    <h1>Admin Dashboard</h1>

                    <div className="dashboard-card">
                        <h2>Customer History</h2>
                        <p>View all customers who have ever visited the store.</p>
                        <button className="role-button admin">View Customers</button>
                    </div>

                    <div className="dashboard-card">
                        <h2>Current Cashiers</h2>
                        <p>View all the cashiers currently working in the store.</p>
                        <button className="role-button admin">View Cashiers</button>
                    </div>

                    <div className="dashboard-card">
                        <h2>Manage Cashiers</h2>
                        <p>Add or remove cashiers from the system.</p>
                        <button className="role-button admin">Manage Cashiers</button>
                    </div>
                </section>
            </main>

            <footer>
                &copy; 2024 Store Management System. All Rights Reserved.
            </footer>
        </div>
    );
};

export default AdminDashboard;
