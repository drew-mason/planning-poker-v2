#!/bin/bash
# Step 2: Migrate scoring values from CSV to child table using ServiceNow CLI

echo "=== STEP 2: MIGRATE SCORING VALUES ==="
echo ""

# Define the actual table name with u_ prefix
TABLE_NAME="u_x_1447726_planni_0_scoring_value"

# T-Shirt size mappings
declare -A TSHIRT_MAP
TSHIRT_MAP[XS]=1
TSHIRT_MAP[S]=2
TSHIRT_MAP[M]=3
TSHIRT_MAP[L]=5
TSHIRT_MAP[XL]=8
TSHIRT_MAP[XXL]=13
TSHIRT_MAP[XXXL]=21

# Special character mappings
declare -A SPECIAL_MAP
SPECIAL_MAP["?"]="-1"
SPECIAL_MAP["☕"]="0"
SPECIAL_MAP["🎯"]="-2"
SPECIAL_MAP["∞"]="999"
SPECIAL_MAP["Pass"]="0"
SPECIAL_MAP["pass"]="0"

# Function to convert display value to actual value
get_actual_value() {
    local display="$1"
    
    # Check if it's a T-shirt size
    if [[ -n "${TSHIRT_MAP[$display]}" ]]; then
        echo "${TSHIRT_MAP[$display]}"
        return
    fi
    
    # Check if it's a special character
    if [[ -n "${SPECIAL_MAP[$display]}" ]]; then
        echo "${SPECIAL_MAP[$display]}"
        return
    fi
    
    # Check if it's numeric
    if [[ "$display" =~ ^[0-9]+\.?[0-9]*$ ]]; then
        echo "$display"
        return
    fi
    
    # Default fallback
    echo "0"
}

# Get all scoring methods
echo "Fetching scoring methods..."
METHODS=$(snc record query --table x_1447726_planni_0_scoring_method --fields sys_id,name,values --limit 100 -o json)

# Parse and migrate each method
echo "$METHODS" | jq -r '.result[] | @base64' | while read -r row; do
    _jq() {
        echo "${row}" | base64 --decode | jq -r "${1}"
    }
    
    METHOD_ID=$(_jq '.sys_id')
    METHOD_NAME=$(_jq '.name')
    VALUES=$(_jq '.values')
    
    echo ""
    echo "Processing: $METHOD_NAME (ID: $METHOD_ID)"
    echo "  Values: $VALUES"
    
    if [ -z "$VALUES" ] || [ "$VALUES" = "null" ]; then
        echo "  ⚠️  No values to migrate"
        continue
    fi
    
    # Split values by comma and process each
    IFS=',' read -ra VALUE_ARRAY <<< "$VALUES"
    SEQUENCE=10
    
    for DISPLAY_VALUE in "${VALUE_ARRAY[@]}"; do
        # Trim whitespace
        DISPLAY_VALUE=$(echo "$DISPLAY_VALUE" | xargs)
        
        if [ -z "$DISPLAY_VALUE" ]; then
            continue
        fi
        
        # Get actual value
        ACTUAL_VALUE=$(get_actual_value "$DISPLAY_VALUE")
        
        echo "  Creating: $DISPLAY_VALUE → $ACTUAL_VALUE (seq: $SEQUENCE)"
        
        # Create the record
        snc record create \
            --table "$TABLE_NAME" \
            --data "{
                \"u_scoring_method\": \"$METHOD_ID\",
                \"u_display_value\": \"$DISPLAY_VALUE\",
                \"u_actual_value\": \"$ACTUAL_VALUE\",
                \"u_sequence\": \"$SEQUENCE\",
                \"u_active\": \"true\"
            }" \
            -o none
        
        SEQUENCE=$((SEQUENCE + 10))
    done
    
    echo "  ✅ Completed $METHOD_NAME"
done

echo ""
echo "=== MIGRATION COMPLETE ==="
echo "Verify data:"
echo "  snc record query --table $TABLE_NAME --limit 10"
