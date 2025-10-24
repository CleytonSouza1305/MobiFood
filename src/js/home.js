import { BASE_URL } from "./config.js";

function switchUserTheme(theme) {
  const root = document.querySelector(":root");

  if (theme === "light") {
    root.style.setProperty("--white-color", "#f4f5f6");
    root.style.setProperty("--black-color", "#0a0a0a");
    root.style.setProperty("--secunday-white-color", "#bcc2c8ff");
    root.style.setProperty("--secunday-black-color", "#000000ff");
  } else {
    root.style.setProperty("--white-color", "#0a0a0a");
    root.style.setProperty("--black-color", "#f4f5f6");
    root.style.setProperty("--secunday-white-color", "#000000ff");
    root.style.setProperty("--secunday-black-color", "#bcc2c8ff");
  }
}

function openAddressModal() {
  const modal = document.getElementById('addressModal')
  if (modal) {
    modal.style.display = 'block'
  }
}

function insertUserData(data, token) {
  const addressess = data.address;
  const addressContent = document.querySelector(".address-content");

  if (addressess && addressess.length > 0) {
    const text = document.getElementById("add-new-address-btn");

    const activeAddress = addressess.filter((ad) => ad.isActive === true);
    const address = activeAddress[0];
    text.innerHTML = `<p>${address.street}, ${address.number}, ${address.city} - ${address.state}</p>`;

    const containerOfAddress = document.querySelector(".address-container");
    const ul = document.createElement("ul");
    ul.classList.add("address-ul");

    const allAddress = addressess.filter((ad) => ad.isActive !== true);
    if (allAddress && allAddress.length > 0) {
      allAddress.forEach((ad) => {
        console.log(ad);

        let iconROle;

        switch (ad.role) {
          case "Casa":
            iconROle = `<i class="fa-solid fa-house"></i>`;
            break;

          case "Trabalho":
            iconROle = `<i class="fa-solid fa-briefcase"></i>`;
            break;

          case "Escola":
            iconROle = `<i class="fa-solid fa-graduation-cap"></i>`;
            break;

          default:
            iconROle = `<i class="fa-solid fa-location-dot"></i>`;
        }

        const li = document.createElement("li");

        li.classList = "address-list-item";
        li.dataset.address = ad.id;

        li.innerHTML = `
      <button class="button-address">
        ${iconROle} ${ad.street}, ${ad.number}, ${ad.city} - ${ad.state} 
      </button>`;
        ul.appendChild(li);
      });

      if (addressess.length < 5) {
        const btn = document.createElement('li')
        btn.innerHTML = '<button>Adicionar endereço <i class="fa-solid fa-plus"></i></button>'
        btn.classList.add('add-address-btn', 'address-list-item')
        ul.append(btn)
      }

      containerOfAddress.appendChild(ul);
    }

    if (!containerOfAddress.classList.contains("container-open") && allAddress.length > 0) {
      addressContent.addEventListener("click", (ev) => {
        if (
          ev.target.classList.contains("address-content") ||
          ev.target.classList.contains("address-container") ||
          ev.target.classList.contains("address-ul")
        ) {
          containerOfAddress.classList.toggle("container-open");
        }
      });
    }
  } else {
    addressContent.addEventListener('click', openAddressModal)
  }
}

function startApp(user, token) {
  console.log(user);

  switchUserTheme(user.favoriteTheme);
  insertUserData(user, token);
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

async function validateToken() {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    location.href = "../../index.html";
  } else {
    const user = await me(token);
    if (!user) {
      localStorage.removeItem("token");
      location.href = "../../index.html";
    } else {
      startApp(user, token);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  validateToken();
});
