import { App, aws_lambda as lambda, StackProps, Stack } from "aws-cdk-lib";
import {
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import * as path from "path";

export class InfraStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const emailLambdaRole = new Role(this, "EmailLambdaRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    });
    emailLambdaRole.addToPolicy(
      new PolicyStatement({
        resources: ["*"],
        actions: [
          "secretsmanager:GetRandomPassword",
          "ses:SendEmail",
          "ses:SendRawEmail",
        ],
      })
    );
    emailLambdaRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );
    new lambda.Function(this, "Email", {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "email.handler",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../lambda-handlers/email.zip")
      ),
      role: emailLambdaRole,
    });

    const addPasteLambdaRole = new Role(this, "AddPasteLambdaRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    });
    addPasteLambdaRole.addToPolicy(
      new PolicyStatement({
        resources: ["*"],
        actions: ["dynamodb:PutItem"],
      })
    );
    addPasteLambdaRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );
    const addPasteLambda = new lambda.Function(this, "AddPaste", {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "addPaste.handler",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../lambda-handlers/addPaste.zip")
      ),
      role: addPasteLambdaRole,
    });

    const api = new RestApi(this, "PasteBin", {
      restApiName: "PasteBin",
    });
    const addPasteIntegration = new LambdaIntegration(addPasteLambda, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' },
    });
    const pastes = api.root.addResource("{pastes}");
    pastes.addMethod("POST", addPasteIntegration);

    new Table(this, "UsersTable", {
      tableName: "users",
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "name", type: AttributeType.STRING },
    });

    new Table(this, "PastesTable", {
      tableName: "pastes",
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "title", type: AttributeType.STRING },
      sortKey: { name: "creation_epoch_ms", type: AttributeType.NUMBER },
      timeToLiveAttribute: "ttl",
    });
  }
}
