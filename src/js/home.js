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
    root.style.setProperty("--third-white-color", "#dee4ea");
    root.style.setProperty("--third-black-color", "#1e1f20ff");
  } else {
    root.style.setProperty("--white-color", "#0a0a0a");
    root.style.setProperty("--black-color", "#f4f5f6");
    root.style.setProperty("--secunday-white-color", "#000000ff");
    root.style.setProperty("--secunday-black-color", "#bcc2c8ff");
    root.style.setProperty("--third-white-color", "#1e1f20ff");
    root.style.setProperty("--third-black-color", "#dee4ea");
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
        });
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
          ev.target.classList.contains("address-p")
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
  const aside = document.querySelector(".aside");
  const menu = document.querySelector(".menu");

  menu.addEventListener("click", () => {
    aside.classList.toggle("open");

    const icon = menu.querySelector("i");

    if (icon.classList.contains("fa-bars")) {
      icon.classList.remove("fa-bars");
      icon.classList.add("fa-xmark");
    } else {
      icon.classList.remove("fa-xmark");
      icon.classList.add("fa-bars");
    }
  });
}

async function getRestaurant(token, params = null) {
  try {
    const url = params
      ? `${BASE_URL}/api/restaurants/${params}`
      : (url = `${BASE_URL}/api/restaurants`);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    console.log("Erro ao buscar restaurant, motivo: ", error.message);
    return [];
  }
}

async function restaurantById(token, restaurantId) {
  showLoader()

  try {
    const response = await fetch(`${BASE_URL}/api/restaurants/${restaurantId}`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message)
    }

    return data
  } catch (error) {
    console.log(`Erro ao buscar restaurante, motivo: ${error.message}`)
  } finally {
    hideLoader()
  }
}

function insertRestaurantData(data, contentName, append) {
  const restaurantDiv = document.querySelector(`.restaurants-div-dad`);

  if (!append) {
    if (restaurantDiv) restaurantDiv.innerHTML = "";
  }

  const contentRestaurants = document.createElement("div");
  contentRestaurants.classList.add("content-restaurants");

  const contentTitle = document.createElement("h2");
  contentTitle.classList.add("search-action");

  const contentNameVariable = contentName
    ? `${contentName}<i class="fa-solid fa-chevron-right"></i>`
    : `MobiFood recomenda<i class="fa-solid fa-chevron-right"></i>`;

  contentTitle.innerHTML = contentNameVariable;

  const restaurants = document.createElement("div");
  restaurants.classList.add("restaurants");

  data.forEach((restaurant) => {
    const card = document.createElement("div");
    card.classList.add("restaurant-card");
    card.dataset.restaurantId = restaurant.id;

    const openHour = parseInt(restaurant.openAt.split(":")[0]);
    const closeHour = parseInt(restaurant.closeAt.split(":")[0]);
    const currentHour = new Date().getHours();

    card.innerHTML = `
      <div class="restaurant-logo">
        ${
          restaurant.logoUrl
            ? `<img src="${restaurant.logoUrl}" alt="${restaurant.name}">`
            : `<div class="no-logo">Sem imagem</div>`
        }
      </div>
      <div class="restaurant-info">
        <h2 class="restaurant-title">
          ${restaurant.name ? restaurant.name : "Nenhum nome disponível"}
        </h2>

        <p class="restaurant-address">
          ${restaurant.local ? restaurant.local : "Endereço inválido"}
        </p>

        <div class="hours-content">
          <span>
            ${
              restaurant.openAt && restaurant.closeAt
                ? `${restaurant.openAt} - ${restaurant.closeAt}`
                : "Nenhum horário disponível"
            }
          </span>
    
          ${
            currentHour >= openHour && currentHour < closeHour
              ? '<span class="isOpen">Aberto</span>'
              : '<span class="isClosed">Fechado</span>'
          }
        </div>

        <div class="category-content">
          ${
            restaurant.category
              ? `<span>• ${formatCategory(restaurant.category)}</span>`
              : "<span>• Outros</span>"
          }
        </div>
      </div>
    `;

    restaurants.appendChild(card);
  });

  contentRestaurants.append(contentTitle, restaurants);
  restaurantDiv.appendChild(contentRestaurants);
}

