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
    root.style.setProperty("--third-white-color", "#dbdbdc");
    root.style.setProperty("--third-black-color", "#1e1f20ff");
  } else {
    root.style.setProperty("--white-color", "#0a0a0a");
    root.style.setProperty("--black-color", "#f4f5f6");
    root.style.setProperty("--secunday-white-color", "#000000ff");
    root.style.setProperty("--secunday-black-color", "#bcc2c8ff");
    root.style.setProperty("--third-white-color", "#1e1f20ff");
    root.style.setProperty("--third-black-color", "#dbdbdc");
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
  showLoader();

  try {
    const response = await fetch(
      `${BASE_URL}/api/restaurants/${restaurantId}`,
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
    console.log(`Erro ao buscar restaurante, motivo: ${error.message}`);
  } finally {
    hideLoader();
  }
}

function insertRestaurantData(data, contentName, append, token) {
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

    card.dataset.isopen = currentHour >= openHour && currentHour < closeHour;

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

  getDataRestaurantCard(token);
}

async function createContentRestaurant(token) {
  const bestRated = await getRestaurant(token, "?pageSize=5");
  insertRestaurantData(bestRated.data, "Melhor avaliado", false, token);

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

  insertRestaurantData(secondContent.data, `${randomDt.title}`, true, token);

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

  insertRestaurantData(thirdContent.data, randomThird.title, true, token);
}

async function addInCartRequest(token, itemId) {
  showLoader();
  try {
    const response = await fetch(`${BASE_URL}/api/cart`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ itemId, quantity: 1 }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }

    messageAnimated(
      "Produto adicionado ao carrinho!",
      3000,
      "top",
      "right",
      "12px",
      "#107af4",
      "#fff",
      "500"
    );
  } catch (error) {
    console.log(`Erro ao adicionar item ao carrinho, ${error.message}`);
  } finally {
    hideLoader();
  }
}

function createMenuCard(menu, contentName, token) {
  const content = document.createElement("div");
  content.classList.add("container");

  const h3 = document.createElement("h3");
  h3.innerHTML = contentName + `<i class="fa-solid fa-chevron-right"></i>`;

  const menuData = document.createElement("div");
  menuData.classList.add("container-menu");

  for (let i = 0; i < menu.length; i++) {
    const card = document.createElement("div");
    card.classList.add("card-menu");

    const leftData = document.createElement("div");
    leftData.classList.add("content-left-data");

    const productImage = document.createElement("div");
    productImage.classList.add("product-image");

    if (menu[i].imageUrl) {
      productImage.innerHTML = `
        <img src="${menu[i].imageUrl}" alt="${menu[i].name}" />
      `;
    } else {
      productImage.innerHTML = `
        <img src="https://images.tcdn.com.br/img/img_prod/843866/1621728785_produto-indisponivel.jpg" alt="Produto indisponível" />
      `;
    }

    const productname = document.createElement("p");
    productname.textContent = menu[i].name;

    leftData.append(productImage, productname);

    const rigthData = document.createElement("div");
    rigthData.classList.add("content-rigth-data");

    const productDescription = document.createElement("p");
    productDescription.textContent = menu[i].description;

    const productPrice = document.createElement("span");
    const priceNumber = Number(menu[i].price);

    productPrice.textContent = priceNumber.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    rigthData.append(productDescription, productPrice);

    const addProductForm = document.createElement("form");
    addProductForm.classList.add("add-product");
    addProductForm.method = "get";

    const btn = document.createElement("button");
    btn.type = "submit";
    btn.classList.add("add-cart-btn");
    btn.innerHTML = `<i class="fa-solid fa-cart-plus"></i>`;

    addProductForm.append(btn);

    addProductForm.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const itemId = menu[i].id;

      addInCartRequest(token, itemId);
    });

    card.append(leftData, rigthData, addProductForm);
    menuData.append(card);
  }

  content.append(h3, menuData);

  const menuContent = document.querySelector(".menu-content");
  menuContent.append(content);
}

