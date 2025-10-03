#!/usr/bin/env python3
"""
Step 2: Migrate scoring values from CSV to child table
"""

import subprocess
import json
import re

TABLE_NAME = "u_x_1447726_planni_0_scoring_value"

# Value mappings
TSHIRT_MAP = {
    'XS': 1, 'S': 2, 'M': 3, 'L': 5, 'XL': 8, 'XXL': 13, 'XXXL': 21
}

SPECIAL_MAP = {
    '?': -1, '☕': 0, '🎯': -2, '∞': 999, 'Pass': 0, 'pass': 0
}

def get_actual_value(display_value):
    """Convert display value to actual numeric value"""
    # Check T-shirt sizes
    if display_value in TSHIRT_MAP:
        return TSHIRT_MAP[display_value]
    
    # Check special characters
    if display_value in SPECIAL_MAP:
        return SPECIAL_MAP[display_value]
    
    # Check if numeric
    try:
        return float(display_value)
    except ValueError:
        return 0

def run_snc_command(args):
    """Run ServiceNow CLI command and return JSON result"""
    result = subprocess.run(
        ['snc'] + args,
        capture_output=True,
        text=True
    )
    
    # Extract JSON from output (skip the "✔ Request completed" line)
    output = result.stdout.strip()
    
    # Find the JSON object - look for balanced braces
    start = output.find('{')
    if start == -1:
        raise ValueError(f"No JSON found in output: {output}")
    
    # Count braces to find the end
    count = 0
    end = start
    for i in range(start, len(output)):
        if output[i] == '{':
            count += 1
        elif output[i] == '}':
            count -= 1
            if count == 0:
                end = i + 1
                break
    
    json_str = output[start:end]
    return json.loads(json_str)

def main():
    print("=== STEP 2: MIGRATE SCORING VALUES ===\n")
    
    # Fetch all scoring methods
    print("Fetching scoring methods...")
    data = run_snc_command([
        'record', 'query',
        '--table', 'x_1447726_planni_0_scoring_method',
        '--fields', 'sys_id,name,values',
        '--limit', '100',
        '-o', 'json'
    ])
    
    methods = data.get('result', [])
    print(f"Found {len(methods)} scoring methods\n")
    
    total_values_created = 0
    
    for method in methods:
        method_id = method['sys_id']
        method_name = method['name']
        values_csv = method.get('values', '')
        
        print(f"Processing: {method_name}")
        print(f"  Method ID: {method_id}")
        print(f"  Values: {values_csv}")
        
        if not values_csv:
            print("  ⚠️  No values to migrate\n")
            continue
        
        # Split values and process each
        values = [v.strip() for v in values_csv.split(',') if v.strip()]
        sequence = 10
        
        for display_value in values:
            actual_value = get_actual_value(display_value)
            
            print(f"    Creating: '{display_value}' → {actual_value} (sequence: {sequence})")
            
            # Create record
            try:
                run_snc_command([
                    'record', 'create',
                    '--table', TABLE_NAME,
                    '--data', json.dumps({
                        'u_scoring_method': method_id,
                        'u_display_value': display_value,
                        'u_actual_value': str(actual_value),
                        'u_sequence': str(sequence),
                        'u_active': 'true'
                    }),
                    '-o', 'none'
                ])
                total_values_created += 1
            except Exception as e:
                print(f"      ❌ Error: {e}")
            
            sequence += 10
        
        print(f"  ✅ Completed\n")
    
    print("=== MIGRATION COMPLETE ===")
    print(f"Total values created: {total_values_created}\n")
    print("Verify data with:")
    print(f"  snc record query --table {TABLE_NAME} --limit 10")

if __name__ == '__main__':
    main()
