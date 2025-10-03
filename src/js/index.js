const token = localStorage.getItem('token');
import { BASE_URL  } from "./config.js";

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

function startApp() {
  console.log('App started');
}

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