async function getCartDataReq(token, cartId) {
  showLoader();
  try {
    const response = await fetch(`${BASE_URL}/api/cart/${cartId}`, {
      method: "get",
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
    console.log(`Erro ao buscar carrinho, ${error.message}`);
  } finally {
    hideLoader();
  }
}

async function updateItemInCart(quantity, itemId, token) {
  showLoader();
  try {
    const response = await fetch(`${BASE_URL}/api/cart/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    console.log(`Erro ao adicionar item ao carrinho, ${error.message}`);

    messageAnimated(
      error.message,
      3000,
      "top",
      "right",
      "12px",
      "rgb(198, 48, 48)",
      "#fff",
      "500"
    );
  } finally {
    hideLoader();
  }
}

async function deleteItemInCart(itemId, token) {
  showLoader();
  try {
    const response = await fetch(`${BASE_URL}/api/cart/${itemId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }

    return data?.deletedItem;
  } catch (error) {
    console.log(`Erro ao deletar item, ${error.message}`);

    messageAnimated(
      error.message,
      3000,
      "top",
      "right",
      "12px",
      "rgb(198, 48, 48)",
      "#fff",
      "500"
    );
  } finally {
    hideLoader();
  }
}

function insertItemsInCart(itemsArr, carttotal, token) {
  const itemsContent = document.querySelector(".cart-items");
  const totalPrice = document.querySelector(".total-price");
  const finishOrder = document.querySelector(".checkout-btn");

  if (itemsArr && itemsArr.length > 0) {
    itemsContent.innerHTML = "";

    itemsArr.forEach((data) => {
      itemsContent.innerHTML += `
  <div class="card-item-cart" data-item-id="${data.item.id}">  
    <div class="cart-logo">
      <img class="cart-image" src="${
        data.item.imageUrl
          ? data.item.imageUrl
          : "https://i.scdn.co/image/ab67616d00001e02d2b16fb0811bee33cd4a6068"
      }" />
    </div>

    <div class="center-cart-data">
      <p class="cart-item-name">${data.item.name}</p>

      <div class="quantity-control">
        <button class="quantity-btn minus-btn" data-action="minus">
          <i class="fa-solid fa-minus"></i>
        </button>

        <span class="actual-quantity">${data.quantity}</span>

        <button class="quantity-btn plus-btn" data-action="add">
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>
    </div>

    <div class="right-data">
      <button class="delete-item" data-delete-id="${data.item.id}">
          <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  </div>
`;
    });

    const priceFormatted = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(carttotal);

    totalPrice.textContent = priceFormatted;

    finishOrder.disabled = false;

    const deleteItemBtn = document.querySelectorAll(".delete-item");
    deleteItemBtn.forEach((btn) => {
      btn.onclick = async (ev) => {
        const itemId = ev.currentTarget.dataset.deleteId;

        const data = await deleteItemInCart(Number(itemId), token);
        insertItemsInCart(data.items, data.total, token);
      };
    });
  } else {
    itemsContent.innerHTML = `
    <p class="empty-cart">Seu carrinho está vazio</p></div>`;

    totalPrice.textContent = "R$ 0,00";
    finishOrder.disabled = true;
  }
}

async function validateCoupon(couponCode, token) {
  showLoader();
  const input = document.getElementById("cupon");
  const errorTxt = document.querySelector(".error-txt-cupon");
  try {
    const response = await fetch(`${BASE_URL}/api/coupons/${couponCode}`, {
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
    if (input) {
      input.classList.add("error-cupon");
      if (errorTxt) {
        errorTxt.textContent = error.message;
      }
    }
  } finally {
    hideLoader();
  }
}

async function openCartModal(token, cartId) {
  const modal = document.querySelector(".cart-modal");
  if (modal.classList.contains("active")) {
    modal.classList.remove("active");
  } else {
    modal.classList.add("active");

    const asideMenu = document.querySelector(".aside");
    asideMenu.classList.remove("open");

    const menu = document.querySelector(".menu");
    const menuIcon = menu.querySelector("i");

    menuIcon.classList.remove("fa-xmark");
    menuIcon.classList.add("fa-bars");

    const closeBtn = modal.querySelector(".close-modal");
    closeBtn.onclick = () => modal.classList.remove("active");

    const cart = await getCartDataReq(token, cartId);

    if (cart) {
      insertItemsInCart(cart?.items, cart?.total, token);

      const itemsContent = document.querySelector(".cart-items");

      itemsContent.addEventListener("click", async (ev) => {
        const btn = ev.target.closest(".quantity-btn");
        if (!btn) return;

        const card = btn.closest(".card-item-cart");
        const itemId = card.dataset.itemId;

        const quantitySpan = card.querySelector(".actual-quantity");
        let currentQuantity = Number(quantitySpan.textContent);

        const action = btn.dataset.action;

        if (action === "add") {
          currentQuantity++;
        }

        if (action === "minus") {
          if (currentQuantity <= 1) return;
          currentQuantity--;
        }

        const data = await updateItemInCart(currentQuantity, itemId, token);
        insertItemsInCart(data.items, data.total, token);
      });

      const finishOrder = document.querySelector(".checkout-btn");
      const cuponInput = document.getElementById("cupon");
      const errorTxt = document.querySelector(".error-txt-cupon");

      cuponInput.addEventListener("input", () => {
        const value = cuponInput.value.trim();

        if (value.length > 0) {
          finishOrder.textContent = "Aplicar Cupom";
          finishOrder.classList.replace("checkout-btn", "cupon-btn");
          cuponInput.classList.add("have-cupon");
        } else {
          finishOrder.textContent = "Finalizar Pedido";
          finishOrder.classList.replace("cupon-btn", "checkout-btn");
          cuponInput.classList.remove("have-cupon");
        }

        cuponInput.classList.remove("error-cupon");
        if (errorTxt) errorTxt.textContent = "";
      });

      finishOrder.onclick = async () => {
        const couponCode = cuponInput.value.trim();

        if (couponCode.length > 0) {
          const result = await validateCoupon(couponCode, token);

          if (!result) return;
          messageAnimated(
            `Cupon "${result.couponName}" aplicado!`,
            2000,
            "top",
            "right",
            "12px",
            "#107af4",
            "#fff",
            "500"
          );

          finishOrder.textContent = "Finalizar Pedido";
          finishOrder.classList.replace("cupon-btn", "checkout-btn");

          return;
        }

        console.log("Chamando função para criar pedido...");
      };
    }
  }
}

async function couponRequest(token, request) {
  showLoader();
  try {
    const response = await fetch(`${BASE_URL}/${request}`, {
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
    messageAnimated(
      error.message,
      3000,
      "top",
      "right",
      "12px",
      "rgb(198, 48, 48)",
      "#fff",
      "500"
    );
  } finally {
    hideLoader();
  }
}

function validatePromotionType(couponName) {
  const name = couponName.toUpperCase();

  if (name.includes("VIP") || name.includes("ESPECIAL")) {
    return "#c2a608ff"; //
  }

  if (
    name.includes("CORRA") ||
    name.includes("QUENTE") ||
    name.includes("OFERTA") ||
    name.includes("PROMOCAO")
  ) {
    return "#FF4500";
  }

  if (
    name.includes("COMIDA") ||
    name.includes("SABOR") ||
    name.includes("DELÍCIA") ||
    name.includes("FOME")
  ) {
    return "#FF6B6B";
  }

  if (
    name.includes("FRETE") ||
    name.includes("ENTREGA") ||
    name.includes("GRATIS")
  ) {
    return "#22a6b3";
  }

  if (
    name.includes("VOLTA") ||
    name.includes("SAUDADE") ||
    name.includes("SUMIDO") ||
    name.includes("SEXTOU") ||
    name.includes("FESTA")
  ) {
    return "#a29bfe";
  }

  return "#969696ff";
}

function createCouponCard(couponArr, listHtml) {
  listHtml.innerHTML = "";

  if (couponArr && couponArr.length > 0) {
    couponArr.forEach((cupon) => {
      let value = "";
      if (cupon.discountType === "FIXED") {
        const valueCoupon = Number(cupon.discountValue)
          .toFixed(2)
          .replace(".", ",");
        value = `R$ ${valueCoupon}`;
      } else if (cupon.discountType === "PERCENTAGE") {
        value = `${cupon.discountValue}% OFF`;
      } else if (cupon.discountType === "DELIVERY") {
        value = "Frete Grátis";
      }

      const expirationDate = new Date(cupon.expiresAt).toLocaleDateString(
        "pt-BR",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }
      );

      const isAlreadyUsed = Boolean(cupon.usage_at);
      const promoColor = validatePromotionType(cupon.couponName);

      listHtml.innerHTML += `
  <div style="background-color: ${promoColor}" class="special-content">
    <div class="coupon-card">
      <div class="coupon-info">
        <span style="background-color: ${promoColor}" class="coupon-name">
          ${cupon.couponName}
        </span>
        <p class="coupon-description">${cupon.description}</p>
        <span class="expires-at"> - Expira em: ${expirationDate}</span>
      </div>

      <div class="coupon-value">
        <span class="value">${value}</span>

        ${
          isAlreadyUsed
            ? `<button disabled class="copy-button disabled-icon utilized-btn">
         <span>Utilizado</span>
       </button>`
            : cupon.is_active
            ? `<button 
          style="background-color: ${promoColor}" 
          class="copy-button enable-btn" 
          data-coupon="${cupon.code}" 
          data-coupon-name="${cupon.couponName}">
            <i class="fa-regular fa-copy"></i>
        </button>`
            : `<button disabled class="copy-button disabled-icon">
          <i class="fa-regular fa-copy"></i>
        </button>`
        }
      </div>
    </div>
  </div>
`;
    });

    const copyBtn = document.querySelectorAll(".enable-btn");
    copyBtn.forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        const couponCode = ev.currentTarget.dataset.coupon;
        const couponName = ev.currentTarget.dataset.couponName;

        navigator.clipboard.writeText(couponCode);
        messageAnimated(
          `Cupon "${couponName}" copiado com sucesso!`,
          2000,
          "top",
          "right",
          "12px",
          "#107af4",
          "#fff",
          "500"
        );
      });
    });
  } else {
    listHtml.innerHTML = `<p class="no-have-coupons">Não há cupons disponíveis no momento.<p/>`;
  }
}

async function openCouponModal(token, userId) {
  const [couponsDt, biggestDiscount, couponUsage] = await Promise.all([
    couponRequest(token, "api/coupons/avaliable?is_active=true"),
    couponRequest(token, "api/coupons/avaliable?sortBy=discountValue&order=desc"),
    couponRequest(token, `api/coupons/usage/${userId}`),
  ]);

  const data = {
    isActive: couponsDt.coupons,
    biggestDiscount: biggestDiscount.coupons,
    couponUsage: couponUsage,
  };

  const isActiveNotUtilized = data.isActive.filter((cupomAtivo) => {
    return !data.couponUsage.some(
      (cupomUsado) => cupomUsado.id === cupomAtivo.id
    );
  });

  const biggestDiscountNotUtilized = data.biggestDiscount.filter((cupomAtivo) => {
    return !data.couponUsage.some(
      (cupomUsado) => cupomUsado.id === cupomAtivo.id
    );
  });

  const modal = document.querySelector(".coupon-modal");
  if (modal.classList.contains("active")) {
    modal.classList.remove("active");
  } else {
    modal.classList.add("active");

    const asideMenu = document.querySelector(".aside");
    asideMenu.classList.remove("open");

    const menu = document.querySelector(".menu");
    const menuIcon = menu.querySelector("i");

    menuIcon.classList.remove("fa-xmark");
    menuIcon.classList.add("fa-bars");

    const closeBtn = modal.querySelector(".close-modal");
    closeBtn.onclick = () => modal.classList.remove("active");
  }

  const list = modal.querySelector(".coupon-list");
  createCouponCard(isActiveNotUtilized, list);

  const filterBtns = document.querySelectorAll(".input-filter");
  filterBtns[0].checked = true;
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      const filter = ev.currentTarget.value;

      switch (filter) {
        case "biggestDiscount":
          createCouponCard(biggestDiscountNotUtilized, list);
          break;

        case "usaged":
          createCouponCard(data.couponUsage, list);
          break;

        default:
          createCouponCard(isActiveNotUtilized, list);
          break;
      }
    });
  });
}

