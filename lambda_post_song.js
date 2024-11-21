import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {PutCommand, DynamoDBDocumentClient} from '@aws-sdk/lib-dynamodb';
import { v4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async(event, context) => {

    // add token verification
    const partition_key = event["artista_email"]
    const sorting_key = event["genre#release-date"]
    const uuid = v4(); // GSI
    const genre = event["genre"]
    const album_uuid = event["album_uuid"]
    const name = event["name"]
    const data = event["data"]

    if (!(partition_key && sorting_key && uuid && genre && album_uuid && name && data)) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Fill in all the required fields."
            })
        };
    }

    const putCommand = new PutCommand({
        TableName: 't_songs_test',
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
