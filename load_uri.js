require('dotenv').config()
const fs = require('fs');
const {Web3Storage} = require('web3.storage')
const Corestore = require('corestore')
const store = new Corestore('./data')
const store2 = new Corestore('./metadata')

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

function readCSVFile(filePath) {
  // Read the file
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  // Split the file content by line breaks to get an array of rows
  const rows = fileContent.split('\n');

  // Split each row by commas to get an array of values
  const values = rows.map(row => row.split(','));

  // Return the array of values
  return values;
}

async function storeFiles (files) {
    const client = makeStorageClient()
    const cid = await client.put(files)
    console.log('stored files with cid:', cid)
    return cid
}

const wait = async (ms) => {
    await new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    const assets = store.get({ name: 'assets', valueEncoding: 'json'})
    const metadata = store2.get({ name: 'metadata', valueEncoding: 'json'})

    await assets.ready()

    // read csv with metadata values
    const csvAssets = await readCSVFile('assets.csv')
    console.log(csvAssets)

    // loop on length of hypercore
    console.log(assets.length)

    let index = 0;

    for(let i = 1; i < 4; i++) {
        let files = []

        // read from block 0-N
        const partialStream = assets.createReadStream({ start: 0, end: i })

        const sliceOfAssets = []
        // pull image from hypercore
        for await (const data of partialStream) {
            console.log('data:', data)
            // await wait(500)
            sliceOfAssets.push(data)
        }
        

        // loop on images 0 -> index
        sliceOfAssets.map((asset, index) => {

            // add metadata to image
            const obj = { 
                name: csvAssets[index][1],
                description: csvAssets[index][2],
                image: `https://${asset.cid}.ipfs.dweb.link/${asset.index}.png`
            }

            // add blob
            const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' })
            files.push(new File([blob], `${asset.index}.json`))
        })

        // store metadata cid in hypercore with index
        console.log(files)
        metadata.append({cid: await storeFiles(files), index: index})
        index++
        await wait(2000)
    } // end loop


    metadata.createReadStream({live: true}).on('data', (data) => {
        console.log(data)
    })
})()    
