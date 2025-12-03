const { ethers } = require("hardhat");

async function main() {
  console.log("Iniciando deployment de contratos...\n");

  // Obtener el deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts con la cuenta:", deployer.address);
  console.log("Balance de la cuenta:", (await ethers.provider.getBalance(deployer.address)).toString());
  console.log("\n");

  // Deploy Marketplace
  console.log("Deploying Marketplace...");
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy();
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("Marketplace deployed to:", marketplaceAddress);
  console.log("\n");

  // Deploy Pagos
  console.log("Deploying Pagos...");

  // Configurar los beneficiarios del sistema de pagos
  // Ejemplo: 70% para el vendedor, 30% para la plataforma
  const payees = [deployer.address]; // Puedes agregar más direcciones
  const shares = [100]; // Si hay múltiples payees, ajustar las proporciones

  const Pagos = await ethers.getContractFactory("Pagos");
  const pagos = await Pagos.deploy(payees, shares);
  await pagos.waitForDeployment();
  const pagosAddress = await pagos.getAddress();
  console.log("Pagos deployed to:", pagosAddress);
  console.log("\n");

  // Resumen
  console.log("========================================");
  console.log("RESUMEN DE DEPLOYMENT");
  console.log("========================================");
  console.log("Marketplace:", marketplaceAddress);
  console.log("Pagos:", pagosAddress);
  console.log("========================================");
  console.log("\n");
  console.log("Guarda estas direcciones en tu archivo .env:");
  console.log(`MARKETPLACE_CONTRACT_ADDRESS="${marketplaceAddress}"`);
  console.log(`PAGOS_CONTRACT_ADDRESS="${pagosAddress}"`);
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
