const { DynamoDBClient, ListTablesCommand } = require('@aws-sdk/client-dynamodb');

// Configuration
const isLocal = process.env.IS_LOCAL;
const region = process.env.AWS_REGION || 'eu-west-1';

// DynamoDB client configuration
const config = {
  region: region,
};

// If running locally, use local DynamoDB instance
if (isLocal) {
    config.endpoint = process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000';
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

// Export the DynamoDB client and helper functions
module.exports = {
  getTableName,
  listAllTables
};
