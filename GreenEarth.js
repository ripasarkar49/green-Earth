// Endpoints
const API_BASE = 'https://openapi.programming-hero.com/api';
const ENDPOINTS = {
  categories: API_BASE + '/categories',
  allPlants: API_BASE + '/plants',
  category: (id) => API_BASE + '/category/' + id,
  plant: (id) => API_BASE + '/plant/' + id
};

// App state
let categories = [];
let activeCategoryId = null;
let cart = [];

// DOM refs
const categoriesEl = document.getElementById('categories');
const cardsEl = document.getElementById('cards');
const spinnerEl = document.getElementById('spinner');
const cartListEl = document.getElementById('cart-list');
const cartTotalEl = document.getElementById('cart-total');
const modalEl = document.getElementById('modal');
const modalContentEl = document.getElementById('modal-content');
const modalCloseBtn = document.getElementById('modal-close');

// Spinner functions
function showSpinner() { spinnerEl.classList.remove('hidden'); }
function hideSpinner() { spinnerEl.classList.add('hidden'); }

// Load categories
async function loadCategories() {
  try {
    showSpinner();
    const res = await fetch(ENDPOINTS.categories);
    const data = await res.json();
    categories = (data && (data.data || data.categories)) || [];
    renderCategories();
  } catch (err) {
    console.error('Failed to load categories', err);
    categoriesEl.innerHTML = '<div class="text-red-500">Failed to load categories</div>';
  } finally {
    hideSpinner();
  }
}

function renderCategories() {
  categoriesEl.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.textContent = 'All Plants';
  allBtn.className = btnClass(null);
  allBtn.addEventListener('click', () => selectCategory(null));
  categoriesEl.appendChild(allBtn);

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat.name || cat.category_name || cat.category;
    btn.className = btnClass(cat.id);
    btn.addEventListener('click', () => selectCategory(cat.id));
    categoriesEl.appendChild(btn);
  });
}

function btnClass(id) {
  const base = 'block w-full text-left px-3 py-2 rounded';
  const active = activeCategoryId === id ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200';
  return base + ' ' + active;
}

// Select category
async function selectCategory(id) {
  activeCategoryId = id;
  renderCategories();
  if (id === null) {
    await loadAllPlants();
  } else {
    await loadPlantsByCategory(id);
  }
}

// Load plants
async function loadAllPlants() {
  try {
    showSpinner();
    const res = await fetch(ENDPOINTS.allPlants);
    const data = await res.json();
    const plants = (data && (data.data || data.plants)) || [];
    renderCards(plants);
  } catch (err) {
    console.error('Failed to load plants', err);
    cardsEl.innerHTML = '<p class="text-red-500">Failed to load plants</p>';
  } finally { hideSpinner(); }
}

async function loadPlantsByCategory(catId) {
  try {
    showSpinner();
    const res = await fetch(ENDPOINTS.category(catId));
    const data = await res.json();
    const plants = (data && (data.data || data.plants || data)) || [];
    renderCards(plants);
  } catch (err) {
    console.error('Failed to load category plants', err);
    cardsEl.innerHTML = '<p class="text-red-500">Failed to load plants for this category</p>';
  } finally { hideSpinner(); }
}

