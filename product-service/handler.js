'use strict';

module.exports.hello = async event => {
  return {
    statusCode: 200,
    body: {
      productName: 'Book',
      price: 123,
    },
  };
};
