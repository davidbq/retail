#!/usr/local/opt/node/bin/node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { RetailEcrStack } from '../lib/ecr-stack';
import { RetailMainStack } from '../lib/main-stack';

const app = new cdk.App();

const ecrStack = new RetailEcrStack(app, 'RetailEcrStack');
const mainStack = new RetailMainStack(app, 'RetailMainStack');

mainStack.addDependency(ecrStack);