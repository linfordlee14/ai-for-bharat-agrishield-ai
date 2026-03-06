#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import { IoTStack } from '../lib/iot-stack';
import { StorageStack } from '../lib/storage-stack';
import { LambdaStack } from '../lib/lambda-stack';
import { FrontendStack } from '../lib/frontend-stack';

// Load environment variables
dotenv.config();

// Get environment configuration
const environment = process.env.ENVIRONMENT || 'dev';
const account = process.env.AWS_ACCOUNT_ID || process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.AWS_REGION || process.env.CDK_DEFAULT_REGION || 'us-east-1';

// Validate required environment variables
if (!account) {
  throw new Error('AWS_ACCOUNT_ID or CDK_DEFAULT_ACCOUNT must be set');
}

// Create CDK app
const app = new cdk.App();

// Get environment from context (command line) or environment variable
const contextEnv = app.node.tryGetContext('environment');
const env = contextEnv || environment;

// Stack naming prefix
const stackPrefix = `AgriShield-${env.charAt(0).toUpperCase() + env.slice(1)}`;

// Common stack props
const stackProps: cdk.StackProps = {
  env: {
    account,
    region,
  },
  tags: {
    Project: 'AgriShield',
    Environment: env,
    ManagedBy: 'CDK',
  },
};

// Create Storage Stack (DynamoDB, S3, SNS)
// This stack has no dependencies and provides foundational resources
const storageStack = new StorageStack(app, `${stackPrefix}-Storage`, {
  ...stackProps,
  description: 'AgriShield AI Storage Infrastructure - DynamoDB tables, S3 buckets, and SNS topics',
  environment: env,
});

// Create IoT Stack (IoT Core, Thing Types, Policies, Rules)
// Depends on Storage Stack for DynamoDB tables and SNS topics
const iotStack = new IoTStack(app, `${stackPrefix}-IoT`, {
  ...stackProps,
  description: 'AgriShield AI IoT Infrastructure - IoT Core, device authentication, and message routing',
  environment: env,
  incidentsTable: storageStack.incidentsTable,
  devicesTable: storageStack.devicesTable,
  telemetryTable: storageStack.telemetryTable,
  movementEventsTable: storageStack.movementEventsTable,
  mediaBucket: storageStack.mediaBucket,
  alertsTopic: storageStack.alertsTopic,
  monitoringTopic: storageStack.monitoringTopic,
});
iotStack.addDependency(storageStack);

// Create Lambda Stack (Lambda functions for event processing)
// Depends on Storage Stack and IoT Stack
const lambdaStack = new LambdaStack(app, `${stackPrefix}-Lambda`, {
  ...stackProps,
  description: 'AgriShield AI Lambda Functions - Event processing, alerting, and device management',
  environment: env,
  incidentsTable: storageStack.incidentsTable,
  devicesTable: storageStack.devicesTable,
  telemetryTable: storageStack.telemetryTable,
  movementEventsTable: storageStack.movementEventsTable,
  mediaBucket: storageStack.mediaBucket,
  modelsBucket: storageStack.modelsBucket,
  firmwareBucket: storageStack.firmwareBucket,
  alertsTopic: storageStack.alertsTopic,
  monitoringTopic: storageStack.monitoringTopic,
  iotEndpoint: iotStack.iotEndpoint,
});
lambdaStack.addDependency(storageStack);
lambdaStack.addDependency(iotStack);

// Create Frontend Stack (Cognito, API Gateway, CloudFront)
// Depends on Lambda Stack for API endpoints
const frontendStack = new FrontendStack(app, `${stackPrefix}-Frontend`, {
  ...stackProps,
  description: 'AgriShield AI Frontend Infrastructure - Cognito authentication, API Gateway, and CloudFront',
  environment: env,
  incidentsTable: storageStack.incidentsTable,
  devicesTable: storageStack.devicesTable,
  telemetryTable: storageStack.telemetryTable,
  movementEventsTable: storageStack.movementEventsTable,
  mediaBucket: storageStack.mediaBucket,
  iotEndpoint: iotStack.iotEndpoint,
});
frontendStack.addDependency(lambdaStack);

// Add stack outputs
new cdk.CfnOutput(storageStack, 'IncidentsTableName', {
  value: storageStack.incidentsTable.tableName,
  description: 'DynamoDB Incidents Table Name',
  exportName: `${stackPrefix}-IncidentsTable`,
});

new cdk.CfnOutput(storageStack, 'MediaBucketName', {
  value: storageStack.mediaBucket.bucketName,
  description: 'S3 Media Bucket Name',
  exportName: `${stackPrefix}-MediaBucket`,
});

new cdk.CfnOutput(iotStack, 'IoTEndpoint', {
  value: iotStack.iotEndpoint,
  description: 'AWS IoT Core Endpoint',
  exportName: `${stackPrefix}-IoTEndpoint`,
});

new cdk.CfnOutput(frontendStack, 'UserPoolId', {
  value: frontendStack.userPoolId,
  description: 'Cognito User Pool ID',
  exportName: `${stackPrefix}-UserPoolId`,
});

new cdk.CfnOutput(frontendStack, 'ApiEndpoint', {
  value: frontendStack.apiEndpoint,
  description: 'API Gateway Endpoint',
  exportName: `${stackPrefix}-ApiEndpoint`,
});

// Synthesize the app
app.synth();
