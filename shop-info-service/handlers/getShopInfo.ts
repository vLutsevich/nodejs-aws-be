import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';

export const getShopInfo: APIGatewayProxyHandler = async (event, _context) => {
  console.log(event)
  return {
    statusCode: 200,
    body: JSON.stringify({
      shopName: 'My Shop',
      workingHours: 'From - Till'
    }),
  };
}
