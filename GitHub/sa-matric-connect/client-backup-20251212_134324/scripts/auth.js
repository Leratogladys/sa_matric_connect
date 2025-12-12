// Check if user is already logged in on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    
    // Toggle between login and register forms
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const infoSection = document.querySelector('.info-section');
    
    if (showRegister) {
        showRegister.addEventListener('click', function(e) {
            e.preventDefault();
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            if (infoSection) infoSection.style.display = 'none';
        });
    }
    
    if (showLogin) {
        showLogin.addEventListener('click', function(e) {
            e.preventDefault();
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
            if (infoSection) infoSection.style.display = 'block';
        });
    }
    
    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const messageEl = document.getElementById('loginMessage');
            const loginBtn = loginForm.querySelector('.login-btn');
            
            // Show loading state
            loginBtn.textContent = 'Logging in...';
            loginBtn.disabled = true;
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                    credentials: 'include' // Important for cookies
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    showMessage(messageEl, 'Login successful! Redirecting to dashboard...', 'success');
                    // Store user data in localStorage for frontend access
                    localStorage.setItem('user', JSON.stringify(data.user));
                    // Redirect to homepage
                    setTimeout(() => {
                        window.location.href = '/home';
                    }, 1500);
                } else {
                    showMessage(messageEl, data.error || 'Login failed. Please check your credentials.', 'error');
                }
            } catch (error) {
                showMessage(messageEl, 'Network error. Please check your connection and try again.', 'error');
            } finally {
                // Reset button state
                loginBtn.textContent = 'Login';
                loginBtn.disabled = false;
            }
        });
    }
    
    // Handle registration form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                firstName: document.getElementById('regFirstName').value,
                lastName: document.getElementById('regLastName').value,
                email: document.getElementById('regEmail').value,
                password: document.getElementById('regPassword').value
            };
            
            const messageEl = document.getElementById('registerMessage');
            const registerBtn = registerForm.querySelector('.login-btn');
            
            // Show loading state
            registerBtn.textContent = 'Creating Account...';
            registerBtn.disabled = true;
            
            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    showMessage(messageEl, 'Account created successfully! You can now login with your credentials.', 'success');
                    registerForm.reset();
                    // Switch to login form after successful registration
                    setTimeout(() => {
                        registerForm.style.display = 'none';
                        loginForm.style.display = 'block';
                        if (infoSection) infoSection.style.display = 'block';
                        document.getElementById('email').value = formData.email;
                    }, 2000);
                } else {
                    showMessage(messageEl, data.error || 'Registration failed. Please try again.', 'error');
                }
            } catch (error) {
                showMessage(messageEl, 'Network error. Please check your connection and try again.', 'error');
            } finally {
                // Reset button state
                registerBtn.textContent = 'Register';
                registerBtn.disabled = false;
            }
        });
    }
});

// Check authentication status
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/me', {
            credentials: 'include' // Important for cookies
        });
        
        if (response.ok) {
            const data = await response.json();
            // User is logged in, redirect to dashboard
            window.location.href = '/home';
        }
    } catch (error) {
        // User is not logged in, stay on login page
        console.log('User not authenticated');
    }
}

// Helper function to show messages
function showMessage(element, text, type) {
    element.textContent = text;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}

// Global logout function
async function logout() {
    try {
        await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        // Clear frontend storage
        localStorage.removeItem('user');
        // Redirect to login page
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
    }
}