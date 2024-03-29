/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 * @param {string} event.resource - Resource path.
 * @param {string} event.path - Path parameter.
 * @param {string} event.httpMethod - Incoming request's method name.
 * @param {Object} event.headers - Incoming request headers.
 * @param {Object} event.queryStringParameters - query string parameters.
 * @param {Object} event.pathParameters - path parameters.
 * @param {Object} event.stageVariables - Applicable stage variables.
 * @param {Object} event.requestContext - Request context, including authorizer-returned key-value pairs, requestId, sourceIp, etc.
 * @param {Object} event.body - A JSON string of the request payload.
 * @param {boolean} event.body.isBase64Encoded - A boolean flag to indicate if the applicable request payload is Base64-encode
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 * @param {string} context.logGroupName - Cloudwatch Log Group name
 * @param {string} context.logStreamName - Cloudwatch Log stream name.
 * @param {string} context.functionName - Lambda function name.
 * @param {string} context.memoryLimitInMB - Function memory.
 * @param {string} context.functionVersion - Function version identifier.
 * @param {function} context.getRemainingTimeInMillis - Time in milliseconds before function times out.
 * @param {string} context.awsRequestId - Lambda request ID.
 * @param {string} context.invokedFunctionArn - Function ARN.
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * @returns {boolean} object.isBase64Encoded - A boolean flag to indicate if the applicable payload is Base64-encode (binary support)
 * @returns {string} object.statusCode - HTTP Status Code to be returned to the client
 * @returns {Object} object.headers - HTTP Headers to be returned
 * @returns {Object} object.body - JSON Payload to be returned
 * 
 */


const OAuth = require('oauth').OAuth
const Twitter = require('twitter')
const AWS = require('aws-sdk')

const config = {
    callbackURI: process.env.CALLBACK_URI,
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET
}

exports.requestToken = async (event, context, callback) => {
    try {
        const oauth = new OAuth(
            "https://api.twitter.com/oauth/request_token",
            "https://api.twitter.com/oauth/access_token",
            config.consumerKey,
            config.consumerSecret,
            "1.0",
            config.callbackURI,
            "HMAC-SHA1"
        )
    
        const body = await new Promise((resolve, reject) => {
            oauth.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {
                if (error) {
                    console.error(error)
                    reject(error);
                } else {
                    console.log(oauth_token)
                    console.log(oauth_token_secret)
                    console.log(results)
                    resolve({
                        oauth_token: oauth_token,
                        oauth_token_secret: oauth_token_secret
                    })
                }
            })
        })

        return({
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*'
            },
            body: JSON.stringify(body)
        })
    } catch (err) {
        console.log(err)
        callback(err)
    }
}

exports.accessToken = async (event, context, callback) => {
    try {
        const oauth = new OAuth(
            "https://api.twitter.com/oauth/request_token",
            "https://api.twitter.com/oauth/access_token",
            config.consumerKey,
            config.consumerSecret,
            "1.0",
            config.callbackURI,
            "HMAC-SHA1"
        )

        const requestBody = JSON.parse(event.body)

        const responseBody = await new Promise((resolve, reject) => {
            oauth.getOAuthAccessToken(
                requestBody.oauth_token,
                requestBody.oauth_token_secret,
                requestBody.oauth_verifier,
                function(error, oauth_access_token, oauth_access_token_secret, results) {
                    if (error) {
                        console.error(error)
                        reject(error);
                    } else {
                        console.log(oauth_access_token)
                        console.log(oauth_access_token_secret)
                        console.log(results)
                        resolve({
                            access_token: oauth_access_token,
                            access_token_secret: oauth_access_token_secret
                        })
                    }
                }
            )
        })

        return({
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(responseBody)
        })
    } catch (err) {
        console.log(err)
        callback(err)
    }
}


exports.getUser = async (event, context, callback) => {
    try {
        const client = new Twitter({
            consumer_key: config.consumerKey,
            consumer_secret: config.consumerSecret,
            access_token_key: event.queryStringParameters.access_token_key,
            access_token_secret: event.queryStringParameters.access_token_secret
        })

        const res = await new Promise((resolve, reject) => {
            client.get('account/verify_credentials',{}, (error, res) => {
                if(error) {
                    console.error(error)
                    reject(error)
                }
                resolve(res)
            })
        })

        return({
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*'
            },
            body:JSON.stringify(res)
        })
    } catch (err) {
        console.error('error')
        console.error(err)
        callback(err)
    }
}


exports.tweet = async (event, context, callback) => {
    try {
        const requestBody = JSON.parse(event.body)
        const client = new Twitter({
            consumer_key: config.consumerKey,
            consumer_secret: config.consumerSecret,
            access_token_key: requestBody.access_token_key,
            access_token_secret: requestBody.access_token_secret
        })

        const s3 = new AWS.S3()
        const objectList = await s3.listObjectsV2({
            Bucket: "oha-geruge-images",
        }).promise()
        const object = objectList.Contents[Math.floor(Math.random() * objectList.Contents.length)]
        const params = {
            Bucket: "oha-geruge-images",
            Key: object.Key
        }
        const imageData = await s3.getObject(params).promise()
        const uploadResults = await new Promise((resolve, reject) => {
            client.post('media/upload', { media_data: imageData.Body.toString('base64') },  (error, media, response) => {
                if(error) {
                    console.error(error)
                    reject()
                }

                resolve({
                    media: media,
                    response: response
                })
            })
        })
        console.log(uploadResults.media)
        console.log(uploadResults.media.media_id.toString())

        await new Promise((resolve, reject) => {
            client.post('statuses/update', {
                status: requestBody.text,
                media_ids: uploadResults.media.media_id_string
            }, (error) => {
                if(error) {
                    console.error(error)
                    reject()
                }
                resolve()
            })
        })

        return({
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*'
            },
            body: ''
        })
    } catch (err) {
        console.error('error')
        console.error(err)
        callback(err)
    }
}
