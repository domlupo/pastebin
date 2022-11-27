import * as DDB from "aws-sdk/clients/dynamodb";

let ddb = new DDB({ region: "us-west-2" });

exports.handler = async function (event: { routeKey: any; body: string }) {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    let requestJSON = JSON.parse(event.body);
    await ddb
      .deleteItem(
        {
          TableName: "pastes",
          Key: {
            title: {
              S: requestJSON.title,
            },
            creation_epoch_ms: {
              N: requestJSON.creation_epoch_ms,
            },
          },
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
    body = `Delete item ${requestJSON.title}`;
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
