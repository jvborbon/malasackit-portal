# Walk-In Bulk Donation Feature

## Overview
The walk-in bulk donation feature allows staff to efficiently record donations where items are grouped in containers (boxes, bags, sacks) with estimated quantities.

## Feature Implementation

### 1. Container Types
The system supports 6 container types with size-based estimation:
- **Small Box** (1× multiplier)
- **Medium Box** (2× multiplier - baseline)
- **Large Box** (4× multiplier)
- **Small Bag** (1× multiplier)
- **Medium Sack** (3× multiplier)
- **Large Sack** (5× multiplier)

### 2. Workflow

#### Step 1: Donor Information
- Staff enters donor name, contact, address (same as individual donations)

#### Step 2: Donation Method Selection
- Staff selects between:
  - **Individual Method**: Item-by-item entry with exact quantities
  - **Bulk Method**: Container-based entry with estimated quantities

#### Step 3: Adding Items (Bulk Method)

**Option A: Single Item Type per Container**
When adding items in Bulk mode:
1. Select item category and item type
2. Select container type (e.g., "Medium Box")
3. Enter number of containers (e.g., 2)
4. System auto-estimates quantity per container based on item type
5. Staff can manually adjust estimated quantity if needed
6. Total quantity = containers × quantity per container

Example:
- Item: T-shirts
- Container: 2 Medium Boxes
- Auto-estimated: 20 per box
- Total: 2 × 20 = 40 T-shirts

**Option B: Assorted Container (NEW!)**
For containers with multiple different item types mixed together:
1. Click "Add Assorted Container (Multiple Items)" button
2. Select container type and number of containers
3. Select item category for the assorted items
4. Add multiple item types to the container
5. System auto-estimates quantity per container for each item type
6. Staff can adjust quantities individually
7. All items are linked to the same container

Example:
- Container: 1 Large Box (Assorted Clothing)
- Items in container:
  - 15 T-shirts per box
  - 10 Pants per box
  - 8 Jackets per box
- Display: "1 Large Box - Assorted: 15 T-shirts, 10 Pants, 8 Jackets"

#### Step 4: Review & Submit
- Staff reviews all items with container details
- Assorted containers are displayed as grouped items with purple badge
- Can edit container type, count, or quantities
- System recalculates totals automatically
- Submit creates donation with "Estimated quantities" note

### 3. Database Schema

#### DonationRequests Table (Added Columns)
```sql
donation_method VARCHAR(50)      -- 'Individual' or 'Bulk'
container_type VARCHAR(50)       -- NULL for Individual method
container_count INTEGER          -- NULL for Individual method
```

#### DonationItems Table (Added Columns)
```sql
quantity_per_container INTEGER   -- NULL for Individual method
is_estimated BOOLEAN             -- TRUE for Bulk, FALSE for Individual
```

### 4. Auto-Estimation Logic

The system uses a multiplier-based approach:

**BASE_ESTIMATES** (Medium Box baseline):
- Clothing items: ~20 pieces
- Food items: ~30 cans
- Hygiene items: ~25 pieces
- School supplies: ~50 pieces
- Medical supplies: ~15 items
- Blankets/Bedding: ~10 pieces

**SIZE_MULTIPLIERS**:
- Small Box/Bag: 0.5× baseline
- Medium Box: 1× baseline
- Large Box: 2× baseline
- Medium Sack: 1.5× baseline
- Large Sack: 2.5× baseline

Example calculation:
```
Item: Canned Goods (BASE = 30)
Container: Large Box (MULTIPLIER = 2)
Estimated Qty = 30 × 2 = 60 per box
```

### 5. Key Features

✅ **Auto-Estimation**: System suggests quantities based on container size and item type
✅ **Manual Override**: Staff can adjust estimated quantities
✅ **Auto-Recalculation**: Total updates automatically when changing container details
✅ **Per-Item Containers**: Each item can have different container types/counts
✅ **Mixed Methods**: Can't mix Individual and Bulk items in same donation
✅ **Immediate Completion**: Bulk donations are marked "Completed" and added to inventory immediately

### 6. User Interface

#### Bulk Method Indicators:
- Blue info banner in Step 2 explaining the workflow
- **Purple "Add Assorted Container" button** for mixed-item containers
- Container fields per item (Type dropdown, Count input)
- "Auto-estimated, adjust if needed" helper text
- Live total calculation display: "× 2 = 40 total"

#### Assorted Container UI:
- Modal dialog for adding assorted containers
- Container type and count selection at top
- Category selection for items in container
- Search and add multiple item types
- Live preview of items with quantities
- Each item shows: "Qty per container × Count = Total"

#### Review Display:
- **Assorted containers shown with purple badge** and grouped together
- Regular items shown individually
- Example assorted: "🟣 ASSORTED: 2 Large Boxes - 3 different item types • Clothing"
- Shows all items in the container with their quantities
- Editable quantities with live recalculation
- Can remove entire assorted container or edit individual item quantities

### 7. Testing Checklist

Before demo, verify:
- [ ] Can select Bulk method in Step 1
- [ ] Container dropdown shows all 6 types
- [ ] Auto-estimation works for different item types
- [ ] Total quantity calculates correctly
- [ ] Can change container type and quantities recalculate
- [ ] **Can open "Add Assorted Container" modal**
- [ ] **Can add multiple item types to assorted container**
- [ ] **Assorted container displays with purple badge in review**
- [ ] **Can edit quantities of items in assorted container**
- [ ] **Can remove entire assorted container**
- [ ] Review step shows container info clearly
- [ ] Submission creates donation with correct data
- [ ] Backend saves container details to database
- [ ] Success modal displays donation ID and credentials

### 8. Client Benefits

1. **Efficiency**: Faster recording of large bulk donations
2. **Flexibility**: Per-item container customization AND assorted containers
3. **Accuracy**: Size-based estimation reduces guesswork
4. **Transparency**: Clear display of estimation vs actual counts
5. **Audit Trail**: Container details saved for verification
6. **Real-world workflow**: Handles mixed-item containers (most common scenario)

### 9. Technical Files Modified

**Frontend:**
- `malasackit-frontend/src/components/WalkInDonationForm.jsx` (major refactor)
- `malasackit-frontend/src/utils/containerEstimates.js` (new file)

**Backend:**
- `malasackit-backend/add-bulk-donation-columns.sql` (schema update)
- `malasackit-backend/src/services/walkInService.js` (updated to accept bulk fields)

**No new tables created** - Uses existing DonationRequests and DonationItems structure.

### 10. Future Enhancements (Optional)

- Historical accuracy tracking: Compare estimated vs actual quantities during verification
- Custom container types: Allow admin to add more container types
- Item-specific base estimates: Admin can customize estimates per item type
- Bulk edit: Change container type for multiple items at once
- Container tracking: Record which containers went to which beneficiaries

---

**Implementation Date**: January 6, 2026
**Status**: ✅ Complete and ready for demo
**Next Step**: Test the complete workflow in development environment
