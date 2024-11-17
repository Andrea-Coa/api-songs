import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import { QueryCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async(event) => {
    // add token verification

    const song_id = event["song_id"];
    const queryCommand = new QueryCommand({
        TableName: "t_songs_test",
        IndexName: "song_uuid-index",
        KeyConditionExpression: "song_uuid = :song_id",
        ExpressionAttributeValues: {
            ":song_id": song_id
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