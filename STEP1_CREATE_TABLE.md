## Step 1: Create Scoring Value Table

### Option 1: Run Script in ServiceNow (Recommended)

1. **Navigate to Scripts - Background**
   - URL: https://dev287878.service-now.com/nav_to.do?uri=sys.scripts.do

2. **Copy the script below** and paste it into the "Run script" field

3. **Click "Run script"**

---

### SCRIPT TO RUN:

```javascript
// Create Scoring Value Child Table
(function() {
    try {
        gs.info('=== CREATING SCORING VALUE TABLE ===');
        
        // Check if table already exists
        var tableGR = new GlideRecord('sys_db_object');
        tableGR.addQuery('name', 'x_1447726_planni_0_scoring_value');
        tableGR.query();
        
        if (tableGR.next()) {
            gs.warn('⚠️  Table x_1447726_planni_0_scoring_value already exists!');
            gs.warn('Sys ID: ' + tableGR.sys_id);
            return;
        }
        
        // Create the table
        var table = new GlideRecord('sys_db_object');
        table.initialize();
        table.name = 'x_1447726_planni_0_scoring_value';
        table.label = 'Scoring Value';
        table.is_extendable = false;
        table.access = 'public';
        table.sys_scope = 'a5f4579e8314b6101d51c9a6feaad309'; // Planning Poker scope
        var tableSysId = table.insert();
        
        if (!tableSysId) {
            gs.error('❌ Failed to create table');
            return;
        }
        
        gs.info('✅ Created table: x_1447726_planni_0_scoring_value (sys_id: ' + tableSysId + ')');
        
        // Create fields
        var fields = [
            {
                name: 'scoring_method',
                column_label: 'Scoring Method',
                internal_type: 'reference',
                reference: 'x_1447726_planni_0_scoring_method',
                mandatory: true,
                display: true
            },
            {
                name: 'display_value',
                column_label: 'Display Value',
                internal_type: 'string',
                max_length: 40,
                mandatory: true,
                display: true,
                comments: 'The value shown to users (e.g., "XS", "?", "5")'
            },
            {
                name: 'actual_value',
                column_label: 'Actual Value',
                internal_type: 'decimal',
                mandatory: true,
                comments: 'The numeric value used for calculations. Use -1 for values that should be excluded from averages (like "?")'
            },
            {
                name: 'sequence',
                column_label: 'Sequence',
                internal_type: 'integer',
                mandatory: true,
                default_value: '100',
                comments: 'Display order (multiples of 10 recommended for easy reordering)'
            },
            {
                name: 'description',
                column_label: 'Description',
                internal_type: 'string',
                max_length: 255,
                mandatory: false,
                comments: 'Optional tooltip or help text for this value'
            },
            {
                name: 'active',
                column_label: 'Active',
                internal_type: 'boolean',
                mandatory: true,
                default_value: 'true'
            }
        ];
        
        gs.info('Creating fields...');
        for (var i = 0; i < fields.length; i++) {
            var fieldDef = fields[i];
            var field = new GlideRecord('sys_dictionary');
            field.initialize();
            field.name = 'x_1447726_planni_0_scoring_value';
            field.element = fieldDef.name;
            field.column_label = fieldDef.column_label;
            field.internal_type = fieldDef.internal_type;
            field.mandatory = fieldDef.mandatory || false;
            field.display = fieldDef.display || false;
            field.comments = fieldDef.comments || '';
            
            if (fieldDef.reference) {
                field.reference = fieldDef.reference;
            }
            if (fieldDef.max_length) {
                field.max_length = fieldDef.max_length;
            }
            if (fieldDef.default_value) {
                field.default_value = fieldDef.default_value;
            }
            
            var fieldSysId = field.insert();
            if (fieldSysId) {
                gs.info('  ✅ Created field: ' + fieldDef.name + ' (' + fieldDef.internal_type + ')');
            } else {
                gs.error('  ❌ Failed to create field: ' + fieldDef.name);
            }
        }
        
        // Add related list to scoring_method table
        gs.info('Adding related list to Scoring Method form...');
        var relList = new GlideRecord('sys_ui_related_list');
        relList.initialize();
        relList.name = 'x_1447726_planni_0_scoring_method';
        relList.related_list = 'x_1447726_planni_0_scoring_value.scoring_method';
        relList.view = '';
        relList.order = 100;
        var relListId = relList.insert();
        if (relListId) {
            gs.info('  ✅ Added related list to Scoring Method');
        }
        
        gs.info('');
        gs.info('=== TABLE CREATION COMPLETE ===');
        gs.info('Table: x_1447726_planni_0_scoring_value');
        gs.info('Next step: Run migrate_scoring_values.js to populate data');
        
    } catch (e) {
        gs.error('❌ Error creating table: ' + e.message);
    }
})();
```

---

### Expected Output:

```
=== CREATING SCORING VALUE TABLE ===
✅ Created table: x_1447726_planni_0_scoring_value (sys_id: xxxxxxxxxx)
Creating fields...
  ✅ Created field: scoring_method (reference)
  ✅ Created field: display_value (string)
  ✅ Created field: actual_value (decimal)
  ✅ Created field: sequence (integer)
  ✅ Created field: description (string)
  ✅ Created field: active (boolean)
Adding related list to Scoring Method form...
  ✅ Added related list to Scoring Method

=== TABLE CREATION COMPLETE ===
Table: x_1447726_planni_0_scoring_value
Next step: Run migrate_scoring_values.js to populate data
```

---

### Alternative: Manual Creation in Studio

If you prefer to create manually in Studio:

1. Open Studio → Planning Poker app
2. Create Application File → Table
3. Name: `scoring_value`, Label: `Scoring Value`
4. Add the 6 fields as listed in the script above

---

### After Table Creation:

Once the table is created, verify it exists:

```javascript
// Quick verification script
var gr = new GlideRecord('x_1447726_planni_0_scoring_value');
gs.info('Table exists: ' + gr.isValid());
gs.info('Table name: ' + gr.getTableName());
```

Then proceed to **Step 2: Run Migration Script**

---

**Ready?** Copy the script above and run it in Scripts - Background!
