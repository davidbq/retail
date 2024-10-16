#!/bin/bash

if [ -z "$1" ]; then
  echo "Please provide a service name"
  exit 1
fi

SERVICE_NAME="$1-service"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -d "$SCRIPT_DIR/$SERVICE_NAME" ]; then
  echo "Warning: $SERVICE_NAME already exists. Do you want to overwrite it? (y/n)"
  read -r response
  if [[ ! $response =~ ^[Yy]$ ]]; then
    echo "Operation cancelled."
    exit 1
  fi
fi

if [ ! -d "$SCRIPT_DIR/node-template-service" ]; then
  echo "Error: node-template-service directory not found in the script's directory."
  exit 1
fi

cp -r "$SCRIPT_DIR/node-template-service" "$SCRIPT_DIR/$SERVICE_NAME"

if [ $? -eq 0 ]; then
  echo "$SERVICE_NAME service created successfully in $SCRIPT_DIR/$SERVICE_NAME"
else
  echo "Error: Failed to create $SERVICE_NAME service"
  exit 1
fi
