# GiftStash - Comprehensive QA Testing Plan

## 🎯 Testing Scope
- Desktop & Mobile responsiveness
- All user flows
- Chrome Extension integration
- Database operations
- Error handling
- Performance

---

## 📱 Mobile Testing (< 768px)

### Navigation & Layout
- [ ] Nav menu is accessible and functional
- [ ] All pages render correctly on mobile
- [ ] Touch targets are at least 44x44px
- [ ] Text is readable without zooming
- [ ] No horizontal scrolling

### Gifts Page
- [ ] Search bar is usable on mobile
- [ ] Filter buttons scroll horizontally if needed
- [ ] View mode switcher (List/Grid/Recipients) works
- [ ] Bulk action dropdown shows correctly
- [ ] "Deselect All" button is reachable
- [ ] Gift cards are readable and tappable
- [ ] Checkbox touch targets are adequate
- [ ] Budget cards stack vertically

### Recipient Profile Page
- [ ] Avatar displays correctly
- [ ] Tabs (Ideas/Purchased) switch properly
- [ ] Gift list is scrollable
- [ ] "Select All" button works
- [ ] Bulk action bar appears correctly
- [ ] Summary counts are visible

### New Gift Page
- [ ] URL input field is accessible
- [ ] Form fields stack properly
- [ ] "Extract from URL" button works
- [ ] Status dropdown works on mobile
- [ ] Price inputs with $ symbol display correctly
- [ ] Save button is reachable

### Edit Gift Page
- [ ] All form fields are editable
- [ ] Save/Cancel buttons are accessible
- [ ] Back navigation works

### Gift Details Dialog
- [ ] Dialog scrolls on small screens
- [ ] Edit button is visible
- [ ] Images display correctly
- [ ] Status buttons wrap properly
- [ ] External link button works

---

## 💻 Desktop Testing (> 768px)

### Navigation & Layout
- [ ] Full navigation bar displays
- [ ] Logo and branding visible
- [ ] User menu accessible
- [ ] All pages use full width appropriately

### Gifts Page
- [ ] 3-column grid view displays correctly
- [ ] List view shows compact format
- [ ] Recipients view with collapsible sections works
- [ ] Search is responsive (debounced)
- [ ] Filters update immediately
- [ ] Bulk actions toolbar shows all buttons
- [ ] Analytics cards show in 4-column grid
- [ ] "Select All" works across all views

### Recipient Profile Page
- [ ] Layout uses available space
- [ ] Gift cards display in grid
- [ ] Bulk selection works
- [ ] AI Recommendations button functional

### New Gift Page
- [ ] Two-column layout for form fields
- [ ] Auto-extract from URL works
- [ ] Image preview displays
- [ ] Category suggestions appear

### Edit Gift Page
- [ ] Form pre-populates with existing data
- [ ] All fields editable
- [ ] Changes save correctly

### Gift Details Dialog
- [ ] Large image display
- [ ] All metadata visible
- [ ] Edit button positioned correctly
- [ ] Status update buttons in row

---

## 🔌 Chrome Extension Integration

### Extension Installation
- [ ] Extension installs without errors
- [ ] Icon appears in Chrome toolbar
- [ ] Permissions are requested appropriately

### Product Detection
- [ ] Extension detects products on Amazon
- [ ] Extension detects products on Target
- [ ] Extension detects products on other stores
- [ ] Product name is extracted
- [ ] Price is extracted
- [ ] Image URL is captured
- [ ] Store name is detected

### Saving to GiftStash
- [ ] "Save to GiftStash" button appears
- [ ] Clicking button opens save dialog
- [ ] User must be logged in
- [ ] Product data pre-fills correctly
- [ ] Can assign to recipient before saving
- [ ] Screenshot is captured
- [ ] Metadata is stored

### Verification in App
- [ ] Saved gift appears in gifts list
- [ ] Screenshot displays correctly
- [ ] Product URL is clickable
- [ ] Source shows "extension" badge
- [ ] All extracted data is present

---

## 🗄️ Database Operations

### Gift CRUD
- [ ] Create new gift (manual entry)
- [ ] Create new gift (via URL extraction)
- [ ] Create new gift (via extension)
- [ ] Read/view gift details
- [ ] Update gift information
- [ ] Delete single gift
- [ ] Bulk delete multiple gifts

### Recipient CRUD
- [ ] Create new recipient
- [ ] View recipient profile
- [ ] Update recipient details
- [ ] Delete recipient
- [ ] Assign gift to recipient
- [ ] Unassign gift from recipient

### Status Management
- [ ] Change gift status to "idea"
- [ ] Change gift status to "purchased"
- [ ] Bulk update statuses
- [ ] Verify purchased_date auto-sets
- [ ] Verify purchased_date clears on revert

### Budget Tracking
- [ ] Total value calculates correctly
- [ ] Purchased value updates
- [ ] Ideas value updates
- [ ] Per-recipient totals are accurate
- [ ] Counts match filtered results

---

## ⚡ Performance Testing

