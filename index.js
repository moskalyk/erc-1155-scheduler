require('dotenv').config()

const {Web3Storage} = require('web3.storage')

const Corestore = require('corestore')
const store = new Corestore('./metadata')

const { schedule } = require('./schedule.js');

(async () => {

    const metadata = store.get({ name: 'metadata', valueEncoding: 'json'})

    await metadata.ready()

    // async request to get highest index from balances of token IDs
    const getMaxIndex = 0;
    
    function wait(index) {
        
        setTimeout(async () => {
            
            const currentTime = new Date()

            if (currentTime >= schedule[index]) {
                console.log('Running ...')

                // send async broadcast message 
                // get hypercore metadata and assign to relayer call for setURI
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

})()    