import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {PutCommand, DynamoDBDocumentClient} from '@aws-sdk/lib-dynamodb';
import { v4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async(event, context) => {

    // add token verification
    console.log(event)
    const partition_key = event["body"]["artista_email"];
    const sorting_key = event["body"]["genre#release-date"];
    const uuid = v4(); // GSI
    const genre = event["body"]["genre"];
    const album_uuid = event["body"]["album_uuid"];
    const name = event["body"]["name"];
    const data = event["body"]["data"];
    const tableName = process.env.TABLE_NAME;

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
            "artista_email": partition_key,
            "genre#release-date":sorting_key,
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
