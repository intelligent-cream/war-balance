#!/bin/sh
set -e

echo "Installing dependencies with uv..."
uv sync

echo "Installing pre-commit hooks..."
uv run pre-commit install

echo "Setup complete!"
