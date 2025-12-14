# Filter Grouping Implementation Proposal

## Overview
Implement backend-configurable filter grouping to separate Company Filters (AND logic) from Post Content Filters (OR logic).

## Backend Changes Required

### 1. Create `filter_groups.json` (New File)

Create a new file at `resources/filter_groups.json` to define all filter groups as an array:

```json
[
  {
    "group_id": "company",
    "group_label": "Company Filters",
    "group_description": "Filter posts by company characteristics. All selected company filters must match (AND logic).",
    "group_operator": "and",
    "order": 1
  },
  {
    "group_id": "post",
    "group_label": "Post Content Filters",
    "group_description": "Filter posts by content type. Posts matching ANY selected filter will be shown (OR logic).",
    "group_operator": "or",
    "order": 2
  }
]
```

### 2. Update `profile_attributes.json`

Add only `group` field (reference to group ID) to each field:

```json
{
  "mcap": {
    "type": "number",
    "label": "Market Cap",
    "description": "Company market capitalization",
    "unit": "Cr",
    "range": {
      "min": 1,
      "max": 10000000
    },
    "operators": ["gte", "lte", "lt", "gt", "eq"],
    "group": "company"
  },
  "pe_ratio": {
    "type": "number",
    "label": "P/E Ratio",
    "description": "Price-to-earnings ratio",
    "unit": null,
    "range": {
      "min": 0,
      "max": 1000
    },
    "operators": ["gte", "lte", "lt", "gt", "eq"],
    "group": "company"
  },
  "sector": {
    "type": "string",
    "label": "Sector",
    "description": "Industry sector",
    "operators": ["eq", "in"],
    "group": "company"
  },
  "subsector": {
    "type": "string",
    "label": "Sub-Sector",
    "description": "Industry sub-sector",
    "operators": ["eq", "in"],
    "group": "company"
  }
}
```

### 3. Update `post_attributes.json`

```json
{
  "growth_related": {
    "type": "boolean",
    "label": "Growth Related",
    "description": "Post contains growth-related information",
    "group": "post"
  },
  "future_guidance": {
    "type": "boolean",
    "label": "Future Guidance",
    "description": "Post contains future guidance",
    "group": "post"
  },
  "order_info": {
    "type": "boolean",
    "label": "Order Information",
    "description": "Post contains order information",
    "group": "post"
  },
  "capacity_expansion": {
    "type": "boolean",
    "label": "Capacity Expansion",
    "description": "Post mentions capacity expansion",
    "group": "post"
  },
  "revenue_insights": {
    "type": "boolean",
    "label": "Revenue Insights",
    "description": "Post contains revenue insights",
    "group": "post"
  },
  "margin_insights": {
    "type": "boolean",
    "label": "Margin Insights",
    "description": "Post contains margin insights",
    "group": "post"
  },
  "change_in_management": {
    "type": "boolean",
    "label": "Management Changes",
    "description": "Post mentions management changes",
    "group": "post"
  }
}
```

### 4. Update `attribute_config.py`

Add a new function to load filter groups:

```python
def _load_filter_groups():
    """Load filter groups from JSON config file"""
    config_path = config.RESOURCES_DIR / 'filter_groups.json'
    with open(config_path, 'r') as f:
        return json.load(f)

# Load configurations once at module initialization (cached)
PROFILE_ATTRS_CONFIG = _load_profile_attributes()
POST_ATTRS_CONFIG = _load_post_attributes()
FILTER_GROUPS_CONFIG = _load_filter_groups()  # Add this line
```

### 5. Update `filters.py` API endpoint

Modify `/filters/config` to include group information in response:

```python
from ..attribute_config import PROFILE_ATTRS_CONFIG, POST_ATTRS_CONFIG, FILTER_GROUPS_CONFIG

@filters_router.get("/config")
def get_filter_config():
    """
    Get filter configuration from JSON files.
    Returns metadata about available filters for rendering UI with grouping.
    """
    profile_attrs = PROFILE_ATTRS_CONFIG
    post_attrs = POST_ATTRS_CONFIG
    groups = FILTER_GROUPS_CONFIG

    filters = []

    # Add profile attributes
    for field_name, field_config in profile_attrs.items():
        filter_item = {
            "field": field_name,
            "label": field_config.get("label", field_name),
            "type": field_config["type"],
            "description": field_config.get("description", ""),
            "group": field_config.get("group", "other"),  # Just the group ID
        }

        # Add optional fields
        if "range" in field_config:
            filter_item["range"] = field_config["range"]
        if "unit" in field_config:
            filter_item["unit"] = field_config["unit"]
        if "operators" in field_config:
            filter_item["operators"] = field_config["operators"]

        filters.append(filter_item)

    # Add post attributes
    for field_name, field_config in post_attrs.items():
        filter_item = {
            "field": field_name,
            "label": field_config.get("label", field_name),
            "type": field_config["type"],
            "description": field_config.get("description", ""),
            "group": field_config.get("group", "other"),  # Just the group ID
        }

        if "operators" in field_config:
            filter_item["operators"] = field_config["operators"]

        filters.append(filter_item)

    # Sort groups by order for consistent frontend rendering
    sorted_groups = sorted(groups, key=lambda g: g.get('order', 999))

    return {
        "filters": filters,
        "groups": sorted_groups  # Return groups as sorted array
    }
```

### 6. Update OpenAPI Schema

Update `openapi.yaml` `FilterConfigResponse` schema:

```yaml
FilterConfigResponse:
  type: object
  required:
    - filters
    - groups
  properties:
    filters:
      type: array
      description: List of available filters
      items:
        type: object
        required:
          - field
          - label
          - type
          - description
          - group
        properties:
          field:
            type: string
            example: "mcap"
            description: "Database field name"
          label:
            type: string
            example: "Market Cap"
            description: "Human-readable label"
          type:
            type: string
            enum: [number, boolean, string]
            example: "number"
            description: "Filter data type"
          description:
            type: string
            example: "Filter by company market capitalization"
          group:
            type: string
            example: "company"
            description: "Group ID reference (references a key in groups object)"
          range:
            type: object
            nullable: true
            properties:
              min:
                type: number
              max:
                type: number
          unit:
            type: string
            nullable: true
            example: "Cr"
          operators:
            type: array
            items:
              type: string
              enum: [gte, lte, lt, gt, eq]
    groups:
      type: array
      description: "Array of filter groups sorted by order"
      items:
        type: object
        required:
          - group_id
          - group_label
          - group_operator
          - order
        properties:
          group_id:
            type: string
            example: "company"
            description: "Unique identifier for the group"
          group_label:
            type: string
            example: "Company Filters"
            description: "Human-readable group name"
          group_description:
            type: string
            example: "Filter posts by company characteristics. All selected company filters must match (AND logic)."
            description: "Explanation of group purpose and logic"
          group_operator:
            type: string
            enum: [and, or]
            example: "and"
            description: "Logical operator for combining filters within this group"
          order:
            type: integer
            example: 1
            description: "Display order for groups in UI"
```

## Frontend Implementation

The frontend will:
1. Parse the grouped filters from the API response
2. Render filters in separate card sections by group
3. Display the group operator (AND/OR) in the UI
4. Show helper text explaining the logic

## Benefits

1. **Backend Configurable**: All grouping logic is in JSON config files
2. **Extensible**: Easy to add new groups in the future
3. **Clear UX**: Users understand AND vs OR logic per group
4. **Type Safe**: Schema validation ensures consistency
5. **Maintainable**: Single source of truth for filter metadata
