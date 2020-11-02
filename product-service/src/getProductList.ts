import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { productList } from './productList';
import { timeout } from './timeout';

export const getProductList: APIGatewayProxyHandler = async () => {
  try {
    await timeout(100);
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,GET",
        "Access-Control-Allow-Origin": "https://d3bq2tyrxffjd4.cloudfront.net",
      },
      body: JSON.stringify(productList)
    }
  } catch (e) {
    console.log(e);
  }
}
