// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is Ownable, ReentrancyGuard {
    struct Car {
        uint256 id;
        string marca;
        string modelo;
        uint256 anio;
        uint256 precio;
        address payable vendedor;
        string imagenUrl;
        bool disponible;
        uint256 kilometraje;
        string color;
    }

    uint256 public nextCarId;
    mapping(uint256 => Car) public cars;
    mapping(address => uint256[]) public compras;

    event CarroAgregado(
        uint256 indexed id,
        string marca,
        string modelo,
        uint256 anio,
        uint256 precio,
        address vendedor
    );
    event CarroVendido(
        uint256 indexed id,
        address indexed comprador,
        address indexed vendedor,
        uint256 precio
    );
    event CarroDesactivado(uint256 indexed id);
    event Deposit(address indexed sender, uint256 amount);

    constructor() {
        nextCarId = 0;
    }

    function agregarCarro(
        string memory _marca,
        string memory _modelo,
        uint256 _anio,
        uint256 _precio,
        string memory _imagenUrl,
        uint256 _kilometraje,
        string memory _color
    ) external onlyOwner {
        require(_precio > 0, "El precio debe ser mayor a 0");
        require(_anio > 1900 && _anio <= 2025, "Anio invalido");
        require(bytes(_marca).length > 0, "La marca no puede estar vacia");
        require(bytes(_modelo).length > 0, "El modelo no puede estar vacio");

        uint256 carId = nextCarId++;
        cars[carId] = Car({
            id: carId,
            marca: _marca,
            modelo: _modelo,
            anio: _anio,
            precio: _precio,
            vendedor: payable(msg.sender),
            imagenUrl: _imagenUrl,
            disponible: true,
            kilometraje: _kilometraje,
            color: _color
        });

        emit CarroAgregado(carId, _marca, _modelo, _anio, _precio, msg.sender);
    }

    function comprarCarro(uint256 _carId) external payable nonReentrant {
        require(_carId < nextCarId, "El carro no existe");
        Car storage car = cars[_carId];
        require(car.disponible, "El carro no esta disponible");
        require(msg.value == car.precio, "Monto incorrecto");
        require(msg.sender != car.vendedor, "No puedes comprar tu propio carro");

        emit Deposit(msg.sender, msg.value);

        car.disponible = false;
        compras[msg.sender].push(_carId);

        (bool success, ) = car.vendedor.call{value: msg.value}("");
        require(success, "Transferencia fallida");

        emit CarroVendido(_carId, msg.sender, car.vendedor, car.precio);
    }

    function desactivarCarro(uint256 _carId) external onlyOwner {
        require(_carId < nextCarId, "El carro no existe");
        cars[_carId].disponible = false;
        emit CarroDesactivado(_carId);
    }

    function activarCarro(uint256 _carId) external onlyOwner {
        require(_carId < nextCarId, "El carro no existe");
        cars[_carId].disponible = true;
    }

    function obtenerTodosLosCarros() external view returns (Car[] memory) {
        Car[] memory todosLosCarros = new Car[](nextCarId);
        for (uint256 i = 0; i < nextCarId; i++) {
            todosLosCarros[i] = cars[i];
        }
        return todosLosCarros;
    }

    function obtenerCarrosDisponibles() external view returns (Car[] memory) {
        uint256 disponiblesCount = 0;
        for (uint256 i = 0; i < nextCarId; i++) {
            if (cars[i].disponible) {
                disponiblesCount++;
            }
        }

        Car[] memory carrosDisponibles = new Car[](disponiblesCount);
        uint256 index = 0;
        for (uint256 i = 0; i < nextCarId; i++) {
            if (cars[i].disponible) {
                carrosDisponibles[index] = cars[i];
                index++;
            }
        }
        return carrosDisponibles;
    }

    function obtenerCarroPorId(uint256 _carId) external view returns (Car memory) {
        require(_carId < nextCarId, "El carro no existe");
        return cars[_carId];
    }

    function obtenerMisCompras(address _comprador) external view returns (uint256[] memory) {
        return compras[_comprador];
    }

    function actualizarPrecio(uint256 _carId, uint256 _nuevoPrecio) external onlyOwner {
        require(_carId < nextCarId, "El carro no existe");
        require(_nuevoPrecio > 0, "El precio debe ser mayor a 0");
        cars[_carId].precio = _nuevoPrecio;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }
}
