import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { paginateScan, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

// parece que funciona

export const handler = async (event) => {
  const tableName = process.env.TABLE_NAME;
  
  const pagination_config = {
    client: ddbDocClient,
    pageSize: 5,
  };
  const command_input = {
    TableName: tableName,
  };
  
  const paginatedQuery = paginateScan(
    pagination_config,
    command_input,
  );
  
  try {
    const result = [];
    for await (const page of paginatedQuery) {
      result.push(...page.Items)
    }
    
    return {
      statusCode: 200,
      body: {
        items: result,
        count: result.length
      }
    };
  }
  catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({error: err.message})
    };
  }
};