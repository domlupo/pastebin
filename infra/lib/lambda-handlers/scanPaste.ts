import * as DDB from "aws-sdk/clients/dynamodb";

let ddb = new DDB({ region: "us-west-2" });

exports.handler = async function (event: { routeKey: any; body: string }) {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    const scanResult = await ddb
      .scan(
        {
          TableName: "pastes",
          Limit: 100,
        },
        function (err, data) {
          if (err) {
            console.log("Error", err);
          } else {
            console.log("Success", data);
          }
        }
      )
      .promise();

    body = scanResult.Items;
  } catch (err) {
    statusCode = 400;
    if (err instanceof Error) {
      body = err.message;
    }
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
};
