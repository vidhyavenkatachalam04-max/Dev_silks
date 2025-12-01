// Storage keys
const STORE_KEY = "devpure_sarees";
const CART_KEY = "devpure_cart";
const PIN_KEY = "devpure_admin_pin";

// Utilities
const readJSON = (k, fallback) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; }
};
const writeJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const currency = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const toast = (msg) => {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 1800);
};

// Seed demo data if none
function ensureSeed() {
  const existing = readJSON(STORE_KEY, []);
  if (existing.length) return;
  const demo = [
    { id: crypto.randomUUID(), color: "Royal Blue", price: 3899, notes: "Kanchipuram silk", image: null, sample: "https://images.unsplash.com/photo-1542060748-10c28b62716b?q=80&w=600&auto=format&fit=crop" },
    { id: crypto.randomUUID(), color: "Crimson Red", price: 4499, notes: "Handloom", image: null, sample: "https://images.unsplash.com/photo-1536530956931-13fa1ff7b51d?q=80&w=600&auto=format&fit=crop" },
    { id: crypto.randomUUID(), color: "Emerald Green", price: 3299, notes: "Soft silk", image: null, sample: "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=600&auto=format&fit=crop" },
    { id: crypto.randomUUID(), color: "Gold", price: 5599, notes: "Banarasi", image: null, sample: "https://images.unsplash.com/photo-1547394765-185e1e68f04e?q=80&w=600&auto=format&fit=crop" },
  ];
  writeJSON(STORE_KEY, demo);
}

// Image handling: convert file to data URL
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

