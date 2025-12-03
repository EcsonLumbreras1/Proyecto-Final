const { ethers } = require("hardhat");

async function main() {
  console.log("Redesplegando contrato Pagos con 2 beneficiarios...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying con la cuenta:", deployer.address);
  console.log("Balance:", (await ethers.provider.getBalance(deployer.address)).toString());
  console.log("\n");

  // Configurar los 2 beneficiarios con proporción 80/20
  const payees = [
    "0x6ad244d1b6bbA6f2F4Ee1A8598e0c1BE6fdBcFA5",  // Cuenta 1 - 80%
    "0xA19A3D711649ee0A5314bB45AD3Fa99a12fbcEe6"   // Cuenta 2 - 20%
  ];
  const shares = [80, 20];  // 80% y 20%

  console.log("Beneficiarios:");
  console.log(`  - ${payees[0]} → ${shares[0]}%`);
  console.log(`  - ${payees[1]} → ${shares[1]}%`);
  console.log("\n");

  console.log("Deploying Pagos...");
  const Pagos = await ethers.getContractFactory("Pagos");
  const pagos = await Pagos.deploy(payees, shares);
  await pagos.waitForDeployment();
  const pagosAddress = await pagos.getAddress();

  console.log("Pagos deployed to:", pagosAddress);
  console.log("\n");
  console.log("========================================");
  console.log("Actualiza tu archivo .env con:");
  console.log(`PAGOS_CONTRACT_ADDRESS="${pagosAddress}"`);
  console.log("========================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
