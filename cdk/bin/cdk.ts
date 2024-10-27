#!/usr/local/opt/node/bin/node
import * as cdk from 'aws-cdk-lib';
import { CUSTOMERS } from '../config/constants';
import { RetailEcrStack } from '../lib/ecr-stack';
import { RetailMainStack } from '../lib/main-stack';
import 'source-map-support/register';

const app = new cdk.App();

const serviceNames = [CUSTOMERS];

const ecrStack = new RetailEcrStack(app, 'RetailEcrStack', serviceNames);
const mainStack = new RetailMainStack(app, 'RetailMainStack');

mainStack.addDependency(ecrStack);