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


def register_on_chain(product):
    tx_hash = contract.functions.registerProduct(
        product["productId"],
        product["name"],
        product["serial"]
    ).transact({"from": account})

    return w3.to_hex(tx_hash)


def verify_on_chain(product_id):
    return contract.functions.verifyProduct(product_id).call()