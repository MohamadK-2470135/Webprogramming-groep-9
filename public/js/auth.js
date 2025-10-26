/**
 * Client-side Authentication Logic
 * Handles login and registration forms
 * Uses Fetch API to communicate with backend
 */

// Tab switching logic
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const fLogin = document.getElementById('loginForm');
const fRegister = document.getElementById('registerForm');

// Switch to register tab
document.getElementById('toRegister').onclick = (e) => {
  e.preventDefault();
  tabRegister.click();
};

// Switch to login tab
document.getElementById('toLogin').onclick = (e) => {
  e.preventDefault();
  tabLogin.click();
};

// Tab click handlers
tabLogin.onclick = () => {
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  fLogin.classList.remove('hidden');
  fRegister.classList.add('hidden');
  document.getElementById('loginMsg').textContent = '';
};

tabRegister.onclick = () => {
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  fRegister.classList.remove('hidden');
  fLogin.classList.add('hidden');
  document.getElementById('registerMsg').textContent = '';
};

/**
 * Login form submission
 * POST /api/auth/login
 */
fLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPass').value;
  const msgEl = document.getElementById('loginMsg');

  try {
    // Send login request to backend using Fetch API
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Login successful - redirect to recipes page
      window.location.href = '/recipes';
    } else {
      // Show error message
      msgEl.textContent = data.message || data.error || 'Login failed';
      msgEl.style.color = '#dc3545';
    }
  } catch (error) {
    console.error('Login error:', error);
    msgEl.textContent = 'Connection error. Please try again.';
    msgEl.style.color = '#dc3545';
  }
});

/**
 * Registration form submission
 * POST /api/auth/register
 */
fRegister.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const password = document.getElementById('regPass').value;
  const msgEl = document.getElementById('registerMsg');

  try {
    // Send registration request to backend using Fetch API
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Registration successful - redirect to recipes page
      window.location.href = '/recipes';
    } else {
      // Show error message
      if (data.errors && data.errors.length > 0) {
        msgEl.textContent = data.errors[0].msg;
      } else {
        msgEl.textContent = data.message || data.error || 'Registration failed';
      }
      msgEl.style.color = '#dc3545';
    }
  } catch (error) {
    console.error('Registration error:', error);
    msgEl.textContent = 'Connection error. Please try again.';
    msgEl.style.color = '#dc3545';
  }
});