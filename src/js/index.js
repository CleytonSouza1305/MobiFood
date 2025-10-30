import { BASE_URL } from "./config.js";

const loader = document.getElementById("loader");

function showLoader() {
  loader.classList.remove("hidden");
}

function hideLoader() {
  loader.classList.add("hidden");
}

async function validateToken() {
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
  showLoader()

  try {
    const response = await fetch(`${BASE_URL}/auth/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return null;
  } finally {
    hideLoader()
  }
}

async function loginRequest(email, password, rememberMe) {
  showLoader()

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

    if (
      location.pathname.includes("index.html") ||
      location.pathname === "/" ||
      location.pathname === "/login"
    ) {
      window.location.href = "./src/pages/home.html";
    } else {
      window.location.href = "../pages/home.html";
    }
  } catch (error) {
    console.error(error);
    return null;
  } finally {
   hideLoader()
  }
}

async function registerRequest(data, rememberMe) {
  showLoader()
  try {
    console.log(data);
    const errorMessage = document.querySelector(".error-message");
    errorMessage.textContent = "";

    const response = await fetch(`${BASE_URL}/auth/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: data.userType,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log(errorData);
      errorMessage.textContent = errorData.message || "Login failed";
      return;
    }

    await loginRequest(data.email, data.password, rememberMe);
  } catch (error) {
    console.error(error);
    return null;
  } finally {
    hideLoader()
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

      errorMessage.textContent = "";
      phoneMask(phone.value);
    });

    document.addEventListener("keydown", (k) => {
      const key = k.key;
      if (key === "Backspace") {
        if (phone.value.length >= 2 && phone.value.length < 6) {
          const value = phone.value.trim();
          phone.value = value.slice(0, value.length);
        }
      }
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

        const data = {
          name,
          email,
          password,
          phone: phone.value,
          userType: userType.value,
        };

        await registerRequest(data, checkbox);
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  validateToken();
});
