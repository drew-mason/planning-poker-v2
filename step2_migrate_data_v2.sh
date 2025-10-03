#!/bin/bash
# Step 2: Migrate scoring values - simplified version

echo "=== STEP 2: MIGRATE SCORING VALUES ==="
echo ""

TABLE_NAME="u_x_1447726_planni_0_scoring_value"

# Function to convert display value to actual value
get_actual_value() {
    local display="$1"
    
    # T-shirt sizes
    case "$display" in
        XS) echo "1" ;;
        S) echo "2" ;;
        M) echo "3" ;;
        L) echo "5" ;;
        XL) echo "8" ;;
        XXL) echo "13" ;;
        XXXL) echo "21" ;;
        # Special characters
        "?") echo "-1" ;;
        "☕") echo "0" ;;
        "🎯") echo "-2" ;;
        "∞") echo "999" ;;
        Pass|pass) echo "0" ;;
        # Numeric values
        *) 
            if [[ "$display" =~ ^[0-9]+\.?[0-9]*$ ]]; then
                echo "$display"
            else
                echo "0"
            fi
            ;;
    esac
}

echo "Fetching scoring methods..."

# Get all scoring methods
snc record query \
    --table x_1447726_planni_0_scoring_method \
    --fields sys_id,name,values \
    --limit 100 \
    -o json > /tmp/scoring_methods.json

# Check if we got data
if [ ! -s /tmp/scoring_methods.json ]; then
    echo "❌ Failed to fetch scoring methods"
    exit 1
fi

# Count methods
METHOD_COUNT=$(cat /tmp/scoring_methods.json | jq '.result | length')
echo "Found $METHOD_COUNT scoring methods"
echo ""

# Process each method
cat /tmp/scoring_methods.json | jq -c '.result[]' | while read -r method; do
    METHOD_ID=$(echo "$method" | jq -r '.sys_id')
    METHOD_NAME=$(echo "$method" | jq -r '.name')
    VALUES=$(echo "$method" | jq -r '.values')
    
    echo "Processing: $METHOD_NAME"
    echo "  Method ID: $METHOD_ID"
    echo "  Values: $VALUES"
    
    if [ -z "$VALUES" ] || [ "$VALUES" = "null" ]; then
        echo "  ⚠️  No values to migrate"
        echo ""
        continue
    fi
    
    # Split by comma and process each value
    SEQUENCE=10
    echo "$VALUES" | tr ',' '\n' | while read -r DISPLAY_VALUE; do
        # Trim whitespace
        DISPLAY_VALUE=$(echo "$DISPLAY_VALUE" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        
        if [ -z "$DISPLAY_VALUE" ]; then
            continue
        fi
        
        # Get actual value
        ACTUAL_VALUE=$(get_actual_value "$DISPLAY_VALUE")
        
        echo "    Creating: '$DISPLAY_VALUE' → $ACTUAL_VALUE (sequence: $SEQUENCE)"
        
        # Create the record - escape quotes properly
        DISPLAY_ESCAPED=$(echo "$DISPLAY_VALUE" | sed 's/"/\\"/g')
        
        snc record create \
            --table "$TABLE_NAME" \
            --data "{\"u_scoring_method\":\"$METHOD_ID\",\"u_display_value\":\"$DISPLAY_ESCAPED\",\"u_actual_value\":\"$ACTUAL_VALUE\",\"u_sequence\":\"$SEQUENCE\",\"u_active\":\"true\"}" \
            -o none 2>&1 | grep -v "Request completed"
        
        SEQUENCE=$((SEQUENCE + 10))
    done
    
    echo "  ✅ Completed"
    echo ""
done

echo "=== MIGRATION COMPLETE ==="
echo ""
echo "Verify data with:"
echo "  snc record query --table $TABLE_NAME --limit 10"

# Clean up
rm -f /tmp/scoring_methods.json
