import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { productList } from './mock/productList';

export const getProductList: APIGatewayProxyHandler = async () => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      "Access-Control-Allow-Methods": "OPTIONS,GET",
      "Access-Control-Allow-Origin": "https://d3bq2tyrxffjd4.cloudfront.net",
    },
    body: JSON.stringify(productList)
  };
}