// Shop init
function initShop() {
  ensureSeed();
  const products = readJSON(STORE_KEY, []);
  const cart = readJSON(CART_KEY, []);
  const grid = document.getElementById("product-grid");
  const sortSel = document.getElementById("sort-price");
  const colorSel = document.getElementById("filter-color");
  const searchInput = document.getElementById("search-text");
  const resetBtn = document.getElementById("reset-filters");
  const cartToggle = document.getElementById("cart-toggle");
  const cartClose = document.getElementById("cart-close");
  const cartCount = document.getElementById("cart-count");

  // Populate color filter options
  const colors = Array.from(new Set(products.map(p => p.color.trim()))).filter(Boolean).sort();
  colors.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    colorSel.appendChild(opt);
  });

  // Render products
  function renderList() {
    const sort = sortSel.value;
    const color = colorSel.value;
    const q = searchInput.value.trim().toLowerCase();

    let list = readJSON(STORE_KEY, []);

    // Filter
    if (color !== "all") list = list.filter(p => p.color.toLowerCase() === color.toLowerCase());
    if (q) list = list.filter(p =>
      p.color.toLowerCase().includes(q) || (p.notes ?? "").toLowerCase().includes(q)
    );

    // Sort
    if (sort === "asc") list.sort((a,b) => a.price - b.price);
    if (sort === "desc") list.sort((a,b) => b.price - a.price);

    // Render
    grid.innerHTML = "";
    list.forEach(p => {
      const card = document.createElement("div");
      card.className = "card";

      const img = document.createElement("img");
      img.src = p.image ?? p.sample;
      img.alt = `${p.color} saree`;

      const body = document.createElement("div");
      body.className = "card-body";

      const title = document.createElement("h4");
      title.className = "card-title";
      title.textContent = p.notes ? p.notes : "Silk Saree";

      const meta = document.createElement("div");
      meta.className = "meta";
      const colorEl = document.createElement("span");
      colorEl.textContent = p.color;
      const priceEl = document.createElement("span");
      priceEl.className = "price";
      priceEl.textContent = currency(p.price);
      meta.append(colorEl, priceEl);

      const actions = document.createElement("div");
      actions.className = "actions";
      const addBtn = document.createElement("button");
      addBtn.className = "primary";
      addBtn.textContent = "Add to cart";
      addBtn.onclick = () => {
        const cart = readJSON(CART_KEY, []);
        const existingIndex = cart.findIndex(i => i.id === p.id);
        if (existingIndex > -1) {
          cart[existingIndex].qty += 1;
        } else {
          cart.push({ id: p.id, color: p.color, price: p.price, notes: p.notes, image: p.image ?? p.sample, qty: 1 });
        }
        writeJSON(CART_KEY, cart);
        updateCartCount();
        toast("Added to cart");
      };

      actions.appendChild(addBtn);

      card.append(img);
      body.append(title, meta);
      card.append(body, actions);
      grid.appendChild(card);
    });
  }

  function updateCartCount() {
    const cart = readJSON(CART_KEY, []);
    const count = cart.reduce((sum, i) => sum + i.qty, 0);
    cartCount.textContent = count;
  }

  // Cart panel
  const cartPanel = document.getElementById("cart-panel");
  const cartItemsEl = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("checkout-button");

  function openCart() {
    cartPanel.classList.add("open");
    renderCart();
  }
  function closeCart() { cartPanel.classList.remove("open"); }

  function renderCart() {
    const cart = readJSON(CART_KEY, []);
    cartItemsEl.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
      total += item.price * item.qty;
      const row = document.createElement("div");
      row.className = "cart-item";

      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.color;

      const info = document.createElement("div");
      info.className = "cart-item-info";
      const title = document.createElement("div");
      title.textContent = item.notes ? `${item.notes} — ${item.color}` : item.color;
      const price = document.createElement("div");
      price.innerHTML = `${currency(item.price)} × ${item.qty}`;

      const controls = document.createElement("div");
      controls.style.display = "flex";
      controls.style.gap = "8px";
      const inc = document.createElement("button");
      inc.textContent = "+";
      const dec = document.createElement("button");
      dec.textContent = "-";
      const del = document.createElement("button");
      del.textContent = "Remove";

      inc.onclick = () => { item.qty += 1; writeJSON(CART_KEY, cart); renderCart(); updateCartCount(); };
      dec.onclick = () => {
        item.qty = Math.max(1, item.qty - 1);
        writeJSON(CART_KEY, cart); renderCart(); updateCartCount();
      };
      del.onclick = () => {
        const filtered = cart.filter(i => i.id !== item.id);
        writeJSON(CART_KEY, filtered); renderCart(); updateCartCount(); toast("Removed from cart");
      };

      controls.append(inc, dec, del);
      info.append(title, price, controls);
      row.append(img, info);
      cartItemsEl.appendChild(row);
    });

    cartTotalEl.textContent = currency(total);
  }

  checkoutBtn.onclick = () => {
    toast("Checkout is a demo — contact shop to purchase.");
  };

  cartToggle.onclick = openCart;
  cartClose.onclick = closeCart;

  // Filters and search
  sortSel.onchange = renderList;
  colorSel.onchange = renderList;
  searchInput.oninput = renderList;
  resetBtn.onclick = () => {
    sortSel.value = "none";
    colorSel.value = "all";
    searchInput.value = "";
    renderList();
  };

  updateCartCount();
  renderList();
}

