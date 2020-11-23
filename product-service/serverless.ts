import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'product-service',
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },
  plugins: [
    'serverless-webpack',
    'serverless-dotenv-plugin'
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    stage: 'dev',
    region: 'eu-west-1',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      SQS_URL: {
        Ref: "SQSQueue",
      },
      SNS_ARN: {
        Ref: "SNSTopic"
      }
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: "sqs:*",
        Resource: {
          "Fn::GetAtt": ["SQSQueue", "Arn"],
        },
      },
      {
        Effect: "Allow",
        Action: "sns:*",
        Resource: {
          Ref: "SNSTopic",
        },
      },
    ],
  },
  resources: {
    Resources: {
      SQSQueue: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "lesson6-hw-queue",
        },
      },
      SNSTopic: {
        Type: "AWS::SNS::Topic",
        Properties: {
          TopicName: "lesson6-hw-topic2",
        },
      },
      SNSSubscription: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          Endpoint: "cars-shop-aws@mailforspam.com",
          Protocol: "email",
          TopicArn: {
            Ref: "SNSTopic",
          },
        },
      },
    },
    Outputs: {
      SQSQueueUrl: {
        Value: {
          Ref: "SQSQueue",
        }
      },
      SQSQueueArn: {
        Value: {
          "Fn::GetAtt": ["SQSQueue", "Arn"],
        }
      },
    },
  },
  functions: {
    getProductList: {
      handler: 'handlers/getProductList.invoke',
      events: [
        {
          http: {
            method: 'get',
            path: 'products',
            cors: true
          }
        }
      ]
    },
    getProductById: {
      handler: 'handlers/getProductById.invoke',
      events: [
        {
          http: {
            method: 'get',
            path: 'products/{productId}',
            cors: true,
            request: {
              parameters: {
                paths: {
                  'productId': true
                }
              }
            }
          }
        }
      ]
    },
    addProduct: {
      handler: "handlers/addProduct.invoke",
      events: [
        {
          http: {
            method: "post",
            path: "products",
            cors: true,
          },
        },
      ],
    },
    catalogBatchProcess: {
      handler: "handlers/catalogBatchProcess.invoke",
      events: [
        {
          sqs: {
            batchSize: 5,
            arn: {
              "Fn::GetAtt": ["SQSQueue", "Arn"],
            },
          },
        },
      ]
    }
  },
}

module.exports = serverlessConfiguration;
