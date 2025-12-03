const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Importar rutas
const marketplaceRoutes = require('./routes/marketplace');
const pagosRoutes = require('./routes/pagos');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de la API
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/pagos', pagosRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para información del servidor
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Marketplace de Carros API',
    version: '1.0.0',
    description: 'API para el marketplace descentralizado de venta de carros',
    endpoints: {
      marketplace: {
        agregar: 'POST /api/marketplace/agregar',
        comprar: 'POST /api/marketplace/comprar',
        carros: 'GET /api/marketplace/carros',
        disponibles: 'GET /api/marketplace/carros/disponibles',
        carroPorId: 'GET /api/marketplace/carros/:id',
        desactivar: 'POST /api/marketplace/desactivar',
        activar: 'POST /api/marketplace/activar',
        actualizarPrecio: 'POST /api/marketplace/actualizar-precio'
      },
      pagos: {
        deposit: 'POST /api/pagos/deposit',
        balance: 'GET /api/pagos/balance',
        release: 'POST /api/pagos/release',
        payees: 'GET /api/pagos/payees',
        shares: 'GET /api/pagos/shares/:address'
      }
    }
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Puerto del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
});
