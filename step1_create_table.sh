#!/bin/bash
# Step 1: Create Scoring Value Table using ServiceNow CLI

echo "=== STEP 1: CREATE SCORING VALUE TABLE ==="
echo ""

# Step 1: Create the table definition in sys_db_object
echo "1. Creating table definition..."
snc record create \
  --table sys_db_object \
  --data '{
    "name": "x_1447726_planni_0_scoring_value",
    "label": "Scoring Value",
    "is_extendable": "false",
    "access": "public",
    "sys_scope": "a5f4579e8314b6101d51c9a6feaad309"
  }'

echo ""
echo "2. Creating field: scoring_method (reference)..."
snc record create \
  --table sys_dictionary \
  --data '{
    "name": "x_1447726_planni_0_scoring_value",
    "element": "scoring_method",
    "column_label": "Scoring Method",
    "internal_type": "reference",
    "reference": "x_1447726_planni_0_scoring_method",
    "mandatory": "true",
    "display": "true"
  }'

echo ""
echo "3. Creating field: display_value (string)..."
snc record create \
  --table sys_dictionary \
  --data '{
    "name": "x_1447726_planni_0_scoring_value",
    "element": "display_value",
    "column_label": "Display Value",
    "internal_type": "string",
    "max_length": "40",
    "mandatory": "true",
    "display": "true",
    "comments": "The value shown to users (e.g., XS, ?, 5)"
  }'

echo ""
echo "4. Creating field: actual_value (decimal)..."
snc record create \
  --table sys_dictionary \
  --data '{
    "name": "x_1447726_planni_0_scoring_value",
    "element": "actual_value",
    "column_label": "Actual Value",
    "internal_type": "decimal",
    "mandatory": "true",
    "comments": "The numeric value used for calculations"
  }'

echo ""
echo "5. Creating field: sequence (integer)..."
snc record create \
  --table sys_dictionary \
  --data '{
    "name": "x_1447726_planni_0_scoring_value",
    "element": "sequence",
    "column_label": "Sequence",
    "internal_type": "integer",
    "mandatory": "true",
    "default_value": "100",
    "comments": "Display order"
  }'

echo ""
echo "6. Creating field: description (string)..."
snc record create \
  --table sys_dictionary \
  --data '{
    "name": "x_1447726_planni_0_scoring_value",
    "element": "description",
    "column_label": "Description",
    "internal_type": "string",
    "max_length": "255",
    "comments": "Optional tooltip"
  }'

echo ""
echo "7. Creating field: active (boolean)..."
snc record create \
  --table sys_dictionary \
  --data '{
    "name": "x_1447726_planni_0_scoring_value",
    "element": "active",
    "column_label": "Active",
    "internal_type": "boolean",
    "mandatory": "true",
    "default_value": "true"
  }'

echo ""
echo "✅ Table creation complete!"
echo "Next: Run step2_migrate_data.sh"