function itemsAsideAction(token, userData) {
  const items = document.querySelectorAll(".list-aside-item");
  items.forEach((i) => {
    i.addEventListener("click", (ev) => {
      const button = ev.currentTarget.querySelector("button");
      const text = button.textContent.trim();

      switch (text) {
        case "Meus pedidos":
          alert("Meus pedidos modal");
          break;

        case "Meu carrinho":
          openCartModal(token, userData.cart.id);
          break;

        case "Cupons":
          openCouponModal(token, userData.id);
          break;

        default:
          return;
      }
    });
  });
}

function menuCategoryMap(category) {
  const categories = {
    BURGER: "Carne",
    PIZZA: "Pizza",
    SUSHI: "Japonês",
    SANDWICH: "Frango",
    DRINK: "Bebidas",
    DESSERT: "Sobremesas",
    SALAD: "Salada",
    SOUP: "Sopa",
    SNACK: "Lanche",
    BREAKFAST: "Café da manhã",
    VEGAN: "Vegano",
    VEGETARIAN: "Vegetariano",
    OTHERS: "Outros",
  };

  return categories[category] || category;
}

async function commentReq({ restaurantId, userId, comment, rating }, token) {
  showLoader();

  try {
    const response = await fetch(
      `${BASE_URL}/api/restaurant/${restaurantId}/comment/${userId}`,
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment, rating }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    messageAnimated(
      error.message,
      4000,
      "top",
      "right",
      "6px",
      "rgb(198, 48, 48)",
      "#fff",
      "500"
    );
  } finally {
    hideLoader();
  }
}

