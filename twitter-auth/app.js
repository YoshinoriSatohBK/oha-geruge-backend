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
const config = {
  callbackURI: "https://musing-torvalds-d26081.netlify.com/callback",
  consumerKey: "F3JqpRLaTH8i54IgFQeF8YMkX",
  consumerSecret: "ohtDOm8w5QVMnVngp93ziI6oN8ypMvEgILv5sAwrGRYcnIhETD"
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
                }
                else {
                    console.log(oauth_token)
                    console.log(oauth_token_secret)
                    console.log(results)
                    resolve({
                        token: oauth_token,
                        token_secret: oauth_token_secret
                    })
                }
            })
        })
        return({
            'statusCode': 200,
            'body': JSON.stringify(body)
        })
    } catch (err) {
        console.log(err)
        callback(err)
    }
}

exports.accessToken = async (event, context) => {
    try {
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: 'hello world'
            })
        }
    } catch (err) {
        console.log(err)
        return err
    }

    return response
}
