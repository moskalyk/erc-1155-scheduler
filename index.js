require('dotenv').config()

const {Web3Storage} = require('web3.storage')
const { ethers } = require('ethers')
const { abi } = require('./abi.js')
const { sequence } = require('0xsequence')
const { RpcRelayer } = require('@0xsequence/relayer')
const { Wallet } = require('@0xsequence/wallet')
const { SequenceIndexerClient } = require('@0xsequence/indexer')
const indexer = new SequenceIndexerClient('https://polygon-indexer.sequence.app')

const Corestore = require('corestore')
const store = new Corestore('./metadata')

const { schedule } = require('./schedule.js');

const serverPrivateKey = process.env.PKEY

// provider
const provider = new ethers.providers.JsonRpcProvider('https://nodes.sequence.app/mumbai')

// rpc relayer instance with relayer node you want to use
const relayer = new RpcRelayer({url: 'https://mumbai-relayer.sequence.app', provider: provider})

// server EOA
const walletEOA = new ethers.Wallet(serverPrivateKey, provider)

const getAddress = async () => {
    const wallet = (await Wallet.singleOwner(walletEOA)).connect(provider, relayer)
    return await wallet.getAddress()
}

const premintTx = async (data) => {

    // Create your Sequence server wallet, controlled by your server EOA, and connect it to the relayer
    const wallet = (await Wallet.singleOwner(walletEOA)).connect(provider, relayer)

    const erc1155TokenAddress = process.env.CONTRACT_ADDRESS

    // Craft your transaction
    const erc1155Interface = new ethers.utils.Interface([
        'function premint(uint amount_, string memory newUri_) public'
    ])

    const data = erc1155Interface.encodeFunctionData(
        'premint', [100, `https://${data.cid}.nft.storage.link/{id}.json`]
    )

    const txn = {
        to: erc1155TokenAddress,
        data
    }

    try{
        // Request the possible fee options the relayer will accept for this transaction
        const [config, context] = await Promise.all([wallet.getWalletConfig(), wallet.getWalletContext()])
        const { options, quote } = await relayer.getFeeOptions(config[0], context, txn /* , txn2, txn3, etc... */)

        // Choose a fee from the list of options returned by the relayer
        // MATIC is native to Polygon and needs to be handled differently than other ERC-20 tokens like USDC
        // === To pay the fee in native MATIC: ===
        const option = options.find(option => option.token.symbol === 'MATIC')
        console.log(options)
        if (!option) {
            console.log('sending the tx without a fee...')

            // Send your transaction with the fee and quote to the relayer for dispatch
            const txnResponse = await wallet.sendTransaction(txn)
            console.log(txnResponse)

            // Wait for transaction to be mined
            const txnReceipt = await txnResponse.wait()

            // Check if transaction was successful 
            if (txnReceipt.status != 1) {
                console.log(`Unexpected status: ${txnReceipt.status}`)
                throw new Error(`Unexpected status: ${txnReceipt.status}`)
            }

            return { transactionHash: txnReceipt.transactionHash }
        } else { // to be used for mainnet / polygon
            console.log('sending the tx with a fee...')

            // Craft the MATIC fee payment transaction
            // revertOnError: true is required for fee payments
            const feeTxn = {
                to: option.to,
                value: option.value,
                gasLimit: option.gasLimit,
                revertOnError: true
            }
            // === MATIC fee ===

            // Send your transaction with the fee and quote to the relayer for dispatch
            const txnResponse = await wallet.sendTransaction([txn, feeTxn], undefined, undefined, quote)
            console.log(txnResponse)

            // Wait for transaction to be mined
            const txnReceipt = await txnResponse.wait()

            // Check if transaction was successful 
            if (txnReceipt.status != 1) {
                console.log(`Unexpected status: ${txnReceipt.status}`)
                throw new Error(`Unexpected status: ${txnReceipt.status}`)
            }

            return { transactionHash: txnReceipt.transactionHash }
        }
    }catch(e){
        console.log(e)
        throw new Error(e)
    }
}

const getCurrentTokenId = async () => {
    const contractAddress = process.env.CONTRACT_ADDRESS
    const provider = new ethers.providers.JsonRpcProvider('https://nodes.sequence.app/mumbai'); // replace with your own provider
    const contract = new ethers.Contract(contractAddress, abi, provider);
    const currentId = await contract.tokenIdCounter()
    return Number(currentId);
}

(async () => {

    const metadata = store.get({ name: 'metadata', valueEncoding: 'json'})

    await metadata.ready()

    // async request to get current index from existing balances of token IDs
    const currentIndex = await getCurrentTokenId()

    console.log(currentIndex)
    function wait(index) {
        
        setTimeout(async () => {

            const currentTime = new Date()

            if (currentTime >= schedule[index]) {
                console.log('Running ...')

                // send async broadcast message 
                // get metadata and relay call for to mint token ID & setURI
                console.log(await premintTx(await metadata.get(index)))

                // call wait
                wait(index + 1)
            } else {
                console.log('waiting')
                wait(index) // recursively call wait after the timeout completes
            }

        }, 1000) // wait 1 second
    }

    wait(currentIndex)

    metadata.createReadStream({live: true}).on('data', (data) => {
        console.log(data)
    })

    console.log(`relayer address (must top-up) ${await getAddress()}`)

})()    