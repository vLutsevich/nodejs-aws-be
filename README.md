# nodejs-aws-be

## create a service ##
`serverless create --template aws-nodejs --path myService`

`sls create -t aws-nodejs-typescript -p myService`

`sls create -t aws-nodejs-ecma-script -p myService`

## deploy ##
`sls deploy`

## deploy some function ##
`sls deploy function --function getProductList`
`sls deploy function -f getProductById`

## invoke some function locally ##
`sls invoke local -f postProducts -p lib/data.json`

## invoke deployed function ##
`sls invoke -f hello`
