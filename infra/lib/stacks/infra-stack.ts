import * as cdk from "aws-cdk-lib";
import { aws_lambda as lambda } from "aws-cdk-lib";
import * as path from "path";

export class InfraStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const fn = new lambda.Function(this, "HelloWorld", {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "hello-world.handler",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../lambda-handlers/hello-world.zip")
      ),
    });
  }
}
