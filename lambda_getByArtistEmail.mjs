import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import { QueryCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';


const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const lambdaClient = new LambdaClient({region: 'us-east-1'})

// parece funcionar

export const handler = async (event) => {

    // verificar token
    const token = event['headers']['Authorization'];
    const tenant_id = event['body']['tenant_id']
    const artist_id = event["body"]['artist_id'];
    const tableName = process.env.TABLE_NAME;
    const stage = tableName.split('-')[0];

    if (!token) {
        return {
            statusCode: 400,
            message: 'Falta el encabezado Authorization'
        }
    }
    console.log('token', token);
    if (!tenant_id) {
        return {
            statusCode: 400,
            message: 'Falta el parámetro tenant_id'
        }
    }

    const payload = {
        token: token,
        tenant_id: tenant_id
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


    const queryCommand = new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "artist_id = :artist_id",
        ExpressionAttributeValues: {
            ":artist_id": artist_id
        }
    });

    try {
        const response = await docClient.send(queryCommand);
        return {
            statusCode: 200,
            body: {
                Count: response['ScannedCount'],
                Items: response['Items']
            }
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};