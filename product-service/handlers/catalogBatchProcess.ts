import { SQSEvent, SQSHandler } from 'aws-lambda';
import 'source-map-support/register';
import { Client, QueryResult } from "pg";
import { dbOptions } from '../utils/dbOptions';
import { Product, validateProduct } from '../models/productShema';
import { SNS } from "aws-sdk";

async function addProductToDB(client: Client, product: Product) {
  try {
    const { title, description, price, count } = product;

    await client.query("begin"); // transaction starts
    const insertedProductRes: QueryResult<Product> = await client.query(
      "insert into products (title, description, price) values ($1, $2, $3) returning *",
      [title, description, price]
    );
    const insertedProduct: Product = insertedProductRes.rows[0];

    await client.query(
      "insert into stocks (product_id, count) values ($1, $2)",
      [insertedProduct.id, count]
    );
    await client.query("commit"); // transaction ends
  } catch (err) {
    await client.query("rollback"); // cancel transaction
    console.error("Error while inserting product into DB", product, err);
  }
}

async function emailNotify(products: Product[]) {
  const sns = new SNS({ region: 'eu-west-1'});

  const text = `${products.length} products were successfully inserted into DB:`;

  return new Promise((resolve) => {
    sns.publish(
      {
        Subject: "New Products",
        Message: text + '\r\n' + products.map(product => JSON.stringify(product)).join('\r\n'),
        TopicArn: process.env.SNS_ARN,
      },
      () => {
        console.log("Send email for created products");
        resolve();
      }
    );
  });
}

export const invoke: SQSHandler = async (event: SQSEvent) => {
  let client: Client;
  const products: Product[] = [];
  try {
    client = new Client(dbOptions);
    await client.connect();
  } catch (err) {
    console.error("DB Connection error", err);
    return;
  }

  for (let { body } of event.Records) {
    try {
      const { title, description, price, count } = JSON.parse(body);
      const product: Product = {
        title,
        description,
        price: price ? Number(price) : 0,
        count: count ? Number(count) : 0,
      };

      if (validateProduct(product)) {
        throw "Validation Error";
      }

      await addProductToDB(client, product);
      products.push(product);
    } catch (err) {
      console.error(`Error parse product: ${body}`, err);
    }
  }

  // not use finally, because it closes client before other messages from queue received
  await client.end;

  await emailNotify(products);
}
