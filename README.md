# pastebin

A serverless [Pastebin](https://en.wikipedia.org/wiki/Pastebin) built using AWS and TypeScript. Will be used as a portfolio website since updating a Pastebin is less work than updating a static website. It is serverless since site interaction will be infrequent.

## Infrastructure

**lambdas**
- email lambda: Send email with new password every X days
- add paste lambda
- scan paste lambda
- delete paste lambda

**dynamodb pastes table**
- title: String (Primary Key)
- creation_epoch: Number (Sort Key)
- content: String
- ttl: Number

**dynamodb users table**
- name: String (Primary Key)
- password: String

## nice to have
- front end polish
- frontend mobile support
- markdown support
- README documentation diagrams
- edit lambda
- dynamodb attribute: display order
- dynamodb pagination (current 100 item limit)
- scan paste lambda: date filter instead of ttl dependent
- salted passwords
