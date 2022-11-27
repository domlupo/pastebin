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
import { Construct } from "constructs";

class Email extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // IAM Role
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

    // Lambda function
    new lambda.Function(this, "Email", {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "email.handler",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../lambda-handlers/email.zip")
      ),
      role: emailLambdaRole,
    });
  }
}

class Pastes extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // add paste IAM Role
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

    // add paste Lambda function
    const addPasteLambda = new lambda.Function(this, "AddPaste", {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "addPaste.handler",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../lambda-handlers/addPaste.zip")
      ),
      role: addPasteLambdaRole,
    });

    // delete paste IAM Role
    const deletePasteLambdaRole = new Role(this, "DeletePasteLambdaRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    });
    deletePasteLambdaRole.addToPolicy(
      new PolicyStatement({
        resources: ["*"],
        actions: ["dynamodb:DeleteItem"],
      })
    );
    deletePasteLambdaRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );

    // delete paste Lambda function
    const deletePasteLambda = new lambda.Function(this, "DeletePaste", {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "deletePaste.handler",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../lambda-handlers/deletePaste.zip")
      ),
      role: deletePasteLambdaRole,
    });

    // paste Gateway API
    const api = new RestApi(this, "PasteBin", {
      restApiName: "PasteBin",
    });
    const addPasteIntegration = new LambdaIntegration(addPasteLambda, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' },
    });
    const deletePasteIntegration = new LambdaIntegration(deletePasteLambda, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' },
    });
    const pastes = api.root.addResource("{pastes}");
    pastes.addMethod("POST", addPasteIntegration);
    pastes.addMethod("DELETE", deletePasteIntegration);
  }
}

class Database extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

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

export class PastebinStack extends Construct {
  constructor(scope: App, id: string) {
    super(scope, id);

    new Email(this, "Email");
    new Pastes(this, "Pastes");
    new Database(this, "Database");
  }
}
