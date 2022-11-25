import { App, aws_lambda as lambda, StackProps, Stack } from "aws-cdk-lib";
import {
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import * as path from "path";

export class InfraStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const emailLambdaRole = new Role(this, "EmailRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    });
    emailLambdaRole.addToPolicy(
      new PolicyStatement({
        resources: ["*"],
        actions: [
          "ses:SendEmail",
          "ses:SendRawEmail",
          "secretsmanager:GetRandomPassword",
        ],
      })
    );
    emailLambdaRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );

    const fn = new lambda.Function(this, "Email", {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "email.handler",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../lambda-handlers/email.zip")
      ),
      role: emailLambdaRole,
    });
  }
}