function submitComment(restaurantId, token) {
  const commentForm = document.getElementById("comment-form");
  commentForm.onsubmit = async (ev) => {
    ev.preventDefault();
    const input = document.getElementById("comment-input");

    const value = input.value.trim();
    if (!value || value.length < 3 || value.length > 300) {
      messageAnimated(
        "O comentário é obrigatório (3 a 300 caracteres).",
        3000,
        "top",
        "right",
        "6px",
        "rgb(198, 48, 48)",
        "#fff",
        "500"
      );
      return;
    }

    const ratingCheckbox = document.querySelector(
      'input[name="rating"]:checked'
    );

    if (!ratingCheckbox) {
      messageAnimated(
        "Escolha uma nota antes de continuar.",
        3000,
        "top",
        "right",
        "6px",
        "rgb(198, 48, 48)",
        "#fff",
        "500"
      );
      return;
    }

    const actualUser = await me(token);

    const data = {
      rating: +ratingCheckbox.value,
      comment: value,
      userId: actualUser.id,
      restaurantId,
    };

    await commentReq({ ...data }, token);
    const restaurant = await restaurantById(token, restaurantId);

    if (restaurant || restaurant.length > 0) {
      console.log(restaurant);
      showRestaurantInfo(restaurant, token);
    }
  };
}

