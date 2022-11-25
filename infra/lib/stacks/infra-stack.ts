import { App, aws_lambda as lambda, StackProps, Stack } from "aws-cdk-lib";
import * as path from "path";

export class InfraStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
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