// Admin init
function initAdmin() {
  ensureSeed();

  const authSection = document.getElementById("admin-auth");
  const panel = document.getElementById("admin-panel");
  const loginBtn = document.getElementById("login-btn");
  const setPinBtn = document.getElementById("set-pin-btn");
  const pinInput = document.getElementById("admin-pin");
  const pinSetInput = document.getElementById("admin-pin-set");

  const uploadForm = document.getElementById("upload-form");
  const adminGrid = document.getElementById("admin-stock");
  const exportBtn = document.getElementById("export-data");
  const importBtn = document.getElementById("import-data");
  const importFile = document.getElementById("import-file");
  const clearBtn = document.getElementById("clear-stock");

  function isAuthed() { return sessionStorage.getItem("devpure_authed") === "1"; }
  function showPanel(show) {
    panel.hidden = !show;
    authSection.hidden = show;
  }

  // PIN logic
  loginBtn.onclick = () => {
    const storedPin = localStorage.getItem(PIN_KEY);
    const entered = pinInput.value.trim();
    if (!storedPin) { toast("No PIN set. Please set a PIN first."); return; }
    if (entered && entered === storedPin) {
      sessionStorage.setItem("devpure_authed", "1");
      showPanel(true);
      toast("Logged in");
      renderAdminGrid();
    } else {
      toast("Invalid PIN");
    }
  };

  setPinBtn.onclick = () => {
    const newPin = pinSetInput.value.trim();
    if (!newPin || newPin.length < 4 || newPin.length > 8) {
      toast("PIN must be 4–8 characters");
      return;
    }
    localStorage.setItem(PIN_KEY, newPin);
    toast("PIN set");
  };

  if (isAuthed()) { showPanel(true); renderAdminGrid(); }

  // Upload form
  uploadForm.onsubmit = async (e) => {
    e.preventDefault();
    const file = document.getElementById("saree-image").files[0];
    const color = document.getElementById("saree-color").value.trim();
    const price = Number(document.getElementById("saree-price").value);
    const notes = document.getElementById("saree-notes").value.trim();

    if (!file) { toast("Please select an image"); return; }
    if (!color) { toast("Color is required"); return; }
    if (!(price >= 0)) { toast("Price must be a number"); return; }

    const dataURL = await fileToDataURL(file);
    const items = readJSON(STORE_KEY, []);
    const item = { id: crypto.randomUUID(), color, price, notes, image: dataURL };
    items.push(item);
    writeJSON(STORE_KEY, items);
    toast("Saree added to stock");
    uploadForm.reset();
    renderAdminGrid();
  };

  function renderAdminGrid() {
    const items = readJSON(STORE_KEY, []);
    adminGrid.innerHTML = "";
    items.forEach(p => {
      const card = document.createElement("div");
      card.className = "card";
      const img = document.createElement("img");
      img.src = p.image ?? p.sample;
      img.alt = p.color;
      const body = document.createElement("div");
      body.className = "card-body";
      const title = document.createElement("h4");
      title.className = "card-title";
      title.textContent = p.notes ? p.notes : "Silk Saree";
      const meta = document.createElement("div");
      meta.className = "meta";
      const colorEl = document.createElement("span");
      colorEl.textContent = p.color;
      const priceEl = document.createElement("span");
      priceEl.className = "price";
      priceEl.textContent = currency(p.price);
      meta.append(colorEl, priceEl);

      const del = document.createElement("button");
      del.className = "delete-btn";
      del.textContent = "Delete";
      del.onclick = () => {
        const next = readJSON(STORE_KEY, []).filter(i => i.id !== p.id);
        writeJSON(STORE_KEY, next);
        toast("Deleted");
        renderAdminGrid();
      };

      card.append(img);
      body.append(title, meta);
      card.append(body);
      card.append(del);
      adminGrid.appendChild(card);
    });
  }

  // Export / Import / Clear
  exportBtn.onclick = () => {
    const data = readJSON(STORE_KEY, []);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "devpure_sarees.json";
    a.click();
    URL.revokeObjectURL(url);
    toast("Exported JSON");
  };

  importBtn.onclick = () => importFile.click();
  importFile.onchange = async () => {
    const file = importFile.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error("Invalid format");
      writeJSON(STORE_KEY, data);
      toast("Imported JSON");
      renderAdminGrid();
    } catch {
      toast("Import failed");
    } finally {
      importFile.value = "";
    }
  };

  clearBtn.onclick = () => {
    if (confirm("Clear all stock? This cannot be undone.")) {
      writeJSON(STORE_KEY, []);
      toast("Stock cleared");
      renderAdminGrid();
    }
  };
}