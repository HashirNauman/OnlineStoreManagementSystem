// login.js
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.querySelector('input[name="role"]:checked').value; // Role selected

    if (username && password) { // Assuming validation here
        localStorage.setItem('userRole', role); // Save role
        if (role === 'admin') window.location.href = 'admin.html';
        else if (role === 'cashier') window.location.href = 'cashier.html';
        else if (role === 'customer') window.location.href = 'customer.html';
    } else {
        alert('Invalid login!');
    }
});
