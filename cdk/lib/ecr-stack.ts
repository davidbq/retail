import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Repository } from 'aws-cdk-lib/aws-ecr';
// Cdk constructs imports
import { Construct } from 'constructs';

export class RetailEcrStack extends Stack {

  constructor(scope: Construct, id: string, servicesNames: string[], props?: StackProps) {
    super(scope, id, props);

    // Create ECR repositories for each service
    servicesNames.forEach((serviceName) => {
      this.createEcrRepository(serviceName);
    });
  }

  /**
   * Creates an ECR repository with the specified service name and outputs ARN and name.
   * @param {string} serviceName - The service name for the ECR repository.
   */
  private createEcrRepository(serviceName: string): void {
    // Create ECR Repository
    const repository = new Repository(this, `${serviceName}EcrRepo`, {
      repositoryName: `${serviceName}-repo`,
      removalPolicy: RemovalPolicy.DESTROY,
      emptyOnDelete: true,
    });

    // Export the ECR repository ARN and name
    new CfnOutput(this, `${serviceName}EcrRepoArn`, {
      value: repository.repositoryArn,
      exportName: `${serviceName}EcrRepoArn`,
    });

    new CfnOutput(this, `${serviceName}EcrRepositoryName`, {
      value: repository.repositoryName,
      exportName: `${serviceName}EcrRepoName`,
    });
  }
}
