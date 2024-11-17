import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {PutCommand, DynamoDBDocumentClient} from '@aws-sdk/lib-dynamodb';
import { v4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async(event, context) => {

    // add verification
    const partition_key = event["artist_email"]
    const sorting_key = event["name#album_name#genre#year"]
    const uuid = v4();
    const artist_name = event["artist_name"]
    const data = event["data"]
        
    const putCommand = new PutCommand({
        TableName: 't_songs_test',
        Item: {
            "artist_email": partition_key,
            "name#album_name#genre#year":sorting_key,
            "uuid":uuid,
            "artist_name": artist_name,
            "data": data
        }
    });

    await docClient.send(putCommand);

    return {
        statusCode: 200,
        message: 'Song added successfully.'
    };
};
