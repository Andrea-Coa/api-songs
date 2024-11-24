import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import { ScanCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async(event) => {
    // add token verification

    const name = event['body']['name'];
    const tableName = process.env.TABLE_NAME;

    const scanCommand = new ScanCommand({
        TableName: tableName,
        FilterExpression: '#name = :nameValue',
        ExpressionAttributeNames: {
            '#name': 'name'
        },
        ExpressionAttributeVales: {
            'nameValue': name
        }
    });

    try {
        const response = await docClient.send(scanCommand);
        const items = response.Items;
        const count = response.Count;
        return {
            statusCode: 200,
            body: {
                count,
                items
            }
        };
    }
    catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: { error: err.message }
        };
    }
}