import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import { ScanCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async(event) => {
    // add token verification

    const genre = event["body"]["genre"];
    const tableName = process.env.TABLE_NAME;

    const scanCommand = new ScanCommand({
        TableName: tableName,
        FilterExpression: "#genre = :genreValue",
        ExpressionAttributeNames: {
            "#genre": "genre"
        },
        ExpressionAttributeValues: {
            ":genreValue": { S: genre }
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
            body: JSON.stringify({ error: err.message })
        };
    }
};