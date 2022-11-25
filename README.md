# pastebin

A serverless [Pastebin](https://en.wikipedia.org/wiki/Pastebin) built using AWS and TypeScript. Will be used as a portfolio website since updating a Pastebin is less work than updating a static website. It is serverless since site interaction will be infrequent.

## Infrastructure

**lambdas**
- email lambda: Send email with new password every X days
- C: add paste lambda
- R: list pastes lambda
- D: delete paste lambda

**dynamodb table**
- title: String (Primary Key)
- creation_epoch: Number (Sort Key)
- content: String
- ttl: Number

## nice to have
- front end polish
- frontend mobile support
- markdown support
- documentation diagrams
- U: edit lambda
- dynamodb attribute: date edited
- dynamodb pagination (1MB limit)
- list pastes lambda: date filter instead of ttl dependent
