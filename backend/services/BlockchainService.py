from web3 import Web3 
import json

# connect to hardhat
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))

# default account from hardhat
account = w3.eth.accounts[0]

# load ABI
with open("abi.json") as f:
    abi = json.load(f)

contract_address = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
contract = w3.eth.contract(address=contract_address, abi=abi)


def register_on_chain(product_id, name, serial):
    tx = contract.functions.registerProduct(
        product_id,
        name,
        serial
    ).transact({
        "from": w3.eth.accounts[0]
    })

    receipt = w3.eth.wait_for_transaction_receipt(tx)

    return receipt


def verify_on_chain(product_id):
    return contract.functions.verifyProduct(product_id).call()

def claim_ownership(product_id):
    tx = contract.functions.claimOwnership(product_id).transact({
        "from": w3.eth.accounts[0]
    })

    receipt = w3.eth.wait_for_transaction_receipt(tx)
    return receipt

def transfer_ownership(product_id, new_owner):
    tx = contract.functions.transferOwnership(
        product_id,
        new_owner
    ).transact({
        "from": w3.eth.accounts[0]
    })

    receipt = w3.eth.wait_for_transaction_receipt(tx)

    return receipt