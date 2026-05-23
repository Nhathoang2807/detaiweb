const CART_KEY = "hoangkitchen_cart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function parsePrice(text) {
  if (!text) return 0;
  const match = text.replace(/,/g, ".").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function getPriceText(card) {
  const shopPrice = card.querySelector(".shop-price span");
  if (shopPrice) return shopPrice.textContent.trim();

  const detailPrice = card.querySelector(".detail-price span");
  if (detailPrice) return detailPrice.textContent.trim();

  const price = card.querySelector(".price");
  if (price) {
    const clone = price.cloneNode(true);
    clone.querySelectorAll("del").forEach((item) => item.remove());
    return clone.textContent.trim();
  }

  return "$0";
}

function getProductFromButton(button) {
  const productBox =
    button.closest(".shop-card") ||
    button.closest(".showcase-card") ||
    button.closest(".detail-container");

  if (!productBox) return null;

  const nameEl = productBox.querySelector("h1") || productBox.querySelector("h3");
  const imageEl =
    productBox.querySelector("#mainImage") ||
    productBox.querySelector(".main-product-img img") ||
    productBox.querySelector("img");
  const priceText = getPriceText(productBox);
  const quantityEl = productBox.querySelector(".quantity-box span");

  return {
    id: (nameEl ? nameEl.textContent.trim() : "Sản phẩm") + "_" + priceText,
    name: nameEl ? nameEl.textContent.trim() : "Sản phẩm",
    priceText: priceText,
    price: parsePrice(priceText),
    image: imageEl ? imageEl.getAttribute("src") : "",
    quantity: quantityEl ? Number(quantityEl.textContent.trim()) || 1 : 1,
  };
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += product.quantity;
  } else {
    cart.push(product);
  }

  saveCart(cart);
}

function updateCartCount() {
  const count = getCart().reduce((total, item) => total + item.quantity, 0);
  document.querySelectorAll(".cart-count").forEach((item) => {
    item.textContent = count;
    item.style.display = count > 0 ? "inline-flex" : "none";
  });
}

function setupAddToCartButtons() {
  const buttons = document.querySelectorAll("button, .detail-add-cart");

  buttons.forEach((button) => {
    const text = button.textContent.trim().toUpperCase();
    if (!text.includes("THÊM VÀO GIỎ") && !text.includes("ADD TO CART")) return;

    button.addEventListener("click", function () {
      const product = getProductFromButton(button);
      if (!product) return;

      addToCart(product);
      updateCartCount();
      window.location.href = "cart.html";
    });
  });
}

function setupQuantityButtons() {
  document.querySelectorAll(".quantity-box").forEach((box) => {
    const buttons = box.querySelectorAll("button");
    const number = box.querySelector("span");
    if (buttons.length < 2 || !number) return;

    buttons[0].addEventListener("click", function () {
      let value = Number(number.textContent.trim()) || 1;
      if (value > 1) value--;
      number.textContent = value;
    });

    buttons[1].addEventListener("click", function () {
      let value = Number(number.textContent.trim()) || 1;
      number.textContent = value + 1;
    });
  });
}

function renderCartPage() {
  const cartList = document.getElementById("cartList");
  const cartTotal = document.getElementById("cartTotal");
  const emptyCart = document.getElementById("emptyCart");
  const orderForm = document.getElementById("orderForm");
  const clearCartBtn = document.getElementById("clearCartBtn");

  if (!cartList) return;

  const cart = getCart();
  cartList.innerHTML = "";

  if (cart.length === 0) {
    emptyCart.style.display = "block";
    cartTotal.textContent = "$0.00";
    return;
  }

  emptyCart.style.display = "none";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <p>Giá: ${item.priceText}</p>
        <p>Số lượng: ${item.quantity}</p>
      </div>
      <button class="remove-cart-item" data-index="${index}">Xóa</button>
    `;

    cartList.appendChild(row);
  });

  cartTotal.textContent = "$" + total.toFixed(2);

  document.querySelectorAll(".remove-cart-item").forEach((button) => {
    button.addEventListener("click", function () {
      const index = Number(this.dataset.index);
      const newCart = getCart();
      newCart.splice(index, 1);
      saveCart(newCart);
      renderCartPage();
      updateCartCount();
    });
  });

  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", function () {
      localStorage.removeItem(CART_KEY);
      renderCartPage();
      updateCartCount();
    });
  }

  if (orderForm) {
    orderForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (getCart().length === 0) {
        alert("Giỏ hàng của bạn đang trống!");
        return;
      }

      alert("Đặt hàng thành công! Cảm ơn bạn đã mua hàng tại HoangKitchen.");
      localStorage.removeItem(CART_KEY);
      orderForm.reset();
      renderCartPage();
      updateCartCount();
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  setupAddToCartButtons();
  setupQuantityButtons();
  renderCartPage();
  updateCartCount();
});