async function createContentRestaurant(token) {
  const bestRated = await getRestaurant(token, "?pageSize=5");
  insertRestaurantData(bestRated.data, "Melhor avaliado");

  const categories = [
    {
      category: "FAST_FOOD",
      ptCategory: "Fast Food",
      title: "Clássicos do Fast Food",
    },
    { category: "ITALIAN", ptCategory: "Italiana", title: "Sabores da Itália" },
    {
      category: "JAPANESE",
      ptCategory: "Japonesa",
      title: "Delícias do Japão",
    },
    { category: "CHINESE", ptCategory: "Chinesa", title: "Sabor da China" },
    {
      category: "MEXICAN",
      ptCategory: "Mexicana",
      title: "Autêntica Comida Mexicana",
    },
    {
      category: "VEGETARIAN",
      ptCategory: "Vegetariana",
      title: "Opções Saudáveis e Vegetarianas",
    },
    { category: "PIZZA", ptCategory: "Pizzaria", title: "As Melhores Pizzas" },
    {
      category: "BURGER",
      ptCategory: "Hamburgueria",
      title: "Os Melhores Hambúrgueres",
    },
    { category: "SEAFOOD", ptCategory: "Frutos do Mar", title: "Sabor do Mar" },
    { category: "BAKERY", ptCategory: "Padaria", title: "Delícias de Padaria" },
    {
      category: "COFFEE_SHOP",
      ptCategory: "Cafeteria",
      title: "Melhores Cafés e Doces",
    },
    {
      category: "DESSERT",
      ptCategory: "Sobremesas",
      title: "Doces e Sobremesas Irresistíveis",
    },
  ];

  let secondContent = [{}];
  let randomDt;

  do {
    randomDt = categories[Math.floor(Math.random() * categories.length)];

    secondContent = await getRestaurant(
      token,
      `?pageSize=5&category=${randomDt.category}`
    );
  } while (secondContent.data.length < 1);

  insertRestaurantData(secondContent.data, `${randomDt.title}`, true);

  let thirdContent = { data: [] };
  let secondCategory = randomDt.category;
  let randomThird;

  do {
    randomThird = categories[Math.floor(Math.random() * categories.length)];
    thirdContent = await getRestaurant(
      token,
      `?pageSize=5&category=${randomThird.category}`
    );
  } while (
    thirdContent.data.length < 1 ||
    randomThird.category === secondCategory
  );

  insertRestaurantData(thirdContent.data, randomThird.title, true);
}

function formatCategory(category) {
  const map = {
    FAST_FOOD: "Fast Food",
    ITALIAN: "Italiana",
    JAPANESE: "Japonesa",
    CHINESE: "Chinesa",
    MEXICAN: "Mexicana",
    VEGETARIAN: "Vegetariana",
    PIZZA: "Pizzaria",
    BURGER: "Hamburgueria",
    SEAFOOD: "Frutos do Mar",
    BAKERY: "Padaria",
    COFFEE_SHOP: "Cafeteria",
    DESSERT: "Sobremesas",
    OTHERS: "Outros",
  };

  return map[category] || category;
}

async function startApp(user, token) {
  console.log(user);

  switchUserTheme(user.favoriteTheme);
  insertUserData(user, token);
  openMobileMenu();
  createContentRestaurant(token);

  const searchInput = document.getElementById("query");
  let searchTimeout;

  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);

    const query = searchInput.value.trim();

    if (query.length < 1) {
      createContentRestaurant(token);
      return;
    }

    searchTimeout = setTimeout(async () => {
      const restaurant = await getRestaurant(
        token,
        `?pageSize=10&name=${query}`
      );
      const data = restaurant.data;

      if (data && data.length > 0) {
        insertRestaurantData(data, `Resultado para "${query}"`);
      } else {
        createContentRestaurant(token);
      }
    }, 1500);
  });
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
