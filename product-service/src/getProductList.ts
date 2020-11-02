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
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(productList)
    }
  } catch (e) {
    console.log(e);
  }
}
