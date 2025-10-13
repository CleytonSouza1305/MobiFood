import { BASE_URL } from "./config.js";

export async function validateToken() {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    startApp();
  } else {
    const user = await me(token);
    if (!user) {
      localStorage.removeItem("token");
      startApp();
    } else {
      console.log("User authenticated:", user);
      window.location.href = "./src/pages/home.html";
    }
  }
}

async function me(token) {
  try {
    const response = await fetch(`${BASE_URL}/auth/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch user data");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function loginRequest(email, password, rememberMe) {
  const loader = document.getElementById("loader");
  loader.classList.remove("display");

  try {
    const errorMessage = document.querySelector(".error-message");
    errorMessage.textContent = "";

    const response = await fetch(`${BASE_URL}/auth/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();

      errorMessage.textContent = errorData.message || "Login failed";
      return;
    }

    const data = await response.json();

    if (rememberMe) {
      localStorage.setItem("token", data.token);
    } else {
      sessionStorage.setItem("token", data.token);
    }

    window.location.href = "./src/pages/home.html";
  } catch (error) {
    console.error(error);
    return null;
  } finally {
    loader.classList.add("display");
  }
}

async function registerRequest(
  name,
  email,
  password,
  phone,
  userType,
  rememberMe
) {
  try {
    const errorMessage = document.querySelector(".error-message");
    errorMessage.textContent = "";

    const response = await fetch(`${BASE_URL}/auth/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, phone, role: userType }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log(errorData);
      errorMessage.textContent = errorData.message || "Login failed";
      return;
    }

    const data = await response.json();

    // await loginRequest(rememberMe)
  } catch (error) {
    console.error(error);
    return null;
  }
}

function phoneMask(value) {
  const phoneInput = document.getElementById("phone");

  if (value > 0) {
    phoneInput.value = `(${value}`;
  }

  if (value.length > 2) {
    phoneInput.value = `${value}) `;
  }

  if (value.length > 4) {
    phone.value = value;
  }

  if (value.length > 9) {
    phone.value = `${value} - `;
  }

  if (value.length > 12) {
    phone.value = value;
  }

  if (value.length > 17) {
    phone.value = value.slice(0, -1);
  }
}

function startApp() {
  const phone = document.getElementById("phone");
  if (phone) {
    const errorMessage = document.querySelector(".error-message");
    phone.addEventListener("input", (ev) => {
      const isNumber = Number(ev.data);
      if (isNaN(isNumber)) {
        phone.value = phone.value.slice(0, -1);
        errorMessage.textContent = "Apenas números são permitidos.";
        return;
      }

      errorMessage.textContent = ''
      phoneMask(phone.value);
    });
  }
  const form = document.querySelector("form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const checkbox = document.getElementById("remember").checked;

    if (!email || !password) {
      const errorMessage = document.querySelector(".error-message");
      errorMessage.textContent = "Por favor, preencha todos os campos.";
    } else {
      if (form.id === "login-form") {
        await loginRequest(email, password, checkbox);
      } else if (form.id === "register-form") {
        const name = document.getElementById("name").value;
        const userType = document.querySelector(
          'input[name="userType"]:checked'
        );

        if (!name || !phone || !userType) {
          const errorMessage = document.querySelector(".error-message");
          errorMessage.textContent = "Por favor, preencha todos os campos.";
          return;
        }

        await registerRequest(checkbox);
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  validateToken();
});
