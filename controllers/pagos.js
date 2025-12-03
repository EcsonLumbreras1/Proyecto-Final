require('dotenv').config({ path: require('find-config')('.env') });
const { ethers } = require('ethers');

// Configuración del provider
const provider = new ethers.JsonRpcProvider(process.env.API_URL);
const contractAddress = process.env.PAGOS_CONTRACT_ADDRESS;

// ABI del contrato Pagos
const contractABI = [
  "function deposit() public payable",
  "function getBalance() external view returns (uint256)",
  "function release() external",
  "function getPayees() external view returns (address[])",
  "function getShareOf(address _payee) external view returns (uint256)",
  "event Deposit(uint256 indexed depositId, address indexed sender, uint256 amount)",
  "event Release(uint256 indexed releaseId, uint256 amount)"
];

// Función para hacer un depósito
async function deposit(amount, accountPrivateKey) {
  try {
    const wallet = new ethers.Wallet(accountPrivateKey, provider);
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);

    const amountInWei = ethers.parseEther(amount.toString());
    const tx = await contract.deposit({ value: amountInWei });
    const receipt = await tx.wait();

    return receipt;
  } catch (error) {
    throw new Error(`Error al hacer depósito: ${error.message}`);
  }
}

// Función para obtener el balance del contrato
async function getBalance() {
  try {
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const balance = await contract.getBalance();
    return ethers.formatEther(balance);
  } catch (error) {
    throw new Error(`Error al obtener balance: ${error.message}`);
  }
}

// Función para liberar fondos a los beneficiarios
async function release(accountPrivateKey) {
  try {
    const wallet = new ethers.Wallet(accountPrivateKey, provider);
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);

    const tx = await contract.release();
    const receipt = await tx.wait();

    return receipt;
  } catch (error) {
    throw new Error(`Error al liberar fondos: ${error.message}`);
  }
}

// Función para obtener los beneficiarios
async function getPayees() {
  try {
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const payees = await contract.getPayees();
    return payees;
  } catch (error) {
    throw new Error(`Error al obtener beneficiarios: ${error.message}`);
  }
}

// Función para obtener las shares de un beneficiario
async function getShareOf(payeeAddress) {
  try {
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const shares = await contract.getShareOf(payeeAddress);
    return shares.toString();
  } catch (error) {
    throw new Error(`Error al obtener shares: ${error.message}`);
  }
}

module.exports = {
  deposit,
  getBalance,
  release,
  getPayees,
  getShareOf
};
