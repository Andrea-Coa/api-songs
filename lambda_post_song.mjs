import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {PutCommand, DynamoDBDocumentClient} from '@aws-sdk/lib-dynamodb';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { v4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const lambdaClient = new LambdaClient({region: 'us-east-1'})

export const handler = async(event, context) => {

    // add token verification
    console.log(event)
    const partition_key = event["body"]["artist_id"];
    const sorting_key = event["body"]["genre#release_date"];
    const uuid = v4(); // GSI
    const genre = event["body"]["genre"];
    const album_uuid = event["body"]["album_uuid"];
    const name = event["body"]["name"];
    const data = event["body"]["data"];
    const token = event['headers']['Authorization'];
    const tableName = process.env.TABLE_NAME;
    const stage = tableName.split('-')[0];


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

    const lambda_funtion_name = `api-users-${stage}-ValidateToken_A`
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


    if (!(partition_key && sorting_key && uuid && genre && album_uuid && name && data)) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Fill in all the required fields.",
                uuid: uuid
            })
        };
    }

    const putCommand = new PutCommand({
        TableName: tableName,
        Item: {
            "artist_id": partition_key,
            "genre#release_date":sorting_key,
            "song_uuid":uuid,
            "genre": genre,
            "album_uuid": album_uuid,
            "name": name,
            "data": data
        }
    });

    try {
        await docClient.send(putCommand);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Song added successfully.'
            })
        };
    }
    catch (err) {
        console.error(err)
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to add song.',
                error: err.message
            })
        };
    }

        
};
