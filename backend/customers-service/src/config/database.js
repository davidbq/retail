const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');

const isLocal = process.env.IS_LOCAL === 'true';

const client = isLocal ?
    // Local development configuration
    new DynamoDBClient({
        endpoint: 'http://customers-db:8000',
        credentials: {
            accessKeyId: 'dummy',
            secretAccessKey: 'dummy',
        },
        region: 'local'
    }) :
    // AWS production configuration
    new DynamoDBClient();

// Helper function to get a table name with optional prefix for different environments
const getTableName = (baseName) => {
    const prefix = process.env.DYNAMODB_TABLE_PREFIX || '';
    return `${prefix}${baseName}`;
};

const getAllItems = async (tableName) => {
  try {
    const params = {
      TableName: tableName,
    };

    const command = new ScanCommand(params);
    const data = await client.send(command);

    // Unmarshall the items
    const items = data.Items.map(item => unmarshall(item));

    return items;
  } catch (error) {
    console.error('Error getting all items:', error);
    throw error;
  }
};

module.exports = {
  getTableName,
  getAllItems
};
