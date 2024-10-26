import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import { PolicyStatement, Effect, AnyPrincipal } from 'aws-cdk-lib/aws-iam';
import { CUSTOMERS, RETAIL, RETAILCUSTOMERS } from '../config/constants';

const APP_NAME = RETAIL.charAt(0).toUpperCase();

export class RetailMainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC Setup
    const vpc = new ec2.Vpc(this, `${RETAIL}MainVPC`, {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        }
      ]
    });

    // Create a VPC Endpoint for DynamoDB
    const dynamodbGatewayEndpoint = vpc.addGatewayEndpoint('DynamoDbEndpoint', {
      service: ec2.GatewayVpcEndpointAwsService.DYNAMODB,
    });

    // ECR Endpoints
    vpc.addInterfaceEndpoint(`${APP_NAME}EcrEndpoint`, {
      service: ec2.InterfaceVpcEndpointAwsService.ECR,
    });
    vpc.addInterfaceEndpoint(`${APP_NAME}EcrDockerEndpoint`, {
      service: ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER,
    });

    // ECS Endpoints
    vpc.addInterfaceEndpoint(`${APP_NAME}EcsEndpoint`, {
      service: ec2.InterfaceVpcEndpointAwsService.ECS,
    });
    vpc.addInterfaceEndpoint(`${APP_NAME}EcsAgentEndpoint`, {
      service: ec2.InterfaceVpcEndpointAwsService.ECS_AGENT,
    });
    vpc.addInterfaceEndpoint(`${APP_NAME}EcsTelemetryEndpoint`, {
      service: ec2.InterfaceVpcEndpointAwsService.ECS_TELEMETRY,
    });

    // CloudWatch Logs Endpoint
    vpc.addInterfaceEndpoint(`${APP_NAME}CloudWatchLogsEndpoint`, {
      service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
    });

    // S3 Endpoint
    vpc.addGatewayEndpoint(`${APP_NAME}S3Endpoint`, {
      service: ec2.GatewayVpcEndpointAwsService.S3,
    });

    // ECS Cluster Setup (Shared Cluster for all microservices)
    const cluster = new ecs.Cluster(this, `${APP_NAME}EcsCluster`, {
      vpc: vpc,
      capacity: {
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL),
        desiredCapacity: 1,
        maxCapacity: 2,
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      },
    });

    const ecsSecurityGroup = new ec2.SecurityGroup(this, 'EcsSecurityGroup', {
      vpc,
      description: 'Allow access to DynamoDB',
    });

    // Allow outbound traffic only to DynamoDB
    ecsSecurityGroup.addEgressRule(
      ec2.Peer.prefixList(`com.amazonaws.${this.region}.dynamodb`),
      ec2.Port.tcp(443),
      'Allow outbound HTTPS traffic to DynamoDB'
    );

    // Create DynamoDB Table
    const customersTable = new dynamodb.Table(this, `${RETAILCUSTOMERS}Table`, {
      tableName: `${RETAIL}-${CUSTOMERS}-table`,
      partitionKey: { name: 'CustomersId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      encryption: dynamodb.TableEncryption.AWS_MANAGED
    });

    // Create ECS Task Definition
    const customersTaskDefinition = new ecs.Ec2TaskDefinition(this, `${RETAILCUSTOMERS}TaskDefinition`, {
      networkMode: ecs.NetworkMode.AWS_VPC,
    });

    // Import the ECR repository from ecr stack
    const customersRepository = ecr.Repository.fromRepositoryAttributes(this, 'ImportedCustomersEcrRepo', {
      repositoryArn: cdk.Fn.importValue(`${RETAILCUSTOMERS}EcrRepoArn`),
      repositoryName: cdk.Fn.importValue(`${RETAILCUSTOMERS}EcrRepoName`),
    });

    customersTaskDefinition.addContainer(`${RETAILCUSTOMERS}Container`, {
      image: ecs.ContainerImage.fromEcrRepository(customersRepository, 'latest'),
      memoryLimitMiB: 512,
      cpu: 256,
      environment: {
        IS_LOCAL: 'false',
        DYNAMODB_TABLE_NAME: customersTable.tableName,
        AWS_REGION: this.region

      },
      portMappings: [{ containerPort: 3000 }],
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: `${CUSTOMERS}-service`,
        logRetention: logs.RetentionDays.ONE_DAY
      }),
    });

    dynamodbGatewayEndpoint.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        principals: [new AnyPrincipal()],
        actions: [
          'dynamodb:PutItem',
          'dynamodb:GetItem',
          'dynamodb:UpdateItem',
          'dynamodb:DeleteItem',
          'dynamodb:Scan',
        ],
        resources: [
          `${customersTable.tableArn}`
        ],
        conditions: {
          'ArnEquals': {
            'aws:PrincipalArn': `${customersTaskDefinition.taskRole.roleArn}`
          }
        }
      })
    );

    // Grant DynamoDB permissions to the task
    customersTable.grantReadWriteData(customersTaskDefinition.taskRole);

    // Create ECS Service
    const customersEcsService = new ecs.Ec2Service(this, `${RETAILCUSTOMERS}EcsService`, {
      cluster,
      taskDefinition: customersTaskDefinition,
      desiredCount: 2,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      deploymentController: {
        type: ecs.DeploymentControllerType.ECS,
      },
    });

    // Create Application Load Balancer
    const alb = new elbv2.ApplicationLoadBalancer(this, `${APP_NAME}Alb`, {
      vpc: vpc,
      internetFacing: true,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    });

    // Add listener to ALB
    const listener = alb.addListener(`${APP_NAME}Listener`, { port: 80 });

    // Add ECS service as target to listener
    listener.addTargets(`${RETAILCUSTOMERS}Target`, {
      port: 3000,
      targets: [customersEcsService],
      protocol: elbv2.ApplicationProtocol.HTTP,
      healthCheck: { path: '/health' },
    });

    // Output
    new cdk.CfnOutput(this, `${APP_NAME}AlbDnsName`, { value: alb.loadBalancerDnsName });
    new cdk.CfnOutput(this, `${APP_NAME}EcsClusterName`, { value: cluster.clusterName });
    new cdk.CfnOutput(this, `${RETAILCUSTOMERS}EcrRepositoryURI`, { value: customersRepository.repositoryUri });

  }
}
