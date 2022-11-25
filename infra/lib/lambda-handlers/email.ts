import * as SES from "aws-sdk/clients/ses";
import * as SM from "aws-sdk/clients/secretsmanager";

let ses = new SES({ region: "us-west-2" });
let sm = new SM({ region: "us-west-2" });

exports.handler = async function () {
  let password: string = "";

  await sm
    .getRandomPassword(function (err, data) {
      if (err) {
        throw err.stack;
      } else if (data.RandomPassword) {
        password = data.RandomPassword;
      } else {
        throw "Did not generate passoword";
      }
    })
    .promise();

  let emailParams = {
    Destination: {
      ToAddresses: ["Placeholder"],
    },
    Message: {
      Body: {
        Text: { Data: "Password: " + password },
      },

      Subject: { Data: "Generated Password" },
    },
    Source: "Placeholder",
  };

  return ses.sendEmail(emailParams).promise();
};
