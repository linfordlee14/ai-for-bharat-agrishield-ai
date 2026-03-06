import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { StorageStack } from '../lib/storage-stack';

describe('StorageStack', () => {
  let app: cdk.App;
  let stack: StorageStack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new StorageStack(app, 'TestStorageStack', {
      environment: 'test',
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });
    template = Template.fromStack(stack);
  });

  test('Creates DynamoDB Incidents Table', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'agrishield-incidents-test',
      BillingMode: 'PAY_PER_REQUEST',
      PointInTimeRecoverySpecification: {
        PointInTimeRecoveryEnabled: true,
      },
    });
  });

  test('Creates DynamoDB Devices Table', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'agrishield-devices-test',
    });
  });

  test('Creates DynamoDB Telemetry Table with TTL', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'agrishield-telemetry-test',
      TimeToLiveSpecification: {
        AttributeName: 'ttl',
        Enabled: true,
      },
    });
  });

  test('Creates Media S3 Bucket with Encryption', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          {
            ServerSideEncryptionByDefault: {
              SSEAlgorithm: 'AES256',
            },
          },
        ],
      },
      VersioningConfiguration: {
        Status: 'Enabled',
      },
    });
  });

  test('Creates SNS Topics', () => {
    template.resourceCountIs('AWS::SNS::Topic', 2);
  });

  test('Incidents Table has GSI for species-timestamp', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      GlobalSecondaryIndexes: [
        {
          IndexName: 'species-timestamp-index',
          KeySchema: [
            {
              AttributeName: 'species',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'timestamp',
              KeyType: 'RANGE',
            },
          ],
        },
      ],
    });
  });
});
