const express = require('express');
const router = express.Router();
const pagosController = require('../controllers/pagos');

// Ruta para hacer un depósito
router.post('/deposit', async (req, res) => {
  try {
    const { amount, privateKey } = req.body;

    if (!amount || !privateKey) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    const receipt = await pagosController.deposit(parseFloat(amount), privateKey);
    res.json({ success: true, receipt, message: 'Depósito exitoso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ruta para obtener el balance del contrato
router.get('/balance', async (req, res) => {
  try {
    const balance = await pagosController.getBalance();
    res.json({ success: true, balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ruta para liberar fondos
router.post('/release', async (req, res) => {
  try {
    const { privateKey } = req.body;

    if (!privateKey) {
      return res.status(400).json({ message: 'Falta la private key' });
    }

    const receipt = await pagosController.release(privateKey);
    res.json({ success: true, receipt, message: 'Fondos liberados exitosamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ruta para obtener los beneficiarios
router.get('/payees', async (req, res) => {
  try {
    const payees = await pagosController.getPayees();
    res.json({ success: true, payees });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ruta para obtener las shares de un beneficiario
router.get('/shares/:address', async (req, res) => {
  try {
    const address = req.params.address;
    const shares = await pagosController.getShareOf(address);
    res.json({ success: true, shares });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