// Render cards
function renderCards(plants) {
  cardsEl.innerHTML = '';
  if (!plants || plants.length === 0) {
    cardsEl.innerHTML = '<div class="p-6 bg-white rounded shadow">No plants found.</div>';
    return;
  }

  plants.forEach(p => {
    const id = p.id || p._id || p.plant_id || p.plantId;
    const name = p.name || p.plant_name || p.common_name || 'Unknown Plant';
    const description = p.short_description || p.description || 'No description';
    const category = p.category || p.category_name || 'Unknown';
    const price = (typeof p.price === 'number') ? p.price : (p.price || 'N/A');
    const image = p.image || p.img || p.image_url || 'https://openapi.programming-hero.com/api/plant/${id}';

    const card = document.createElement('article');
    card.className = 'bg-white p-4 rounded shadow-sm flex flex-col';
    card.innerHTML = `
      <div class="h-44 bg-slate-100 rounded mb-3 overflow-hidden flex items-center justify-center">
        <img src="${image}" alt="${name}" class="object-cover h-full w-full" onerror="this.src='https://openapi.programming-hero.com/api/plant/${id}'" />
      </div>
      <div class="flex-1">
        <h4 class="text-lg font-semibold cursor-pointer hover:text-emerald-700" data-id="${id}">${name}</h4>
        <p class="text-sm text-slate-600 mt-1">${truncate(description, 120)}</p>
      </div>
      <div class="mt-4 flex items-center justify-between">
        <span class="text-xs px-2 py-1 bg-emerald-100 text-emerald-800 rounded">${category}</span>
        <span class="font-semibold">৳${price}</span>
      </div>
      <button class="mt-3 w-full py-2 rounded-full bg-emerald-700 text-white add-cart-btn">Add to Cart</button>
    `;

    // Open modal on name click
    card.querySelector('h4').addEventListener('click', () => openModal(id));
    card.querySelector('.add-cart-btn').addEventListener('click', () => addToCart({ id, name, price }));

    cardsEl.appendChild(card);
  });
}

// Modal function
async function openModal(id) {
  try {
    modalContentEl.innerHTML = '<p class="text-center p-6">Loading...</p>';
    modalEl.classList.remove('hidden');

    // Fetch plant details
    const res = await fetch(`https://openapi.programming-hero.com/api/plant/${id}`);
    const data = await res.json();
    const p = data && data.plants ? data.plants : {};

    // Fallbacks
    const name = p.name || 'Unknown Plant';
    const image = p.image || 'https://via.placeholder.com/300x200?text=No+Image';
    const description = p.description || 'No more details.';
    const category = p.category || 'Unknown';
    const price = typeof p.price === 'number' ? p.price : 'N/A';

    // Render modal content 
    modalContentEl.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="h-56 md:h-80 bg-slate-100 rounded overflow-hidden">
          <img src="${image}" alt="${name}" class="w-full h-full object-cover"
               onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'" />
        </div>
        <div>
          <h2 class="text-2xl font-bold mb-2">${name}</h2>
          <p class="text-sm text-slate-600 mb-3">${description}</p>
          <span class="px-2 py-1 bg-emerald-100 text-emerald-800 rounded">${category}</span>
          <div class="mt-4 text-lg font-semibold">৳${price}</div>
        </div>
      </div>
    `;

  } catch (err) {
    console.error('Failed to load plant details', err);
    modalContentEl.innerHTML = '<p class="text-red-500 p-6">Failed to load details</p>';
  }
}

// Close modal
modalCloseBtn.addEventListener('click', () => modalEl.classList.add('hidden'));
modalEl.addEventListener('click', (e) => { if(e.target === modalEl) modalEl.classList.add('hidden'); });

// Cart functions
function addToCart(item) {
  cart.push(item);
  renderCart();
}

function removeFromCart(index) {
  if(index >=0 && index < cart.length){
    cart.splice(index, 1);
    renderCart();
  }
}

function renderCart() {
  cartListEl.innerHTML = '';
  if(cart.length === 0){
    cartListEl.innerHTML = '<div class="text-sm text-slate-600">Cart is empty</div>';
  } else {
    cart.forEach((c,i)=>{
      const row = document.createElement('div');
      row.className = 'flex items-center justify-between bg-white/40 px-2 py-2 rounded';
      row.innerHTML = `
        <div class="text-sm">
          <div class="font-medium">${c.name}</div>
          <div class="text-xs text-slate-600">৳${c.price}</div>
        </div>
        <button class="text-red-500 remove-btn" data-index="${i}">✕</button>
      `;
      row.querySelector('.remove-btn').addEventListener('click',()=>removeFromCart(i));
      cartListEl.appendChild(row);
    });
  }
  const total = cart.reduce((s,it)=>s+Number(it.price||0),0);
  cartTotalEl.textContent = '৳'+total;
}


function truncate(str,n){ if(!str) return ''; return str.length>n ? str.slice(0,n)+'...' : str; }

// Initial value 
(async function init(){
  await loadCategories();
  await selectCategory(null);
})();
