# Langflow Sidebar Customization Guide

## Remove Yellow Highlighting from Sidebar Navigation

This guide shows you how to remove the yellow/accent highlighting from the Langflow sidebar navigation items that you highlighted in your screenshots.

## Files to Modify

### 1. Main Sidebar Navigation File
**File**: `src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/sidebarSegmentedNav.tsx`

**Change Required**:
Replace the `className` prop around line 100-110:

**Original Code** (with yellow highlighting):
```jsx
className={cn(
  "flex h-8 w-8 items-center justify-center rounded-md p-0 transition-all duration-200",
  (
    item.id === "add_note"
      ? isAddNoteActive
      : activeSection === item.id
  )
    ? "bg-accent text-accent-foreground"  // ← This creates the yellow highlight
    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
)}
```

**New Code** (without highlighting):
```jsx
className={cn(
  "flex h-8 w-8 items-center justify-center rounded-md p-0 transition-all duration-200",
  // CUSTOM: Removed yellow/accent highlighting - now uses subtle gray hover
  "text-muted-foreground hover:bg-gray-100 hover:text-gray-700",
  // Optional: Add subtle border for active state instead of background highlight
  (
    item.id === "add_note"
      ? isAddNoteActive
      : activeSection === item.id
  )
    ? "border border-gray-300"
    : "",
)}
```

## Alternative Customization Options

### Option 1: Change Accent Colors Globally
If you want to change the accent color throughout the entire app, modify the CSS variables in:
**File**: `src/frontend/src/style/globals.css` or theme files

```css
:root {
  --accent: 210 40% 90%;  /* Change this to your preferred color */
  --accent-foreground: 222.2 84% 4.9%;
}
```

### Option 2: Custom Color Scheme
Replace the highlight with your own color:
```jsx
className={cn(
  "flex h-8 w-8 items-center justify-center rounded-md p-0 transition-all duration-200",
  (
    item.id === "add_note"
      ? isAddNoteActive
      : activeSection === item.id
  )
    ? "bg-blue-100 text-blue-800"  // Custom blue highlighting
    : "text-muted-foreground hover:bg-gray-100 hover:text-gray-700",
)}
```

### Option 3: Remove All Active State Styling
For completely neutral sidebar (no active state indication):
```jsx
className={cn(
  "flex h-8 w-8 items-center justify-center rounded-md p-0 transition-all duration-200",
  "text-muted-foreground hover:bg-gray-100 hover:text-gray-700"
  // No conditional styling for active state
)}
```

## Development Setup Instructions

1. **Navigate to the cloned Langflow directory**:
   ```bash
   cd langflow-dev/src/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Make your changes** to the files mentioned above

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Build for production** (after testing):
   ```bash
   npm run build
   ```

## Additional Sidebar Elements to Customize

If you want to remove highlighting from other sidebar elements, check these files:

- `sidebarHeader.tsx` - Header section styling
- `sidebarFooterButtons.tsx` - Footer button styling  
- `sidebarItemsList.tsx` - Component list items
- `McpSidebarGroup.tsx` - MCP section styling

## Testing Your Changes

1. Start the Langflow development server
2. Navigate to the flow page
3. Click on different sidebar navigation items
4. Verify that the yellow highlighting is removed and your custom styling appears

## Production Deployment

After making changes:
1. Build the frontend: `npm run build`
2. The built files will be in `dist/` directory
3. Deploy these files to your Langflow installation

## Notes

- The `bg-accent` and `text-accent-foreground` classes are what create the yellow highlighting
- The accent colors are defined in your theme/CSS variables
- Changes will affect all navigation items (Search, Components, MCP, Bundles, Sticky Notes)
- The modification I provided adds a subtle gray border for active states instead of background highlighting

This should remove the yellow highlighting you showed in your screenshots while maintaining usability!