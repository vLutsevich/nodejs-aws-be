import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { Client } from "pg";
import { dbOptions } from './src/dbOptions';

export const invoke: APIGatewayProxyHandler = async event => {
  console.log('getProductList pathParameters: ', event.pathParameters);
  let client;
  try {
    client = new Client(dbOptions);
    await client.connect();

    const { rows: products } = await client.query(`
      select p.id, s.count, p.price, p.title, p.description
      from products as p
      join stocks as s on p.id = s.product_id
    `);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(products)
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error during database request executing, Cannot get list of products"
      })
    };
  } finally {
    // in case if error was occured, connection will not close automatically
    client?.end(); // manual closing of connection
  }
}
