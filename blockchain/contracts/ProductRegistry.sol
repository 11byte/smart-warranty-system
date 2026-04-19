// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProductRegistry {

    event OwnershipTransferred(
    string productId,
    address from,
    address to,
    uint256 timestamp
);

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

    owners[_productId] = msg.sender;
}

    function verifyProduct(string memory _productId)
        public
        view
        returns (bool)
    {
        return bytes(products[_productId].productId).length > 0;
    }


    mapping(string => address) public owners;

function transferOwnership(string memory _productId, address newOwner) public {
    require(bytes(products[_productId].productId).length > 0, "Product not found");
    require(msg.sender == owners[_productId], "Not owner");

    address oldOwner = owners[_productId];

    owners[_productId] = newOwner;

    emit OwnershipTransferred(
        _productId,
        oldOwner,
        newOwner,
        block.timestamp
    );
}
}

