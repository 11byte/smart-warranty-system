// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProductRegistry {

    struct Product {
        string productId;
        string name;
        string serial;
        uint256 timestamp;
    }

    mapping(string => Product) public products;

    function registerProduct(
        string memory _productId,
        string memory _name,
        string memory _serial
    ) public {
        products[_productId] = Product(
            _productId,
            _name,
            _serial,
            block.timestamp
        );
    }

    function verifyProduct(string memory _productId)
        public
        view
        returns (bool)
    {
        return bytes(products[_productId].productId).length > 0;
    }
}