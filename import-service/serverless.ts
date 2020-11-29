import type { Serverless } from 'serverless/aws';
import { BUCKET_NAME, REGION, UPLOAD_FOLDER_NAME } from './config';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'import-service',
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    stage: 'dev',
    region: REGION,
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      SQS_URL:
        "${cf:product-service-${self:provider.stage}.SQSQueueUrl}",
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 's3:ListBucket',
        Resource: [
          `arn:aws:s3:::${BUCKET_NAME}`
        ]
      },
      {
        Effect: 'Allow',
        Action: 's3:*',
        Resource: [
          `arn:aws:s3:::${BUCKET_NAME}/*`
        ]
      },
      {
        Effect: "Allow",
        Action: "sqs:*",
        Resource: "${cf:product-service-${self:provider.stage}.SQSQueueArn}",
      },
    ]
  },
  functions: {
    importProductsFile: {
      handler: 'handlers/importProductsFile.invoke',
      events: [
        {
          http: {
            method: 'get',
            path: 'import',
            request: {
              parameters: {
                querystrings: {
                  name: true
                }
              }
            }
          }
        }
      ]
    },
    importFileParser: {
      handler: 'handlers/importFileParser.invoke',
      events: [
        {
          s3: {
            bucket: BUCKET_NAME,
            event: 's3:ObjectCreated:*',
            rules: [
              { prefix: `${UPLOAD_FOLDER_NAME}/`, suffix: '' }
            ],
            existing: true
          }
        }
      ]
    }
  }
}

module.exports = serverlessConfiguration;
