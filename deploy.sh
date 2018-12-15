#!/usr/bin/env bash


sam package --template-file template.yaml --s3-bucket oha-geruge-packages --output-template-file packaged.yaml
sam deploy --template-file packaged.yaml --stack-name oha-geruge --capabilities CAPABILITY_IAM