import * as DDB from "aws-sdk/clients/dynamodb";

let ddb = new DDB({ region: "us-west-2" });

exports.handler = async function (event: { routeKey: any; body: string }) {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    switch (event.routeKey) {
      case "PUT /pastes":
        let requestJSON = JSON.parse(event.body);
        await ddb
          .putItem(
            {
              TableName: "pastes",
              Item: {
                title: {
                  S: requestJSON.title,
                },
                creation_epoch_ms: {
                  N: Date.now().toString(),
                },
                content: {
                  S: requestJSON.content,
                },
                // TODO add optional TTL
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
        body = `Put item ${requestJSON}`;
        break;
      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
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