function showRestaurantInfo(data, token) {
  const content = document.querySelector(".modal-data-restaurant");

  if (content) {
    content.classList.add("active");

    function handleOutsideClick(ev) {
      if (ev.target === content) {
        content.classList.remove("active");
        content.removeEventListener("click", handleOutsideClick);
      }
    }

    content.addEventListener("click", handleOutsideClick);

    const infoCOntent = content.querySelector(".infos");
    infoCOntent.innerHTML = "";

    const menu = data.menu;

    const closeContent = document.createElement("div");
    closeContent.classList.add("close-content");
    closeContent.innerHTML = `
    <i class="fa-solid fa-reply"></i><button id="see-comments">Ver comentários</button>`;

    const commentContent = document.createElement("div");
    commentContent.classList.add("comment-content");

    commentContent.innerHTML = `
      <span class="close-comments"><i class="fa-solid fa-xmark"></i><span/>
    `;

    const commentAreaContainer = document.createElement("div");
    commentAreaContainer.classList.add("comment-area");

    const allComments = document.createElement("div");
    allComments.classList.add("all-comments");

    const commentForm = document.createElement("form");
    commentForm.id = "comment-form";
    commentForm.method = "post";

    commentForm.innerHTML = `
  <div class="rating-box">
    <input type="radio" name="rating" class="rating-input" id="star5" value="5">
    <label for="star5"><i class="fa-solid fa-star"></i></label>

    <input type="radio" name="rating" class="rating-input" id="star4" value="4">
    <label for="star4"><i class="fa-solid fa-star"></i></label>

    <input type="radio" name="rating" class="rating-input" id="star3" value="3">
    <label for="star3"><i class="fa-solid fa-star"></i></label>

    <input type="radio" name="rating" class="rating-input" id="star2" value="2">
    <label for="star2"><i class="fa-solid fa-star"></i></label>

    <input type="radio" name="rating" class="rating-input" id="star1" value="1">
    <label for="star1"><i class="fa-solid fa-star"></i></label>
  </div>

  <div class="submit-content">
    <input type="text" id="comment-input" placeholder="Comentar..." />

  <button type="submit">
    <i class="fa-regular fa-paper-plane"></i>
  </button>
  <div/>
`;

    commentAreaContainer.append(allComments, commentForm);
    commentContent.append(commentAreaContainer);

    if (data.comments && data.comments.length > 0) {
      data.comments.forEach((comment) => {
        const card = document.createElement("div");
        card.classList.add("comment-card");

        const createdDate = new Date(comment.createdAt).toLocaleDateString(
          "pt-BR",
          {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }
        );

        card.innerHTML = `
      <div class="comment-header">
        <div class="user-avatar">${comment.user.username.charAt(0)}</div>
        <div>
          <h4 class="username">${comment.user.username}</h4>
          <span class="comment-date">${createdDate}</span>
        </div>
        <div class="rating">
          <i class="fa-solid fa-star"></i>
          <span>${comment.rating}</span>
        </div>
      </div>

      <p class="comment-text">${comment.comment}</p>
    `;

        allComments.appendChild(card);
      });
    } else {
      allComments.innerHTML = `
        <p class="no-comment">Nenhuma avaliação disponível</p>
      `;
    }

    const topDataInfo = document.createElement("div");
    topDataInfo.classList.add("top-data-info");

    const logoContent = document.createElement("div");
    logoContent.classList.add("logo");

    data.logoUrl
      ? (logoContent.innerHTML = `<img src=${data.logoUrl} alt=${data.name}/>`)
      : (logoContent.innerHTML = `<span>Imagem do restaurante</span>`);

    const restaurantData = document.createElement("div");
    restaurantData.classList.add("restaurant-data");

    restaurantData.innerHTML = `
      <h2 class="restaurant-title">${data.name}</h2>

            <div class="avaliation-content">
              ${
                data.avaliation
                  ? `<span>${data.avaliation.toFixed(1)}</span>`
                  : `<span>0</span>`
              }
              <i class="fa-solid fa-star"></i>
            </div>
    `;

    topDataInfo.append(logoContent, restaurantData);

    const address = document.createElement("p");
    address.classList.add("restaurant-local");
    address.innerHTML = `${
      data.local ? `${data.local}` : `Endereço não disponível`
    }`;

    infoCOntent.append(closeContent, topDataInfo, address);

    if (content.classList.contains("active")) {
      document.querySelector(".fa-reply").addEventListener("click", () => {
        content.classList.toggle("active");
      });
    }

    infoCOntent.append(commentContent);

    const openCommentBtn = document.getElementById("see-comments");
    openCommentBtn.addEventListener("click", () => {
      const modal = document.querySelector(".comment-content");
      modal.classList.toggle("active");

      document
        .querySelector(".close-comments")
        .addEventListener("click", () => {
          if (modal.classList.contains("active")) {
            modal.classList.remove("active");
          }
        });

      submitComment(data.id, token);
    });

    if (!menu || menu.length === 0) {
      const dontHaveMenu = document.createElement("p");
      dontHaveMenu.classList.add("dont-have-menu");
      dontHaveMenu.textContent = "Cardápio indisponível.";
      infoCOntent.append(dontHaveMenu);
      return;
    }

    const h2 = document.createElement("h2");
    h2.textContent = "• Menu •";

    const menuContent = document.createElement("div");
    menuContent.classList.add("menu-content");

    infoCOntent.append(h2, menuContent);

    const categories = [...new Set(menu.map((m) => m.category))];

    categories.forEach((cat) => {
      const data = menu.filter((m) => m.category === cat);

      if (data.length > 0) {
        createMenuCard(data, menuCategoryMap(cat), token);
      }
    });
  }
}

