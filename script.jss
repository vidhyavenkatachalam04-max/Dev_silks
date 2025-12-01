let sarees = [];

function addSaree() {
  const fileInput = document.getElementById('image-upload');
  const price = document.getElementById('saree-price').value;
  const color = document.getElementById('saree-color').value;

  if (!fileInput.files[0] || !price || !color) {
    alert('Please fill all fields');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    sarees.push({ image: e.target.result, price: parseFloat(price), color });
    displaySarees(sarees);
  };
  reader.readAsDataURL(fileInput.files[0]);
}

function displaySarees(list) {
  const gallery = document.getElementById('saree-gallery');
  gallery.innerHTML = '';
  list.forEach((saree, index) => {
    const card = document.createElement('div');
    card.className = 'saree-card';
    card.innerHTML = `
      <img src="${saree.image}" alt="Saree ${index + 1}" />
      <p>Color: ${saree.color}</p>
      <p>Price: ₹${saree.price}</p>
    `;
    gallery.appendChild(card);
  });
}

function filterSarees() {
  const color = document.getElementById('filter-color').value;
  const maxPrice = parseFloat(document.getElementById('filter-price').value);
  const filtered = sarees.filter(s =>
    (!color || s.color === color) &&
    (!maxPrice || s.price <= maxPrice)
  );
  displaySarees(filtered);
}