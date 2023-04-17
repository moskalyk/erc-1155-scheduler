# erc-1155-scheduler
timely release of ERC1155 token metadata, only revealing individual metadata after time lapse, with stepped index cids

## how to run
```
$ mv .env.example .env      // edit with ENV values
$ mkdir assets              // add images to /assets folder
$ mkdir assets/output       // create renamed output folder
$ yarn 
$ yarn rename               // run to convert image names to indexable metadata names
$ yarn load-assets          // loads assets from local into ipfs
$ yarn load-uri             // loads assets as bunbled & step CAR files
                            // change Date() schedule in schedule.js
$ yarn start                // starts the schedule
```

### load-uri follows current pattern
```
bafy... -> 0.json
bafy... -> 0.json, 1.json
bafy... -> 0.json, 1.json, 2.json
...
```
