import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { productList } from './productList';
import { timeout } from './timeout';

export const getProductById: APIGatewayProxyHandler = async (event) => {
  try {
    await timeout(100);
    const { productId } = event.pathParameters;
    const productIndex = productList.findIndex(x => x.id === productId);

    if (productIndex === -1) {
      return ({
        statusCode: 404,
        body: JSON.stringify({ error: 'Product Not Found'})
      });
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(productList[productIndex])
    };
  } catch(e) {
    console.log(e);
  }

}
