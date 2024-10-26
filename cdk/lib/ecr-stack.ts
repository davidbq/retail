import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';
import { CUSTOMERS, SERVICE, RETAIL, RETAILCUSTOMERS } from '../config/constants';

export class RetailEcrStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create ECR Repository
    const customersRepository = new ecr.Repository(this, `${RETAILCUSTOMERS}EcrRepo`, {
      repositoryName: `${RETAIL}-${CUSTOMERS}-${SERVICE}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true
    });

    // Export the ECR repository ARN and name
    new cdk.CfnOutput(this, `${RETAILCUSTOMERS}EcrRepoArn`, {
        value: customersRepository.repositoryArn,
        exportName: `${RETAILCUSTOMERS}EcrRepoArn`
      });

      new cdk.CfnOutput(this, `${RETAILCUSTOMERS}EcrRepositoryName`, {
        value: customersRepository.repositoryName,
        exportName: `${RETAILCUSTOMERS}EcrRepoName`
      });
  }
}
