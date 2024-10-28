// AWS CDK Imports
import { AttributeType, BillingMode, Table, TableEncryption } from 'aws-cdk-lib/aws-dynamodb';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import { ContainerImage, LogDrivers } from 'aws-cdk-lib/aws-ecs';
import { Fn, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Repository } from 'aws-cdk-lib/aws-ecr';
// Cdk constructs imports
import { Construct } from 'constructs';
// Custom Config Imports
import { CUSTOMERS } from '../config/constants';
import { FARGATE_DEF_CONFIG } from '../config/ecs-config';
// Custom Interfaces Imports
import { FargateConfig } from '../interfaces/fargate-config';

export class RetailMainStack extends Stack {
  private readonly customersTable: Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const customersRepository = this.getEcrRepository(CUSTOMERS);
    const customersTable = this.createDynamoDbTable(CUSTOMERS, 'CustomersId');

    // Create Fargate Service with ALB
    const customerFargateService = this.createFargateService(
      CUSTOMERS,
      customersRepository,
      customersTable.tableName,
      FARGATE_DEF_CONFIG
    );

    // Grant DynamoDB permissions to the task
    customersTable.grantReadWriteData(customerFargateService.taskDefinition.taskRole);
  }

  /**
   * Dynamically imports an ECR repository based on the provided repository key.
   * @param {string} repoKey - Key to identify the repository (e.g., CUSTOMERS, RETAIL).
   * @returns {repo} - ECR Repository reference.
   */
  private getEcrRepository(repoKey: string): Repository {
    const importedRepo = Repository.fromRepositoryAttributes(this, `Imported${repoKey}EcrRepo`, {
      repositoryArn: Fn.importValue(`${repoKey}EcrRepoArn`),
      repositoryName: Fn.importValue(`${repoKey}EcrRepoName`),
    });

    // Cast to Repository to satisfy the type requirements
    return importedRepo as Repository;
  }

  /**
   * Dynamically creates a DynamoDB table with given configurations.
   * @param {string} tableKey - Key to identify the table (e.g., CUSTOMERS, RETAIL).
   * @param {string} partitionKey - Name of the partition key for the table.
   * @returns {Table} - Configured DynamoDB table instance.
   */
  private createDynamoDbTable(tableKey: string, partitionKey: string): Table {
    return new Table(this, `${tableKey}Table`, {
      tableName: `${tableKey}`,
      partitionKey: { name: partitionKey, type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      encryption: TableEncryption.AWS_MANAGED,
    });
  }

  /**
   * Creates a Fargate Service with ALB, attaching dynamic configurations and permissions.
   * @param {string} serviceKey - Key to identify the service (e.g., CUSTOMERS).
   * @param {Repository} repository - ECR Repository for the container image.
   * @param {string} dynamoDbTableName - DynamoDB table name for environment variables.
   * @param {FargateConfig} config - Configuration object containing container port, memory, desiredCount, and CPU.
   * @returns {ApplicationLoadBalancedFargateService} - The created Fargate service.
   */
  private createFargateService(
    serviceKey: string,
    repository: Repository,
    dynamoDbTableName: string,
    config: FargateConfig
  ): ApplicationLoadBalancedFargateService {
    const logGroup = new LogGroup(this, `${serviceKey}LogGroup`, {
      logGroupName: `ecs-${serviceKey}-service`,
      retention: RetentionDays.ONE_WEEK,
      removalPolicy: RemovalPolicy.DESTROY
    });

    const fargateService = new ApplicationLoadBalancedFargateService(this, `${serviceKey}FargateService`, {
      serviceName: `${serviceKey}Service`,
      taskImageOptions: {
        image: ContainerImage.fromEcrRepository(repository, 'latest'),
        containerPort: config.containerPort,
        environment: this.getServiceEnvironmentVariables(dynamoDbTableName),
        logDriver: LogDrivers.awsLogs({
          logGroup: logGroup,
          streamPrefix: `${serviceKey}-container`,
        }),
      },
      memoryLimitMiB: config.memoryLimitMiB,
      cpu: config.cpu,
      desiredCount: config.desiredCount,
      publicLoadBalancer: true,
      assignPublicIp: true,
    });

    fargateService.targetGroup.configureHealthCheck({
      path: '/health',
    });

    return fargateService;
  }

  /**
   * Returns environment variables for the service.
   * @param {string} dynamoDbTableName - DynamoDB table name for the environment variable.
   * @returns {Record<string, string>} - Environment variables for the ECS service.
   */
  private getServiceEnvironmentVariables(dynamoDbTableName: string): Record<string, string> {
    return {
      IS_LOCAL: 'false',
      DYNAMODB_TABLE_NAME: dynamoDbTableName,
    };
  }
}
