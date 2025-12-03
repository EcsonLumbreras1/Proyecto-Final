require('dotenv').config({ path: require('find-config')('.env') });
const { ethers } = require('ethers');

// Configuración del provider
const provider = new ethers.JsonRpcProvider(process.env.API_URL);
const contractAddress = process.env.MARKETPLACE_CONTRACT_ADDRESS;

// ABI del contrato Marketplace
const contractABI = [
  "function agregarCarro(string memory _marca, string memory _modelo, uint256 _anio, uint256 _precio, string memory _imagenUrl, uint256 _kilometraje, string memory _color) external",
  "function comprarCarro(uint256 _carId) external payable",
  "function desactivarCarro(uint256 _carId) external",
  "function activarCarro(uint256 _carId) external",
  "function obtenerTodosLosCarros() external view returns (tuple(uint256 id, string marca, string modelo, uint256 anio, uint256 precio, address vendedor, string imagenUrl, bool disponible, uint256 kilometraje, string color)[])",
  "function obtenerCarrosDisponibles() external view returns (tuple(uint256 id, string marca, string modelo, uint256 anio, uint256 precio, address vendedor, string imagenUrl, bool disponible, uint256 kilometraje, string color)[])",
  "function obtenerCarroPorId(uint256 _carId) external view returns (tuple(uint256 id, string marca, string modelo, uint256 anio, uint256 precio, address vendedor, string imagenUrl, bool disponible, uint256 kilometraje, string color))",
  "function obtenerMisCompras(address _comprador) external view returns (uint256[])",
  "function actualizarPrecio(uint256 _carId, uint256 _nuevoPrecio) external",
  "event CarroAgregado(uint256 indexed id, string marca, string modelo, uint256 anio, uint256 precio, address vendedor)",
  "event CarroVendido(uint256 indexed id, address indexed comprador, address indexed vendedor, uint256 precio)"
];

// Función para agregar un carro
async function agregarCarro(marca, modelo, anio, precio, imagenUrl, kilometraje, color, accountPrivateKey) {
  try {
    const wallet = new ethers.Wallet(accountPrivateKey, provider);
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);

    const precioEnWei = ethers.parseEther(precio.toString());
    const tx = await contract.agregarCarro(marca, modelo, anio, precioEnWei, imagenUrl, kilometraje, color);
    const receipt = await tx.wait();

    return receipt;
  } catch (error) {
    throw new Error(`Error al agregar carro: ${error.message}`);
  }
}

// Función para comprar un carro
async function comprarCarro(carId, precio, accountPrivateKey) {
  try {
    const wallet = new ethers.Wallet(accountPrivateKey, provider);
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);

    const precioEnWei = ethers.parseEther(precio.toString());
    const tx = await contract.comprarCarro(carId, { value: precioEnWei });
    const receipt = await tx.wait();

    return receipt;
  } catch (error) {
    throw new Error(`Error al comprar carro: ${error.message}`);
  }
}

// Función para desactivar un carro
async function desactivarCarro(carId, accountPrivateKey) {
  try {
    const wallet = new ethers.Wallet(accountPrivateKey, provider);
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);

    const tx = await contract.desactivarCarro(carId);
    const receipt = await tx.wait();

    return receipt;
  } catch (error) {
    throw new Error(`Error al desactivar carro: ${error.message}`);
  }
}

// Función para activar un carro
async function activarCarro(carId, accountPrivateKey) {
  try {
    const wallet = new ethers.Wallet(accountPrivateKey, provider);
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);

    const tx = await contract.activarCarro(carId);
    const receipt = await tx.wait();

    return receipt;
  } catch (error) {
    throw new Error(`Error al activar carro: ${error.message}`);
  }
}

// Función para obtener todos los carros
async function obtenerTodosLosCarros() {
  try {
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const carros = await contract.obtenerTodosLosCarros();

    return carros.map(carro => ({
      id: carro.id.toString(),
      marca: carro.marca,
      modelo: carro.modelo,
      anio: carro.anio.toString(),
      precio: ethers.formatEther(carro.precio),
      vendedor: carro.vendedor,
      imagenUrl: carro.imagenUrl,
      disponible: carro.disponible,
      kilometraje: carro.kilometraje.toString(),
      color: carro.color
    }));
  } catch (error) {
    throw new Error(`Error al obtener carros: ${error.message}`);
  }
}

// Función para obtener carros disponibles
async function obtenerCarrosDisponibles() {
  try {
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const carros = await contract.obtenerCarrosDisponibles();

    return carros.map(carro => ({
      id: carro.id.toString(),
      marca: carro.marca,
      modelo: carro.modelo,
      anio: carro.anio.toString(),
      precio: ethers.formatEther(carro.precio),
      vendedor: carro.vendedor,
      imagenUrl: carro.imagenUrl,
      disponible: carro.disponible,
      kilometraje: carro.kilometraje.toString(),
      color: carro.color
    }));
  } catch (error) {
    throw new Error(`Error al obtener carros disponibles: ${error.message}`);
  }
}

// Función para obtener un carro por ID
async function obtenerCarroPorId(carId) {
  try {
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const carro = await contract.obtenerCarroPorId(carId);

    return {
      id: carro.id.toString(),
      marca: carro.marca,
      modelo: carro.modelo,
      anio: carro.anio.toString(),
      precio: ethers.formatEther(carro.precio),
      vendedor: carro.vendedor,
      imagenUrl: carro.imagenUrl,
      disponible: carro.disponible,
      kilometraje: carro.kilometraje.toString(),
      color: carro.color
    };
  } catch (error) {
    throw new Error(`Error al obtener carro por ID: ${error.message}`);
  }
}

// Función para actualizar precio
async function actualizarPrecio(carId, nuevoPrecio, accountPrivateKey) {
  try {
    const wallet = new ethers.Wallet(accountPrivateKey, provider);
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);

    const precioEnWei = ethers.parseEther(nuevoPrecio.toString());
    const tx = await contract.actualizarPrecio(carId, precioEnWei);
    const receipt = await tx.wait();

    return receipt;
  } catch (error) {
    throw new Error(`Error al actualizar precio: ${error.message}`);
  }
}

// Función para obtener mis compras
async function obtenerMisCompras(address) {
  try {
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const carrosIds = await contract.obtenerMisCompras(address);

    // Obtener los detalles de cada carro comprado
    const compras = [];
    for (const carId of carrosIds) {
      const carro = await contract.obtenerCarroPorId(carId);
      compras.push({
        id: carro.id.toString(),
        marca: carro.marca,
        modelo: carro.modelo,
        anio: carro.anio.toString(),
        precio: ethers.formatEther(carro.precio),
        vendedor: carro.vendedor,
        imagenUrl: carro.imagenUrl,
        disponible: carro.disponible,
        kilometraje: carro.kilometraje.toString(),
        color: carro.color
      });
    }

    return compras;
  } catch (error) {
    throw new Error(`Error al obtener mis compras: ${error.message}`);
  }
}

module.exports = {
  agregarCarro,
  comprarCarro,
  desactivarCarro,
  activarCarro,
  obtenerTodosLosCarros,
  obtenerCarrosDisponibles,
  obtenerCarroPorId,
  actualizarPrecio,
  obtenerMisCompras
};
