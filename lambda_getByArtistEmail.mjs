import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import { QueryCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// parece funcionar

export const handler = async (event) => {
    const artista_email = event["artista_email"];
    const queryCommand = new QueryCommand({
        TableName: "t_songs_test",
        KeyConditionExpression: "artista_email = :artista_email",
        ExpressionAttributeValues: {
            ":artista_email": artista_email
        }
    });

    try {
        const response = await docClient.send(queryCommand);
        return {
            statusCode: 200,
            body: JSON.stringify(response)
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};