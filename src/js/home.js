import { BASE_URL } from "./config.js";

const loader = document.getElementById("loader");

function showLoader() {
  loader.classList.remove("hidden");
}

function hideLoader() {
  loader.classList.add("hidden");
}

const modal = document.getElementById("confirm-modal");
const cancelBtn = document.querySelector(".modal-cancel-btn");
const confirmBtn = document.querySelector(".modal-confirm-btn");

function openModal(msg) {
  const message = document.getElementById("message");
  message.innerText = msg;
  modal.classList.add("active");
}

function closeModal() {
  modal.classList.remove("active");
}

cancelBtn.addEventListener("click", closeModal);

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

async function saveNewAddress(address, userId, token) {
  showLoader();

  try {
    const response = await fetch(`${BASE_URL}/auth/users/${userId}/address`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        street: address.street,
        city: address.city,
        number: +address.number,
        state: address.state,
        role: address.role,
        isActive: address.isActive,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }

    location.reload();
  } catch (error) {
    console.error(`Erro ao criar endereço, motivo: ${error.message}`);
  } finally {
    hideLoader();
  }
}

async function deleteAddress(addressId, userId, token) {
  showLoader();
  try {
    const response = await fetch(
      `${BASE_URL}/auth/users/${userId}/address/${addressId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }

    location.reload();
  } catch (error) {
    console.error(`Erro ao deletar endereço, motivo: ${error.message}`);
  } finally {
    hideLoader();
  }
}

async function addressById(token, userId, addressId) {
  showLoader();
  try {
    const response = await fetch(
      `${BASE_URL}/auth/users/${userId}/address/${addressId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    console.error(`Erro ao buscar endereço, motivo: ${error.message}`);
  } finally {
    hideLoader();
  }
}

async function updateAddress(token, userId, addressId, updatedData) {
  showLoader();
  try {
    const response = await fetch(
      `${BASE_URL}/auth/users/${userId}/address/${addressId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }

    location.reload();
  } catch (error) {
    console.error(`Erro ao atualizar endereço, motivo: ${error.message}`);
  } finally {
    hideLoader();
  }
}

async function openAddressModal(token, userId, addressId) {
  const street = document.getElementById("street");
  const number = document.getElementById("number");
  const city = document.getElementById("city");
  const state = document.getElementById("state");
  const role = document.getElementById("role");
  const isActive = document.getElementById("isActive");

  street.value = "";
  number.value = "";
  city.value = "";
  state.value = "";
  role.value = "Casa";

  const modal = document.getElementById("addressModal");
  if (modal) {
    modal.style.display = "flex";

    document.querySelectorAll(".close-btn-modal").forEach((btn) => {
      btn.addEventListener("click", () => {
        modal.style.display = "none";
      });
    });

    modal.addEventListener("click", (ev) => {
      if (ev.target.classList.contains("modal")) {
        modal.style.display = "none";
      }
    });

    const form = document.getElementById("addressForm");

    if (addressId) {
      const address = await addressById(token, userId, addressId);

      street.value = address.street;
      number.value = address.number;
      city.value = address.city;
      state.value = address.state;
      role.value = address.role;

      form.onsubmit = (ev) => {
        ev.preventDefault();

        const updatedData = {
          street: street.value,
          number: +number.value,
          city: city.value,
          state: state.value,
          role: role.value,
          isActive: isActive.checked,
        };

        openModal("Deseja atualizar esse endereço?");
        confirmBtn.addEventListener("click", () => {
          updateAddress(token, userId, addressId, updatedData);
        })
      };
    } else {
      form.onsubmit = (ev) => {
        ev.preventDefault();

        const address = {
          street: street.value,
          number: number.value,
          city: city.value,
          state: state.value,
          role: role.value,
          isActive: isActive.checked,
        };

        saveNewAddress(address, userId, token);
      };
    }
  }
}

function insertUserData(data, token) {
  const addressess = data.address;
  const addressContent = document.querySelector(".address-content");

  if (addressess && addressess.length > 0) {
    const text = document.getElementById("add-new-address-btn");

    const activeAddress = addressess.filter((ad) => ad.isActive === true);
    const address = activeAddress[0];
    text.innerHTML = `<p class="address-p">${address.street}, ${address.number}, ${address.city} - ${address.state}</p>`;

    const containerOfAddress = document.querySelector(".address-container");
    const ul = document.createElement("ul");
    ul.classList.add("address-ul");

    addressess.forEach((ad) => {
      if (!ad.isActive) {
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

        const div = document.createElement("div");
        div.classList.add("hover-div");

        const li = document.createElement("li");

        li.classList = "address-list-item";

        li.innerHTML = `
      <button class="button-address">
        ${iconROle} ${ad.street}, ${ad.number}, ${ad.city} - ${ad.state} 
      </button>`;

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.innerHTML = `<i class="fa-solid fa-trash"></i>`;
        deleteBtn.dataset.address = ad.id;

        const updateBtn = document.createElement("button");
        updateBtn.classList.add("update-btn");
        updateBtn.innerHTML = `<i class="fa-solid fa-pencil"></i>`;
        updateBtn.dataset.address = ad.id;

        div.append(updateBtn, li, deleteBtn);
        ul.appendChild(div);
      }
    });

    if (addressess.length < 5) {
      const btn = document.createElement("li");
      btn.innerHTML =
        '<button>Adicionar endereço <i class="fa-solid fa-plus"></i></button>';
      btn.classList.add("add-address-btn-modal", "address-list-item");
      ul.append(btn);
    }

    containerOfAddress.appendChild(ul);

    if (
      !containerOfAddress.classList.contains("container-open") &&
      addressess.length > 0
    ) {
      addressContent.addEventListener("click", (ev) => {
        if (
          ev.target.classList.contains("address-content") ||
          ev.target.classList.contains("address-container") ||
          ev.target.classList.contains("address-ul") || 
          ev.target.classList.contains('address-p')
        ) {
          containerOfAddress.classList.toggle("container-open");
        }
      });
    }

    const btnAddAddress = document.querySelector(".add-address-btn-modal");
    if (btnAddAddress) {
      btnAddAddress.addEventListener("click", () => {
        openAddressModal(token, data.id);
      });
    }

    const deleteAddressBtn = document.querySelectorAll(".delete-btn");
    deleteAddressBtn.forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        const addressId = ev.currentTarget.dataset.address;

        openModal("Deseja deletar endereço?");

        confirmBtn.addEventListener("click", () => {
          deleteAddress(addressId, data.id, token);
          closeModal();
        });
      });
    });

    const updateAddressBtn = document.querySelectorAll(".update-btn");
    updateAddressBtn.forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        const addressId = ev.currentTarget.dataset.address;

        openAddressModal(token, data.id, addressId);
      });
    });
  } else {
    addressContent.addEventListener("click", () => {
      openAddressModal(token, data.id);
    });
  }
}

function openMobileMenu() {
  const aside = document.querySelector('.aside');
  const menu = document.querySelector('.menu');

  menu.addEventListener('click', () => {
    aside.classList.toggle('open');

    const icon = menu.querySelector('i')

    if (icon.classList.contains('fa-bars')) {
      icon.classList.remove('fa-bars');
      icon.classList.add('fa-xmark');
    } else {
      icon.classList.remove('fa-xmark');
      icon.classList.add('fa-bars');
    }
  });
}


function startApp(user, token) {
  console.log(user);

  switchUserTheme(user.favoriteTheme);
  insertUserData(user, token);
  openMobileMenu()
}

async function me(token) {
  showLoader();
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
  } finally {
    hideLoader();
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
