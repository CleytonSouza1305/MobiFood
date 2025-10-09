import { BASE_URL  } from "./config.js";

export async function validateToken() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')

  if (!token) {
  startApp()
} else {
  const user = await me(token)
  if (!user) {
    localStorage.removeItem('token')
    startApp()
  } else {
    console.log('User authenticated:', user)
    window.location.href = './src/pages/home.html'
  }
}
}

async function me(token) {
  try {
    const response = await fetch(`${BASE_URL}/auth/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch user data');
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function loginRequest(email, password, rememberMe) {
  const loader = document.getElementById('loader');
  loader.classList.remove('display');

  try {
    const errorMessage = document.querySelector('.error-message');
    errorMessage.textContent = ''

    const response = await fetch(`${BASE_URL}/auth/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errorData = await response.json();

      errorMessage.textContent = errorData.message || 'Login failed';
      return
    }

    const data = await response.json();

    if (rememberMe) {
      localStorage.setItem('token', data.token);
    } else {
      sessionStorage.setItem('token', data.token);
    }

    window.location.href = './src/pages/home.html'
  } catch (error) {
    console.error(error);
    return null;
  } finally {
    loader.classList.add('display');
  }
}

async function registerRequest(rememberMe) {
  try {
    const errorMessage = document.querySelector('.error-message');
    errorMessage.textContent = ''

    const response = await fetch(`${BASE_URL}/auth/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({  })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log(errorData)
      errorMessage.textContent = errorData.message || 'Login failed'
      return
    }

    const data = await response.json();

    // await loginRequest(rememberMe)
  } catch (error) {
    console.error(error);
    return null;
  }
}

function startApp() {
  const form = document.querySelector('form')
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const checkbox = document.getElementById('remember').checked

    if (!email || !password) {
      const errorMessage = document.querySelector('.error-message');
      errorMessage.textContent = 'Por favor, preencha todos os campos.';
    } else {
      if (form.id === 'login-form') {
        await loginRequest(email, password, checkbox)
      } else if (form.id === 'register-form') {
        await registerRequest(checkbox)
      }
    }
  }) 
}

document.addEventListener('DOMContentLoaded', () => {
  validateToken()
})