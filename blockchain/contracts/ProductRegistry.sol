// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProductRegistry {

    /* ================= EVENTS ================= */

    event OwnershipTransferred(
        string productId,
        address from,
        address to,
        uint256 timestamp
    );

    event OwnershipClaimed(
        string productId,
        address owner,
        uint256 timestamp
    );

    event OwnershipReleased(
        string productId,
        address owner,
        uint256 timestamp
    );

    /* ================= STRUCT ================= */

    struct Product {
        string productId;
        string name;
        string serial;
        uint256 timestamp;
    }

    mapping(string => Product) public products;
    mapping(string => address) public owners;

    /* ================= REGISTER ================= */

    function registerProduct(
        string memory _productId,
        string memory _name,
        string memory _serial
    ) public {
        require(
            bytes(products[_productId].productId).length == 0,
            "Already registered"
        );

        products[_productId] = Product(
            _productId,
            _name,
            _serial,
            block.timestamp
        );

        // owner remains EMPTY (unclaimed)
    }

    /* ================= VERIFY ================= */

    function verifyProduct(string memory _productId)
        public
        view
        returns (bool)
    {
        return bytes(products[_productId].productId).length > 0;
    }

    /* ================= CLAIM ================= */

    function claimOwnership(string memory _productId) public {
        require(
            bytes(products[_productId].productId).length > 0,
            "Product not found"
        );

        require(
            owners[_productId] == address(0),
            "Already claimed"
        );

        owners[_productId] = msg.sender;

        emit OwnershipClaimed(
            _productId,
            msg.sender,
            block.timestamp
        );
    }

    /* ================= DISOWN ================= */

    function releaseOwnership(string memory _productId) public {
        require(
            owners[_productId] == msg.sender,
            "Not owner"
        );

        owners[_productId] = address(0);

        emit OwnershipReleased(
            _productId,
            msg.sender,
            block.timestamp
        );
    }

    /* ================= VIEW ================= */

    function getOwner(string memory _productId)
        public
        view
        returns (address)
    {
        return owners[_productId];
    }
}