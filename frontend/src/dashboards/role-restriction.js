// role-restriction.js
document.addEventListener('DOMContentLoaded', function () {
    const userRole = localStorage.getItem('userRole');
    const currentPage = window.location.pathname.split('/').pop();

    // Restrict access based on the role
    if (currentPage === 'admin.html' && userRole !== 'admin') {
        alert('Access denied: Admins only');
        window.location.href = 'index.html'; // Redirect to login
    } else if (currentPage === 'cashier.html' && userRole !== 'cashier') {
        alert('Access denied: Cashiers only');
        window.location.href = 'index.html';
    } else if (currentPage === 'customer.html' && userRole !== 'customer') {
        alert('Access denied: Customers only');
        window.location.href = 'index.html';
    }
});
