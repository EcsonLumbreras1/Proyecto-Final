// Configuración
const API_URL = 'http://localhost:3000/api';
let currentAccount = null;
let provider = null;
let signer = null;
let marketplaceContract = null;
let pagosContract = null;

// Direcciones de contratos desplegados en Sepolia
const MARKETPLACE_ADDRESS = '0x264D0adDdb9a5D82c26295e75B221e7adcBd45A9';
const PAGOS_ADDRESS = '0x2027192D5B156042Fe6c3D8c5B4Ca5e25c0bb1d2';

// ABIs de los contratos
const MARKETPLACE_ABI = [
  "function agregarCarro(string memory _marca, string memory _modelo, uint256 _anio, uint256 _precio, string memory _imagenUrl, uint256 _kilometraje, string memory _color) external",
  "function comprarCarro(uint256 _carId) external payable",
  "function desactivarCarro(uint256 _carId) external",
  "function activarCarro(uint256 _carId) external",
  "function obtenerTodosLosCarros() external view returns (tuple(uint256 id, string marca, string modelo, uint256 anio, uint256 precio, address vendedor, string imagenUrl, bool disponible, uint256 kilometraje, string color)[])",
  "function obtenerCarrosDisponibles() external view returns (tuple(uint256 id, string marca, string modelo, uint256 anio, uint256 precio, address vendedor, string imagenUrl, bool disponible, uint256 kilometraje, string color)[])",
  "function obtenerCarroPorId(uint256 _carId) external view returns (tuple(uint256 id, string marca, string modelo, uint256 anio, uint256 precio, address vendedor, string imagenUrl, bool disponible, uint256 kilometraje, string color))",
  "event CarroAgregado(uint256 indexed id, string marca, string modelo, uint256 anio, uint256 precio, address vendedor)",
  "event CarroVendido(uint256 indexed id, address indexed comprador, address indexed vendedor, uint256 precio)"
];

const PAGOS_ABI = [
  "function deposit() public payable",
  "function getBalance() external view returns (uint256)",
  "function release() external",
  "function getPayees() external view returns (address[])",
  "function getShareOf(address _payee) external view returns (uint256)",
  "event Deposit(uint256 indexed depositId, address indexed sender, uint256 amount)",
  "event Release(uint256 indexed releaseId, uint256 amount)"
];

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  setupEventListeners();
  cargarCarros();
}

// Event Listeners
function setupEventListeners() {
  // Wallet
  document.getElementById('connectWallet').addEventListener('click', connectWallet);

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Marketplace
  document.getElementById('refreshCarros').addEventListener('click', cargarCarros);

  // Formulario agregar carro
  document.getElementById('agregarCarroForm').addEventListener('submit', agregarCarro);

  // Pagos
  document.getElementById('refreshBalance').addEventListener('click', cargarBalance);
  document.getElementById('depositForm').addEventListener('submit', hacerDeposito);
  document.getElementById('releaseBtn').addEventListener('click', liberarFondos);

  // Modal
  document.querySelector('.close').addEventListener('click', cerrarModal);
}

// Funciones de Wallet
async function connectWallet() {
  if (typeof window.ethereum === 'undefined') {
    showToast('Por favor instala MetaMask', 'error');
    return;
  }

  try {
    showLoading(true);
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    currentAccount = accounts[0];

    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();

    // Inicializar contratos si las direcciones están configuradas
    if (MARKETPLACE_ADDRESS) {
      marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
    }
    if (PAGOS_ADDRESS) {
      pagosContract = new ethers.Contract(PAGOS_ADDRESS, PAGOS_ABI, signer);
    }

    updateWalletUI();
    showToast('Wallet conectada exitosamente', 'success');

    // Escuchar cambios de cuenta
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', () => window.location.reload());

  } catch (error) {
    console.error('Error conectando wallet:', error);
    showToast('Error al conectar wallet', 'error');
  } finally {
    showLoading(false);
  }
}

function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    currentAccount = null;
    updateWalletUI();
  } else if (accounts[0] !== currentAccount) {
    currentAccount = accounts[0];
    updateWalletUI();
    window.location.reload();
  }
}

function updateWalletUI() {
  const walletBtn = document.getElementById('connectWallet');
  const walletAddress = document.getElementById('walletAddress');

  if (currentAccount) {
    walletBtn.textContent = 'Conectada';
    walletBtn.classList.add('btn-success');
    walletAddress.textContent = `${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`;
  } else {
    walletBtn.textContent = 'Conectar MetaMask';
    walletBtn.classList.remove('btn-success');
    walletAddress.textContent = '';
  }
}

// Funciones de Tabs
function switchTab(tabName) {
  // Actualizar botones
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  // Actualizar contenido
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(tabName).classList.add('active');

  // Cargar datos específicos del tab
  if (tabName === 'pagos') {
    cargarBalance();
    cargarBeneficiarios();
  }
  if (tabName === 'mis-compras') {
    cargarMisCompras();
  }
}