### Page Load Times
- [ ] Gifts page loads < 2s
- [ ] Recipient page loads < 2s
- [ ] Gift details dialog opens instantly
- [ ] Search results appear < 500ms

### Bulk Operations
- [ ] Selecting 10+ gifts is smooth
- [ ] Bulk status update completes < 1s
- [ ] Bulk delete completes < 1s
- [ ] UI updates immediately after operation

### Image Loading
- [ ] Images lazy load appropriately
- [ ] Placeholder/skeleton shows while loading
- [ ] No layout shift when images load
- [ ] Failed images show fallback icon

---

## 🛡️ Error Handling

### Network Errors
- [ ] Loss of connection shows user-friendly message
- [ ] Retry mechanism works
- [ ] User can continue offline (if applicable)

### Validation Errors
- [ ] Required fields show error on submit
- [ ] Invalid URLs are rejected
- [ ] Invalid prices are rejected
- [ ] Error messages are clear

### Edge Cases
- [ ] Empty states display correctly (no gifts, no recipients)
- [ ] Very long gift names don't break layout
- [ ] Many recipients (10+) on one gift
- [ ] Many gifts (100+) load properly
- [ ] Missing/broken image URLs handled

### Error Boundaries
- [ ] Component errors show error boundary
- [ ] "Try Again" button works
- [ ] "Go Home" button works
- [ ] Error details show in dev mode

---

## 🎨 UI/UX Testing

### Confirmation Dialogs
- [ ] Delete confirmation shows count
- [ ] Confirmation dialog is modal
- [ ] Cancel button works
- [ ] Confirm button triggers action
- [ ] Dialog closes after action

### Loading States
- [ ] Loading skeletons show while fetching
- [ ] Buttons show loading state during async operations
- [ ] No double-submit possible
- [ ] Loading indicators are branded

### Notifications (Toasts)
- [ ] Success toasts show for CRUD operations
- [ ] Error toasts show on failures
- [ ] Toasts auto-dismiss after ~3s
- [ ] Multiple toasts stack properly

### Keyboard Shortcuts
- [ ] `N` key opens new gift page
- [ ] `/` key focuses search
- [ ] `Escape` clears selection/closes dialogs
- [ ] Shortcuts don't fire in input fields

---

## 🔍 Accessibility Testing

### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] No keyboard traps

### Screen Reader
- [ ] Images have alt text
- [ ] Buttons have aria-labels
- [ ] Form fields have labels
- [ ] Dialogs have proper ARIA attributes

### Color Contrast
- [ ] Text meets WCAG AA standards
- [ ] Button states are distinguishable
- [ ] Status badges are readable

---

## 🧪 Cross-Browser Testing

### Chrome
- [ ] All features work
- [ ] Extension integrates properly
- [ ] No console errors

### Firefox
- [ ] All features work
- [ ] Layout renders correctly
- [ ] No console errors

### Safari
- [ ] All features work
- [ ] Date pickers work
- [ ] No console errors

### Mobile Safari (iOS)
- [ ] Touch events work
- [ ] Dialogs display correctly
- [ ] No layout issues

### Chrome Mobile (Android)
- [ ] Touch events work
- [ ] Dialogs display correctly
- [ ] No layout issues

---

## 📊 Data Integrity Testing

### Database Migration
- [ ] Run database-fixes-2025.sql successfully
- [ ] All verification queries pass
- [ ] RPC function exists and works
- [ ] Indices are created
- [ ] Constraints are enforced

### Data Consistency
- [ ] Gift status matches gift_recipients status
- [ ] Deleting recipient removes assignments
- [ ] Deleting gift removes assignments
- [ ] Budget totals are always accurate

---

## 🎯 Priority Testing Order

1. **Critical Path** (Must work)
   - Create gift → Assign to recipient → Update status → Delete
   - Chrome extension → Save product → Verify in app

2. **High Priority** (Core features)
   - Bulk operations
   - Budget calculations
   - Search and filter
   - Mobile responsiveness

3. **Medium Priority** (Polish)
   - Keyboard shortcuts
   - Loading states
   - Error boundaries

4. **Low Priority** (Nice-to-have)
   - Animation smoothness
   - Edge case handling

---

## 📝 Testing Notes Template

Use this format to report issues:

```
**Page/Feature:** [e.g., Gifts Page - Bulk Delete]
**Device:** [Desktop Chrome / iPhone 14 Safari]
**Steps to Reproduce:**
1.
2.
3.

**Expected:** [What should happen]
**Actual:** [What actually happened]
**Severity:** [Critical / High / Medium / Low]
**Screenshot:** [If applicable]
```

---

## ✅ Sign-Off Checklist

Before marking QA complete:
- [ ] All Critical Path tests pass
- [ ] All High Priority tests pass
- [ ] Mobile responsiveness verified on real device
- [ ] Chrome extension works end-to-end
- [ ] Database migration verified in production
- [ ] No console errors in any browser
- [ ] Performance meets targets
- [ ] Accessibility basics covered

---

**Testing Date:** _____________
**Tester:** _____________
**App Version:** 2.0
**Database Version:** After database-fixes-2025.sql
