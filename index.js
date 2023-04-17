require('dotenv').config()

const {Web3Storage} = require('web3.storage')

const Corestore = require('corestore')
const store = new Corestore('./metadata')
const store2 = new Corestore('./data')

const { schedule } = require('./schedule.js');

(async () => {

    const metadata = store.get({ name: 'metadata', valueEncoding: 'json'})
    // const assets = store2.get({ name: 'assets', valueEncoding: 'json'})

    await metadata.ready()
    const getMaxIndex = 0;
    
    // try{
    //     console.log(await assets.get(getMaxIndex))
    // }catch(e){
    //     console.log(e)
    // }
    // console.log('here')
    function wait(index) {
        
        setTimeout(async () => {
            // async request to get highest index from balances of token IDs
            const currentTime = new Date()

            if (currentTime >= schedule[index]) {
                console.log('Running Randance ...')

                // send async broadcast message 
                // to get hypercore metadata and assign to relayer call
                console.log(await metadata.get(index))

                // call wait
                wait(index + 1)
            } else {
                console.log('waiting')
                wait(index) // recursively call wait after the timeout completes
            }

        }, 1000) // wait 1 second
    }

    wait(getMaxIndex)

    // metadata.createReadStream({live: true}).on('data', (data) => {
    //     console.log(data)
    // })

})()    