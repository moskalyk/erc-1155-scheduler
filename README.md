# erc-1155-scheduler
timely release of ERC1155 token metadata, only revealing individual metadata after time lapse, with stepped index cids

## how to run
```
$ mv .env.example .env // edit with ENV values
$ mkdir assets // add images to /assets folder
$ mkdir assets/output // create renamed output folder
$ node rename.js // run to convert image names to indexable metadata names
$ node index.js // upload
```