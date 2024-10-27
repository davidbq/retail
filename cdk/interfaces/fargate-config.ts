export interface FargateConfig {
    memoryLimitMiB: number;
    cpu: number;
    containerPort: number;
    desiredCount: number;
  }
