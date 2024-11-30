import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import { QueryCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// parece funcionar

export const handler = async (event) => {

    // verificar token
    const token = event['headers']['Authorization'];
    console.log('token', token);

    const artist_id = event["body"]["artist_id"];
    const tableName = process.env.TABLE_NAME;

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