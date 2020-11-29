import { S3Event, S3Handler } from 'aws-lambda';
import 'source-map-support/register';
import { S3, SQS } from 'aws-sdk';
import { BUCKET_NAME, PARSED_FOLDER_NAME, REGION, UPLOAD_FOLDER_NAME } from '../config';
import * as csv from 'csv-parser';

//? if will be async word it will not work (related with stream)
export const invoke = (event: S3Event, context, callback) => {
  const s3 = new S3({ region: REGION });
  const sqs = new SQS({ region: REGION });

  for (const record of event.Records) {
    const initialKey = record.s3.object.key;

    const s3Stream = s3.getObject({
      Bucket: BUCKET_NAME,
      Key: initialKey
    }).createReadStream();

    s3Stream
      .pipe(csv())
      .on('data', (data) => {
        console.log("Reading data from csv", data);

        const product = JSON.stringify(data);
        sqs.sendMessage(
          {
            QueueUrl: process.env.SQS_URL,
            MessageBody: product,
          },
          () => {
            console.log("Send message for:" + product);
          }
        );
      })
      .on('error', (error) => {
        console.error("Parse csv error", error);
      })
      .on('end', async () => {
        const newKey = initialKey.replace(
          UPLOAD_FOLDER_NAME,
          PARSED_FOLDER_NAME
        );

        await s3.copyObject({
          Bucket: BUCKET_NAME,
          CopySource: `${BUCKET_NAME}/${initialKey}`,
          Key: newKey
        }).promise();

        await s3.deleteObject({
          Bucket: BUCKET_NAME,
          Key: initialKey
        }).promise();

        console.log(`Moved from ${BUCKET_NAME}/${initialKey} to ${BUCKET_NAME}/${newKey}`);
      });
  }

  callback(null, {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  })
}