// Función para cargar mis compras
async function cargarMisCompras() {
  const grid = document.getElementById('misComprasGrid');

  if (!currentAccount) {
    grid.innerHTML = '<p class="info-message">Conecta tu wallet para ver tus compras</p>';
    return;
  }

  try {
    showLoading(true);
    const response = await fetch(`${API_URL}/marketplace/mis-compras/${currentAccount}`);
    const data = await response.json();

    if (data.success && data.compras.length > 0) {
      grid.innerHTML = data.compras.map(carro => `
        <div class="carro-card">
          <div class="carro-image">
            ${carro.imagenUrl ? `<img src="${carro.imagenUrl}" alt="${carro.marca} ${carro.modelo}">` : '<span class="no-image">Sin imagen</span>'}
          </div>
          <div class="carro-info">
            <span class="carro-status vendido">Comprado</span>
            <h3 class="carro-title">${carro.marca} ${carro.modelo}</h3>
            <div class="carro-details">
              <div class="carro-detail">
                <span>Año:</span>
                <span>${carro.anio}</span>
              </div>
              ${carro.kilometraje > 0 ? `
                <div class="carro-detail">
                  <span>Kilometraje:</span>
                  <span>${parseInt(carro.kilometraje).toLocaleString()} km</span>
                </div>
              ` : ''}
              ${carro.color ? `
                <div class="carro-detail">
                  <span>Color:</span>
                  <span>${carro.color}</span>
                </div>
              ` : ''}
            </div>
            <div class="carro-price">${carro.precio} ETH</div>
          </div>
        </div>
      `).join('');
    } else {
      grid.innerHTML = '<p class="info-message">No has comprado ningún carro todavía</p>';
    }
  } catch (error) {
    console.error('Error:', error);
    grid.innerHTML = '<p class="info-message">Error al cargar tus compras</p>';
  } finally {
    showLoading(false);
  }
}

