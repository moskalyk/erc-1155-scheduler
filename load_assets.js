require('dotenv').config()

const {Web3Storage} = require('web3.storage')

const Corestore = require('corestore')
const store = new Corestore('./data')

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

async function storeFiles (files) {
    const client = makeStorageClient()
    const cid = await client.put(files)
    console.log('stored files with cid:', cid)
    return cid
}

(async () => {

    const assets = store.get({ name: 'assets', valueEncoding: 'json'})

    let index = 0;
    let uploadIndex = 0;

    // get files
    const assetFiles = await getFiles('./assets')

    const upload = async () => {
        const slicedAssets = assetFiles.slice(uploadIndex*25, 25*(uploadIndex+1))

        for(let i = 0; i < slicedAssets.length; i++){
            // rename name to index
            slicedAssets[i].name = `${index}.png`
            // upload file & add cid to corestore
            assets.append({cid: await storeFiles([slicedAssets[i]]), index: index, name: slicedAssets[i].name})
            index++
        }

        uploadIndex++

        if(uploadIndex >= Math.ceil(assetFiles.length / 25)){
            console.log('Upload Complete')
            clearInterval(interval)
        }
    }

    // call on first run
    upload()

    // use a timer to abide by rate limit
    let interval = setInterval(async () => {
        upload()
    }, 40000)

    assets.createReadStream({live: true}).on('data', (data) => {
        console.log(data)
    })
})()    
