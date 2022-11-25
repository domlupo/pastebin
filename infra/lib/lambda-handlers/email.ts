import * as SES from "aws-sdk/clients/ses";

let ses = new SES({ region: "us-west-2" });

exports.handler = async function () {
  var params = {
    Destination: {
      ToAddresses: ["Placeholder"],
    },
    Message: {
      Body: {
        Text: { Data: "Test" },
      },

      Subject: { Data: "Test Email" },
    },
    Source: "Placeholder",
  };

  return ses.sendEmail(params).promise();
};
