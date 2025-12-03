const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplace');

// Ruta para agregar un carro
router.post('/agregar', async (req, res) => {
  try {
    const { marca, modelo, anio, precio, imagenUrl, kilometraje, color, privateKey } = req.body;

    if (!marca || !modelo || !anio || !precio || !privateKey) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    const receipt = await marketplaceController.agregarCarro(
      marca,
      modelo,
      parseInt(anio),
      parseFloat(precio),
      imagenUrl || '',
      parseInt(kilometraje) || 0,
      color || '',
      privateKey
    );

    res.json({ success: true, receipt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ruta para comprar un carro
router.post('/comprar', async (req, res) => {
  try {
    const { carId, precio, privateKey } = req.body;

    if (carId === undefined || !precio || !privateKey) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    const receipt = await marketplaceController.comprarCarro(
      parseInt(carId),
      parseFloat(precio),
      privateKey
    );

    res.json({ success: true, receipt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ruta para desactivar un carro
router.post('/desactivar', async (req, res) => {
  try {
    const { carId, privateKey } = req.body;

    if (carId === undefined || !privateKey) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    const receipt = await marketplaceController.desactivarCarro(
      parseInt(carId),
      privateKey
    );

    res.json({ success: true, receipt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ruta para activar un carro
router.post('/activar', async (req, res) => {
  try {
    const { carId, privateKey } = req.body;

    if (carId === undefined || !privateKey) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    const receipt = await marketplaceController.activarCarro(
      parseInt(carId),
      privateKey
    );

    res.json({ success: true, receipt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ruta para obtener todos los carros
router.get('/carros', async (req, res) => {
  try {
    const carros = await marketplaceController.obtenerTodosLosCarros();
    res.json({ success: true, carros });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ruta para obtener carros disponibles
router.get('/carros/disponibles', async (req, res) => {
  try {
    const carros = await marketplaceController.obtenerCarrosDisponibles();
    res.json({ success: true, carros });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ruta para obtener un carro por ID
router.get('/carros/:id', async (req, res) => {
  try {
    const carId = parseInt(req.params.id);
    const carro = await marketplaceController.obtenerCarroPorId(carId);
    res.json({ success: true, carro });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ruta para obtener mis compras
router.get('/mis-compras/:address', async (req, res) => {
  try {
    const address = req.params.address;
    const compras = await marketplaceController.obtenerMisCompras(address);
    res.json({ success: true, compras });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ruta para actualizar precio
router.post('/actualizar-precio', async (req, res) => {
  try {
    const { carId, nuevoPrecio, privateKey } = req.body;

    if (carId === undefined || !nuevoPrecio || !privateKey) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    const receipt = await marketplaceController.actualizarPrecio(
      parseInt(carId),
      parseFloat(nuevoPrecio),
      privateKey
    );

    res.json({ success: true, receipt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
