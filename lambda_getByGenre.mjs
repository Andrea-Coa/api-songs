import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import { QueryCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async(event) => {
    // add token verification

    const genre = event["genre"];
    const queryCommand = new QueryCommand({
        TableName: "t_songs_test",
        IndexName: "genre-index",
        KeyConditionExpression: "genre = :genre",
        ExpressionAttributeValues: {
            ":genre": genre
        }
    });

    try {
        const response = await docClient.send(queryCommand);
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
            body: JSON.stringify({ error: err.message })
        };
    }
};