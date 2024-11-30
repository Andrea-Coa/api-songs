import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import { ScanCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const lambdaClient = new LambdaClient({region: 'us-east-1'})

export const handler = async(event) => {
    // add token verification

    const genre = event["body"]["genre"];
    const token = event['headers']['Authorization'];
    const artist_id = event["body"]['tenant_id'];
    const tableName = process.env.TABLE_NAME;
    const stage = tableName.split('-')[0]

    if (!token) {
        return {
            statusCode: 400,
            message: 'Falta el encabezado Authorization'
        }
    }
    console.log('token', token);
    if (!artist_id) {
        return {
            statusCode: 400,
            message: 'Falta el parámetro artist_id'
        }
    }

    const payload = {
        token: token,
        artist_id: artist_id
    }

    const lambda_funtion_name = `api-users-${stage}-ValidateToken`
    const params = {
        FunctionName: lambda_funtion_name,
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify(payload)
    };

    try {
        const command = new InvokeCommand(params);
        const response = await lambdaClient.send(command);
        const responsePayload = JSON.parse(new TextDecoder('utf-8').decode(response.Payload));
        console.log('Lambda response:', responsePayload);
    
        if (!responsePayload.statusCode || responsePayload.statusCode !== 200) {
            return {
                statusCode: 403,
                message: 'Forbidden'
            };
        }
    } catch (error) {
        console.error('Error invoking Lambda function:', error);
        return {
            statusCode: 403,
            message: 'Forbidden'
        };
    }

    const scanCommand = new ScanCommand({
        TableName: tableName,
        FilterExpression: "#genre = :genreValue",
        ExpressionAttributeNames: {
            "#genre": "genre"
        },
        ExpressionAttributeValues: {
            ":genreValue": genre
        }
    });

    try {
        const response = await docClient.send(scanCommand);
        // const responseBody = JSON.parse(response.body);
        const items = response.Items;
        const count = response.Count;
        return {
            statusCode: 200,
            body: {
              count,
              items
            }
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: { error: err.message }
        };
    }
};