// Funciones del Marketplace
async function cargarCarros() {
  try {
    showLoading(true);
    const response = await fetch(`${API_URL}/marketplace/carros/disponibles`);
    const data = await response.json();

    if (data.success) {
      mostrarCarros(data.carros);
    } else {
      showToast('Error al cargar carros', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showToast('Error al cargar carros', 'error');
  } finally {
    showLoading(false);
  }
}

function mostrarCarros(carros) {
  const grid = document.getElementById('carrosGrid');

  if (carros.length === 0) {
    grid.innerHTML = '<p class="info-message">No hay carros disponibles en este momento</p>';
    return;
  }

  grid.innerHTML = carros.map(carro => `
    <div class="carro-card">
      <div class="carro-image">
        ${carro.imagenUrl ? `<img src="${carro.imagenUrl}" alt="${carro.marca} ${carro.modelo}">` : '<span class="no-image">Sin imagen</span>'}
      </div>
      <div class="carro-info">
        <span class="carro-status ${carro.disponible ? 'disponible' : 'vendido'}">
          ${carro.disponible ? 'Disponible' : 'Vendido'}
        </span>
        <h3 class="carro-title">${carro.marca} ${carro.modelo}</h3>
        <div class="carro-details">
          <div class="carro-detail">
            <span>Año:</span>
            <span>${carro.anio}</span>
          </div>
          ${carro.kilometraje > 0 ? `
            <div class="carro-detail">
              <span>Kilometraje:</span>
              <span>${parseInt(carro.kilometraje).toLocaleString()} km</span>
            </div>
          ` : ''}
          ${carro.color ? `
            <div class="carro-detail">
              <span>Color:</span>
              <span>${carro.color}</span>
            </div>
          ` : ''}
        </div>
        <div class="carro-price">${carro.precio} ETH</div>
        ${carro.disponible ? `
          <div class="carro-actions">
            <button class="btn btn-success" onclick="abrirModalCompra(${carro.id}, '${carro.marca}', '${carro.modelo}', ${carro.precio})">
              Comprar
            </button>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

async function agregarCarro(e) {
  e.preventDefault();

  if (!currentAccount) {
    showToast('Por favor conecta tu wallet primero', 'warning');
    return;
  }

  const formData = {
    marca: document.getElementById('marca').value,
    modelo: document.getElementById('modelo').value,
    anio: document.getElementById('anio').value,
    precio: document.getElementById('precio').value,
    imagenUrl: document.getElementById('imagenUrl').value || '',
    kilometraje: document.getElementById('kilometraje').value || 0,
    color: document.getElementById('color').value || '',
    privateKey: prompt('Ingresa tu private key para firmar la transacción:')
  };

  if (!formData.privateKey) {
    showToast('Se requiere la private key', 'error');
    return;
  }

  try {
    showLoading(true);
    const response = await fetch(`${API_URL}/marketplace/agregar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (data.success) {
      showToast('Carro agregado exitosamente', 'success');
      document.getElementById('agregarCarroForm').reset();
      cargarCarros();
      switchTab('marketplace');
    } else {
      showToast(data.message || 'Error al agregar carro', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showToast('Error al agregar carro', 'error');
  } finally {
    showLoading(false);
  }
}

// Modal de compra
let carroSeleccionado = null;

function abrirModalCompra(id, marca, modelo, precio) {
  if (!currentAccount) {
    showToast('Por favor conecta tu wallet primero', 'warning');
    return;
  }

  carroSeleccionado = { id, marca, modelo, precio };

  const modalInfo = document.getElementById('modalCarroInfo');
  modalInfo.innerHTML = `
    <div class="carro-details">
      <div class="carro-detail">
        <span>Vehículo:</span>
        <span><strong>${marca} ${modelo}</strong></span>
      </div>
      <div class="carro-detail">
        <span>Precio:</span>
        <span><strong>${precio} ETH</strong></span>
      </div>
      <div class="carro-detail">
        <span>Tu cuenta:</span>
        <span>${currentAccount.slice(0, 10)}...</span>
      </div>
    </div>
  `;

  document.getElementById('comprarModal').classList.add('active');
  document.getElementById('confirmarCompra').onclick = confirmarCompra;
}

function cerrarModal() {
  document.getElementById('comprarModal').classList.remove('active');
  carroSeleccionado = null;
}

async function confirmarCompra() {
  if (!carroSeleccionado) return;

  const privateKey = prompt('Ingresa tu private key para firmar la transacción:');
  if (!privateKey) {
    showToast('Se requiere la private key', 'error');
    return;
  }

  // Guardar datos antes de cerrar el modal
  const carId = carroSeleccionado.id;
  const precio = carroSeleccionado.precio;

  try {
    showLoading(true);
    cerrarModal();

    const response = await fetch(`${API_URL}/marketplace/comprar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        carId: carId,
        precio: precio,
        privateKey: privateKey
      })
    });

    const data = await response.json();

    if (data.success) {
      showToast('¡Compra exitosa! El carro es tuyo', 'success');
      cargarCarros();
    } else {
      showToast(data.message || 'Error al comprar carro', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showToast('Error al procesar la compra', 'error');
  } finally {
    showLoading(false);
  }
}

// Funciones de Pagos
async function cargarBalance() {
  try {
    const response = await fetch(`${API_URL}/pagos/balance`);
    const data = await response.json();

    if (data.success) {
      document.getElementById('contractBalance').textContent = parseFloat(data.balance).toFixed(4);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function hacerDeposito(e) {
  e.preventDefault();

  if (!currentAccount) {
    showToast('Por favor conecta tu wallet primero', 'warning');
    return;
  }

  const amount = document.getElementById('depositAmount').value;
  const privateKey = prompt('Ingresa tu private key para firmar la transacción:');

  if (!privateKey) {
    showToast('Se requiere la private key', 'error');
    return;
  }

  try {
    showLoading(true);

    const response = await fetch(`${API_URL}/pagos/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, privateKey })
    });

    const data = await response.json();

    if (data.success) {
      showToast('Depósito exitoso', 'success');
      document.getElementById('depositAmount').value = '';
      cargarBalance();
    } else {
      showToast(data.message || 'Error al hacer depósito', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showToast('Error al hacer depósito', 'error');
  } finally {
    showLoading(false);
  }
}

async function liberarFondos() {
  if (!currentAccount) {
    showToast('Por favor conecta tu wallet primero', 'warning');
    return;
  }

  const privateKey = prompt('Ingresa tu private key para firmar la transacción:');

  if (!privateKey) {
    showToast('Se requiere la private key', 'error');
    return;
  }

  try {
    showLoading(true);

    const response = await fetch(`${API_URL}/pagos/release`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ privateKey })
    });

    const data = await response.json();

    if (data.success) {
      showToast('Fondos liberados exitosamente', 'success');
      cargarBalance();
    } else {
      showToast(data.message || 'Error al liberar fondos', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showToast('Error al liberar fondos', 'error');
  } finally {
    showLoading(false);
  }
}

async function cargarBeneficiarios() {
  try {
    const response = await fetch(`${API_URL}/pagos/payees`);
    const data = await response.json();

    if (data.success) {
      const lista = document.getElementById('payeesList');
      lista.innerHTML = data.payees.map(payee => `
        <div class="payee-item">
          ${payee.slice(0, 10)}...${payee.slice(-8)}
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Utilidades
function showLoading(show) {
  const spinner = document.getElementById('loadingSpinner');
  if (show) {
    spinner.classList.add('active');
  } else {
    spinner.classList.remove('active');
  }
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
