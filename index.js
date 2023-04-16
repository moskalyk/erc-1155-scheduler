require('dotenv').config()

const {Web3Storage} = require('web3.storage')

const hypercore = require('hypercore')

const feed = new hypercore('./data', {valueEncoding: 'json'});

const { getFilesFromPath, File} = require('web3.storage')

function getAccessToken () {
return process.env.WEB3_API_KEY
}

function makeStorageClient () {
    return new Web3Storage({ token: getAccessToken() })
}

async function getFiles (path) {
    const files = await getFilesFromPath(path)
    console.log(`read ${files.length} file(s) from ${path}`)
    return files
}

(async () => {
    await feed.append({test: 'hi'});

    async function storeFiles (files) {
        const client = makeStorageClient()
        const cid = await client.put(files)
        console.log('stored files with cid:', cid)
    }

    const files = []

    console.log(await getFiles('./assets'))

    const obj = { 
        name: 'Pocket',
        description: "",
        image: ''
      }

    const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' })

    files.push(new File([blob], 'test.json'))

    console.log(await storeFiles(files))

    // feed.createReadStream({live: true}).on('data', (data) => {
    //     console.log(data)
    // })
})()    