async function getDataRestaurantCard(token) {
  const cards = document.querySelectorAll(".restaurant-card");
  cards.forEach((card) => {
    const newCard = card.cloneNode(true);
    card.parentNode.replaceChild(newCard, card);

    newCard.addEventListener("click", async (ev) => {
      const restaurantId = ev.currentTarget.dataset.restaurantId;
      const isOpen = ev.currentTarget.dataset.isopen === "true";

      if (!isOpen) {
        messageAnimated(
          "Estabelecimento fechado.",
          2500,
          "top",
          "right",
          "6px",
          "rgb(198, 48, 48)",
          "#fff",
          "500"
        );
        return;
      }

      const restaurantDt = await restaurantById(token, Number(restaurantId));
      showRestaurantInfo(restaurantDt, token);
    });
  });
}

function formatCategory(category, isPortuguese) {
  if (isPortuguese) {
    const categoryMap = {
      fastfood: "FAST_FOOD",
      italiana: "ITALIAN",
      japonesa: "JAPANESE",
      chinesa: "CHINESE",
      mexicana: "MEXICAN",
      vegetariana: "VEGETARIAN",
      pizzaria: "PIZZA",
      hamburgueria: "BURGER",
      frutosdomar: "SEAFOOD",
      padaria: "BAKERY",
      cafeteria: "COFFEE_SHOP",
      sobremesa: "DESSERT",
    };
    return categoryMap[category] || category;
  } else {
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
}

function messageAnimated(
  message,
  duration,
  gravity,
  position,
  borderRadius,
  background,
  color,
  fontWeight
) {
  Toastify({
    text: message,
    duration: duration,
    gravity: gravity, // top ou bottom
    position: position, // left, center ou right
    stopOnFocus: true, // não fecha se mouse estiver em cima
    style: {
      background: background,
      color: color,
      fontWeight: fontWeight,
      borderRadius: borderRadius, // Em pixel,
    },
  }).showToast();
}

async function startApp(user, token) {
  console.log(user);

  switchUserTheme(user.favoriteTheme);
  insertUserData(user, token);
  openMobileMenu();
  createContentRestaurant(token);
  itemsAsideAction(token, user);

  const searchInput = document.getElementById("query");
  let searchTimeout;

  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);

    const query = searchInput.value.trim();

    if (query.length < 1) {
      createContentRestaurant(token);
      return;
    }

    const categories = [
      "FAST_FOOD",
      "ITALIAN",
      "JAPANESE",
      "CHINESE",
      "MEXICAN",
      "VEGETARIAN",
      "PIZZA",
      "BURGER",
      "SEAFOOD",
      "BAKERY",
      "COFFEE_SHOP",
      "DESSERT",
    ];

    searchTimeout = setTimeout(async () => {
      const matchedCategories = categories.filter((c) =>
        c.toLowerCase().includes(query)
      );

      const ptCategory = formatCategory(matchedCategories[0], true);
      if (matchedCategories.length > 0) {
        const restaurant = await getRestaurant(
          token,
          `?pageSize=10&category=${ptCategory}`
        );
        const data = restaurant.data;

        if (data && data.length > 0) {
          insertRestaurantData(data, `Resultado para "${query}"`, false, token);
        } else {
          createContentRestaurant(token);
        }
        return;
      }

      const restaurant = await getRestaurant(
        token,
        `?pageSize=10&name=${query}`
      );
      const data = restaurant.data;

      if (data && data.length > 0) {
        insertRestaurantData(data, `Resultado para "${query}"`, false, token);
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
