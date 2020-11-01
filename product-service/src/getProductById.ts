import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { productList } from './mock/productList';

export const getProductById: APIGatewayProxyHandler = async (event) => {
  const { productId } = event.pathParameters;
  const productIndex = productList.findIndex(x => x.id === productId);

  return {
    statusCode: 200,
    body: JSON.stringify(productList[productIndex])
  };
}
