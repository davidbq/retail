const { DynamoDBClient, ListTablesCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');

// Configuration
const isLocal = process.env.IS_LOCAL;
const region = process.env.AWS_REGION || 'local';

// DynamoDB client configuration
const config = {
  region: region,
};

// If running locally, use local DynamoDB instance
if (isLocal === 'true') {
    config.endpoint = 'http://customers-db:8000';
    config.credentials = {
      accessKeyId: 'dummy',
      secretAccessKey: 'dummy',
      region: 'local'
    };
}

// Create DynamoDB client
const client = new DynamoDBClient(config);

// Function to list all tables
const listAllTables = async () => {
    try {
      let tables = [];
      let lastEvaluatedTableName = null;
      do {
        const params = {
          Limit: 100,
          ExclusiveStartTableName: lastEvaluatedTableName
        };
        const command = new ListTablesCommand(params);
        const response = await client.send(command);
        tables = tables.concat(response.TableNames);
        lastEvaluatedTableName = response.LastEvaluatedTableName;
      } while (lastEvaluatedTableName);

      return tables;
    } catch (error) {
      console.error('Error listing tables:', error);
      throw error;
    }
  };

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

// Export the DynamoDB client and helper functions
module.exports = {
  getTableName,
  listAllTables,
  getAllItems
};
