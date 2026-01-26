# Stashport Comprehensive Test Plan

## Overview
This document outlines end-to-end test scenarios covering UI interactions and backend functionality for the Stashport travel planning application.

---

## 1. Authentication Flows

### 1.1 Email/Password Sign Up
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| AUTH-001 | Successful signup with email | Enter valid email, strong password (8+ chars, upper, lower, number, special), matching confirmation, optional display name → Submit | Redirect to confirm-email page, confirmation email sent |
| AUTH-002 | Signup with weak password | Enter valid email, password missing uppercase → Submit | Error: "Password must contain uppercase" |
| AUTH-003 | Signup with password mismatch | Enter different passwords in confirm field | Error: "Passwords do not match" |
| AUTH-004 | Signup with invalid email format | Enter "notanemail" in email field | Error: "Invalid email format" |
| AUTH-005 | Signup with existing email | Enter email already registered | Error: "User already registered" |
| AUTH-006 | Signup with invalid display name | Enter display name with special chars (e.g., "User@#$") | Error about invalid characters |
| AUTH-007 | Signup with display name too long | Enter 51+ character display name | Error: "Display name must be 50 characters or less" |
| AUTH-008 | Resend confirmation email | On confirm-email page, click "Resend" | Success message, new email sent |

### 1.2 Email Verification
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| AUTH-009 | Valid email verification link | Click verification link from email | Redirect to dashboard, user logged in |
| AUTH-010 | Expired verification link | Click old/expired link | Error page: "Link has expired" |
| AUTH-011 | Invalid verification token | Modify token in URL | Error page: "Invalid verification link" |
| AUTH-012 | Double-click verification link | Click link twice rapidly | First succeeds, second handles gracefully (no duplicate profile) |

### 1.3 Login
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| AUTH-013 | Successful login | Enter valid email/password → Login | Redirect to /dashboard |
| AUTH-014 | Login with wrong password | Enter valid email, wrong password | Error: "Invalid login credentials" |
| AUTH-015 | Login with unregistered email | Enter non-existent email | Error: "Invalid login credentials" |
| AUTH-016 | Login with unverified email | Login before verifying email | Error or prompt to verify |
| AUTH-017 | Login redirect preservation | Access /dashboard while logged out → Login | Return to originally requested page |

### 1.4 Google OAuth
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| AUTH-018 | Successful Google OAuth signup | Click "Continue with Google" → Authorize | Redirect to dashboard, profile auto-created |
| AUTH-019 | Google OAuth login (existing user) | Click Google OAuth for existing account | Login successful, dashboard shown |
| AUTH-020 | Google OAuth cancelled | Click Google → Cancel on consent screen | Return to login page with message |
| AUTH-021 | Google OAuth network error | OAuth during network issues | Error page with retry option |
| AUTH-022 | OAuth popup blocked | Browser blocks popup | Appropriate error handling/messaging |

### 1.5 Password Reset
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| AUTH-023 | Request password reset | Enter email → Submit | Success message, reset email sent |
| AUTH-024 | Reset with valid link | Click reset link → Enter new valid password | Password updated, redirect to login |
| AUTH-025 | Reset with expired link | Click old reset link | Error: "Reset link has expired" |
| AUTH-026 | Reset password mismatch | Enter different passwords in reset form | Error: "Passwords do not match" |
| AUTH-027 | Reset with weak password | Enter password without special chars | Validation error shown |
| AUTH-028 | Reset for non-existent email | Enter unregistered email | Same success message (no email enumeration) |

### 1.6 Session Management
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| AUTH-029 | Logout | Click logout button | Clear session, redirect to login |
| AUTH-030 | Session persistence | Login → Close browser → Reopen | Still logged in |
| AUTH-031 | Token refresh (middleware) | Stay idle until token near expiry | Token auto-refreshed, no interruption |
| AUTH-032 | Multiple tabs logout | Logout in one tab | Other tabs detect logout |
| AUTH-033 | Session timeout logout | Let session fully expire | Redirect to login on next action |
| AUTH-034 | Logout network error | Logout during network issues | Local state cleared, redirect works |

---

## 2. User Profile Management

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| PROFILE-001 | Auto-create profile on OAuth | First Google login | Profile created with email, auto avatar color |
| PROFILE-002 | Display name from signup | Signup with display name | Profile shows display name |
| PROFILE-003 | Display name fallback | Signup without display name | Username derived from email shown |
| PROFILE-004 | Avatar color consistency | Multiple logins | Same avatar color each time (hash-based) |
| PROFILE-005 | Profile refresh after update | Update profile → Check | New data reflected immediately |

---

## 3. Dashboard Functionality

### 3.1 My Trips Tab
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| DASH-001 | View trips list | Login → Go to dashboard | User's trips displayed in grid |
| DASH-002 | Empty state (no trips) | New user views dashboard | "No trips yet" message with CTA |
| DASH-003 | Trip card displays | View trip card | Shows title, destination, cover photo, type badge, days count |
| DASH-004 | Trip card click | Click on trip card | Navigate to trip edit page |
| DASH-005 | Pagination | User with 50+ trips | "Load More" button, loads next page |
| DASH-006 | Filter by type | Select "Daily" or "Guide" filter | Only matching type shown |
| DASH-007 | Sort by recent | Select "Recent" sort | Trips ordered by updated_at DESC |
| DASH-008 | Sort alphabetically | Select "Alphabetical" sort | Trips ordered by title ASC |
| DASH-009 | Trip actions menu | Click trip card menu | Shows Edit, Share, Delete options |
| DASH-010 | Delete trip | Click Delete → Confirm | Trip removed, success toast |
| DASH-011 | Delete trip cancel | Click Delete → Cancel | Trip remains, modal closes |

### 3.2 Explore Tab
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| DASH-012 | View explore grid | Click Explore tab | Public trips from other users displayed |
| DASH-013 | Explore excludes own trips | View explore | User's own trips not shown |
| DASH-014 | Explore card click | Click explore card | Navigate to public trip page (/t/[slug]) |
| DASH-015 | Load more explore | Scroll to bottom | "Load More" fetches next page |
| DASH-016 | Filter by destination | Enter destination filter | Matching trips shown |
| DASH-017 | Filter by tags | Select tag filter | Trips with tag shown |
| DASH-018 | Filter by type (explore) | Filter by Daily/Guide | Matching type shown |
| DASH-019 | No results state | Filter with no matches | "No trips found" message |

### 3.3 Navigation
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| DASH-020 | Tab URL state | Click Explore tab | URL updates to ?tab=explore |
| DASH-021 | Direct URL to explore | Visit /dashboard?tab=explore | Explore tab active |
| DASH-022 | Create new trip button | Click "Create Trip" | Navigate to /itinerary/new |

---

## 4. Itinerary CRUD Operations

### 4.1 Create Itinerary (Common)
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| ITIN-001 | Create with minimum fields | Enter title only → Save | Itinerary created with default values |
| ITIN-002 | Create with all fields | Fill title, description, destination, tags, budget, cover photo | All fields saved correctly |
| ITIN-003 | Title validation - empty | Submit with empty title | Error: "Title is required" |
| ITIN-004 | Title validation - too long | Enter 201+ character title | Error: "Title must be less than 200 characters" |
| ITIN-005 | Description validation | Enter 2001+ character description | Error about max length |
| ITIN-006 | Destination validation | Enter 101+ character destination | Error about max length |
| ITIN-007 | Select up to 3 tags | Select 3 tags | All 3 saved |
| ITIN-008 | Tag limit exceeded | Try to select 4th tag | 4th tag not selectable |
| ITIN-009 | Budget level selection | Select $$$ (level 3) | Budget saved as 3 |
| ITIN-010 | Budget level toggle off | Click selected budget again | Budget cleared (null) |
| ITIN-011 | Visibility toggle | Toggle "Make Public" off | isPublic = false saved |
| ITIN-012 | Slug generation | Create trip "My Tokyo Trip!" | Slug: "my-tokyo-trip-abc123" |

### 4.2 Create Daily Itinerary
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| ITIN-013 | Select daily type | Click "Plan My Trip" type | Type set to 'daily', date section shown |
| ITIN-014 | Set travel dates | Select start and end dates | Days auto-generated for range |
| ITIN-015 | Date range day count | Select 5-day range | 5 day cards generated |
| ITIN-016 | Add activity to day | Click "Add Activity" on Day 1 | New activity form appears |
| ITIN-017 | Activity with all fields | Enter title, location, start time, end time, notes | All saved to activity |
| ITIN-018 | Activity title required | Save activity without title | Error: "Activity title is required" |
| ITIN-019 | Multi-day activity | Set durationDays = 3 | Activity spans 3 days with indicator |
| ITIN-020 | Remove activity | Click remove on activity | Activity deleted |
| ITIN-021 | Add day | Click "Add Day" | New day card added |
| ITIN-022 | Remove day | Click remove on day (if > 1 day) | Day and its activities deleted |
| ITIN-023 | Cannot remove last day | Try to delete only day | Remove button disabled or blocked |
| ITIN-024 | Save daily itinerary | Fill form → Save | Itinerary + days + activities created |

### 4.3 Create Guide Itinerary
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| ITIN-025 | Select guide type | Click "Share My Favorites" type | Type set to 'guide', sections UI shown |
| ITIN-026 | No date section for guide | Type = guide | Travel dates section hidden |
| ITIN-027 | Add section from preset | Click "Add Section" → Select "Best Restaurants" | Section added with 🍜 icon |
| ITIN-028 | Add custom section | Click "Add Section" → Custom → Enter name + emoji | Section added with custom details |
| ITIN-029 | Preset already added | Add "Best Restaurants" twice | "Already added" indicator on preset |
| ITIN-030 | Edit section title | Click section title → Edit → Save | Title updated |
| ITIN-031 | Add item to section | Click "Add place" in section | New item form appears |
| ITIN-032 | Item title required | Save item without title | Error: "Item title is required" |
| ITIN-033 | Item with all fields | Enter title, location, notes | All saved to item |
| ITIN-034 | Remove item | Click remove on item | Item deleted |
| ITIN-035 | Remove section | Click remove on section | Section and all items deleted |
| ITIN-036 | Section sort order | Add 3 sections | sortOrder reflects order (0, 1, 2) |
| ITIN-037 | Save guide itinerary | Fill form → Save | Itinerary + categories + items created |

### 4.4 Edit Itinerary
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| ITIN-038 | Load existing itinerary | Navigate to /itinerary/[id]/edit | Form populated with existing data |
| ITIN-039 | Edit title | Change title → Save | New title saved |
| ITIN-040 | Add activity to existing day | Open existing daily trip → Add activity | Activity saved with trip |
| ITIN-041 | Remove activity from existing | Open existing → Remove activity | Activity deleted |
| ITIN-042 | Change trip type | Change daily → guide (or vice versa) | Type updated, appropriate data saved |
| ITIN-043 | Edit saves as update | Make changes → Save | PUT request, same itinerary ID |
| ITIN-044 | Edit unauthorized | Try to edit another user's trip | 403 or redirect |

### 4.5 Delete Itinerary
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| ITIN-045 | Delete own trip | Dashboard → Delete → Confirm | Trip deleted, cascade deletes related data |
| ITIN-046 | Delete unauthorized | API DELETE on another user's trip | 403 Forbidden |
| ITIN-047 | Delete cascades | Delete trip with days/activities | All related records deleted |

---

## 5. Cover Photo Functionality

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| COVER-001 | Upload JPG | Select JPG file | Preview shown, file uploaded |
| COVER-002 | Upload PNG | Select PNG file | Preview shown, file uploaded |
| COVER-003 | Upload WebP | Select WebP file | Preview shown, file uploaded |
| COVER-004 | Reject invalid format | Select GIF or PDF | Error: "Please upload JPG, PNG, or WebP" |
| COVER-005 | Reject oversized file | Select 6MB image | Error: "File must be less than 5MB" |
| COVER-006 | Drag and drop upload | Drag image to drop zone | Image uploaded |
| COVER-007 | Remove cover photo | Click remove on preview | Photo removed, URL cleared |
| COVER-008 | Cover photo persists | Add photo → Save → Reload | Photo still shown |
| COVER-009 | Replace cover photo | Upload new photo over existing | New photo replaces old |

---

## 6. Autosave & Draft Recovery

### 6.1 New Trip Drafts
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| AUTO-001 | Draft saves to localStorage | Start new trip → Enter title → Wait 2s | Draft saved to localStorage |
| AUTO-002 | Draft recovery prompt | Start new trip → Leave → Return | "Recover draft?" prompt shown |
| AUTO-003 | Recover draft | Accept draft recovery | Form populated with draft data |
| AUTO-004 | Decline draft recovery | Decline recovery | Fresh form, draft cleared |
| AUTO-005 | Draft cleared on save | Complete new trip → Save | Draft removed from localStorage |
| AUTO-006 | Draft expiry (24h) | Return after 24+ hours | No recovery prompt, draft expired |
| AUTO-007 | Offline draft save | Go offline → Make changes | Draft saved locally |

### 6.2 Existing Trip Autosave
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| AUTO-008 | Server autosave | Edit existing trip → Wait 2s | PUT request sent, changes saved |
| AUTO-009 | Save status indicator | Make changes | Shows "Saving..." → "Saved!" |
| AUTO-010 | Autosave offline | Edit existing while offline | Status shows "Offline", saves locally |
| AUTO-011 | Autosave reconnect | Go back online after offline edits | Syncs to server |
| AUTO-012 | Autosave error | Server returns error | Error status shown, retry available |

---

## 7. Public Trip Pages (/t/[slug])

### 7.1 Trip Display
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| PUBLIC-001 | View public trip | Navigate to /t/[valid-slug] | Trip displayed with hero, days, activities |
| PUBLIC-002 | Hero with cover photo | View trip with cover | Full-bleed hero with photo background |
| PUBLIC-003 | Hero without cover photo | View trip without cover | Gradient background hero |
| PUBLIC-004 | Display days/activities | View daily trip | All days and activities shown in timeline |
| PUBLIC-005 | Display creator info | View any public trip | Creator avatar and display name shown |
| PUBLIC-006 | Display tags | View trip with tags | Tags displayed as pills |
| PUBLIC-007 | Display activity details | View activity | Shows title, location, time range, notes |
| PUBLIC-008 | Empty trip display | View trip with no activities | Appropriate empty state |

### 7.2 Access Control
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| PUBLIC-009 | View private trip (owner) | Owner navigates to /t/[slug] | Trip displayed (owner access) |
| PUBLIC-010 | View private trip (other) | Non-owner navigates to private trip | 403 or "This trip is private" |
| PUBLIC-011 | Invalid slug | Navigate to /t/nonexistent | 404: "Trip not found" |
| PUBLIC-012 | Guide type public view | View public guide-type trip | Sections/items displayed instead of days |

### 7.3 Share from Public Page
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| PUBLIC-013 | Share button (guest) | Guest clicks Share | ShareModal opens |
| PUBLIC-014 | Share button (owner) | Owner clicks Share | Redirects to /itinerary/[id]/share |

---

## 8. Share Page (/itinerary/[id]/share)

### 8.1 Access & Layout
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| SHARE-001 | Access share page (owner) | Navigate to /itinerary/[id]/share | 3-column editorial layout displayed |
| SHARE-002 | Access share page (non-owner) | Non-owner tries to access | Redirect to /dashboard |
| SHARE-003 | Access share page (logged out) | Logged out user tries | Redirect to /auth/login |
| SHARE-004 | Mobile responsive | View on mobile | Stacked layout |

### 8.2 Template Selection
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| SHARE-005 | Default template | Open share page | "Clean" template selected by default |
| SHARE-006 | Select Bold template | Click "Bold" | Preview updates to bold style |
| SHARE-007 | Select Minimal template | Click "Minimal" | Preview updates to minimal style |
| SHARE-008 | Preview updates | Change template | Preview smoothly crossfades |
| SHARE-009 | Keyboard shortcut 1 | Press "1" key | Clean template selected |
| SHARE-010 | Keyboard shortcut 2 | Press "2" key | Bold template selected |
| SHARE-011 | Keyboard shortcut 3 | Press "3" key | Minimal template selected |

### 8.3 Format Selection
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| SHARE-012 | Default format | Open share page | "Story" format selected |
| SHARE-013 | Select Square format | Click "Square" | Preview aspect ratio changes |
| SHARE-014 | Select Portrait format | Click "Portrait" | Preview aspect ratio changes |
| SHARE-015 | Keyboard shortcut S | Press "S" key | Story format selected |
| SHARE-016 | Keyboard shortcut Q | Press "Q" key | Square format selected |
| SHARE-017 | Keyboard shortcut P | Press "P" key | Portrait format selected |

### 8.4 Preference Persistence
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| SHARE-018 | Preferences saved | Select Bold + Square → Leave → Return | Bold + Square still selected |
| SHARE-019 | Preferences across trips | Set preferences on Trip A → Open Trip B | Same preferences applied |

### 8.5 Image Generation & Download
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| SHARE-020 | Download image | Click "Download" | PNG downloaded with correct filename |
| SHARE-021 | Download - Clean/Story | Select Clean + Story → Download | 1080x1920 PNG with clean style |
| SHARE-022 | Download - Bold/Square | Select Bold + Square → Download | 1080x1080 PNG with bold style |
| SHARE-023 | Download - Minimal/Portrait | Select Minimal + Portrait → Download | 1080x1350 PNG with minimal style |
| SHARE-024 | Keyboard shortcut D | Press "D" key | Download initiated |
| SHARE-025 | Download error handling | Server error during generation | Error toast, retry available |
| SHARE-026 | Loading state | Click Download | Loading indicator while generating |

### 8.6 Web Share API
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| SHARE-027 | Share on mobile | Click "Share" on mobile Safari | Native share sheet opens with image |
| SHARE-028 | Share caption | Complete share | Includes "Check out my trip: {title}" text |
| SHARE-029 | Share cancelled | Open share → Cancel | Graceful handling, no error |
| SHARE-030 | Share unsupported | Click Share on Firefox | Falls back to download |
| SHARE-031 | Share button visibility | View on unsupported browser | Share button hidden or disabled |

---

## 9. Share Modal (Public Trip Viewers)

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| MODAL-001 | Open share modal | Guest clicks share on public trip | Modal opens with template options |
| MODAL-002 | Select template in modal | Click different template | Preview updates |
| MODAL-003 | Select format in modal | Click different format | Preview updates |
| MODAL-004 | Download from modal | Click "Download Image" | PNG downloaded |
| MODAL-005 | Close modal | Click cancel or outside | Modal closes |

---

## 10. Explore API & Functionality

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| EXPLORE-001 | Default explore fetch | GET /api/itineraries/explore | Returns page 1, 12 items |
| EXPLORE-002 | Pagination | GET with page=2 | Returns page 2 results |
| EXPLORE-003 | Custom limit | GET with limit=20 | Returns up to 20 items |
| EXPLORE-004 | Max limit enforced | GET with limit=100 | Returns max 50 items |
| EXPLORE-005 | Filter by destination | GET with destination=Tokyo | Only Tokyo trips returned |
| EXPLORE-006 | Filter by type | GET with type=guide | Only guide trips returned |
| EXPLORE-007 | Sort by recent | GET with sort=recent | Ordered by created_at DESC |
| EXPLORE-008 | Only public trips | Any explore request | All returned trips have is_public=true |
| EXPLORE-009 | Excludes current user | Logged-in explore request | User's own trips not in results |
| EXPLORE-010 | Unauthenticated explore | Explore without login | Works, returns public trips |

---

## 11. API Endpoint Tests

### 11.1 Authentication Required Endpoints
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| API-001 | POST /api/itineraries (no auth) | Call without session | 401 Unauthorized |
| API-002 | PUT /api/itineraries/[id] (no auth) | Call without session | 401 Unauthorized |
| API-003 | DELETE /api/itineraries/[id] (no auth) | Call without session | 401 Unauthorized |
| API-004 | GET /api/itineraries (no auth) | Call without session | 401 Unauthorized |
| API-005 | POST /api/share/generate (no auth) | Call without session | 401 Unauthorized |
| API-006 | POST /api/upload/cover (no auth) | Call without session | 401 Unauthorized |

### 11.2 Authorization Checks
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| API-007 | Edit another user's trip | PUT /api/itineraries/[other-user-id] | 403 Forbidden |
| API-008 | Delete another user's trip | DELETE /api/itineraries/[other-user-id] | 403 Forbidden |
| API-009 | Generate image for private trip (non-owner) | POST /api/share/generate | 403 Forbidden |

### 11.3 Data Validation
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| API-010 | Invalid itinerary payload | POST with missing title | 400 Bad Request with error |
| API-011 | Invalid activity data | POST with activity.notes > 1000 chars | 400 validation error |
| API-012 | Invalid category data | POST with category.name > 100 chars | 400 validation error |
| API-013 | Invalid budget level | POST with budgetLevel = 5 | 400 validation error |
| API-014 | Invalid tag | POST with tags: ["InvalidTag"] | 400 validation error |

### 11.4 Public Endpoints
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| API-015 | Public trip (valid) | GET /api/itineraries/public/[slug] | 200 with trip data |
| API-016 | Public trip (private) | GET /api/itineraries/public/[private-slug] | 403 or 404 |
| API-017 | Public trip (not found) | GET /api/itineraries/public/nonexistent | 404 Not Found |

---

## 12. Edge Cases & Error Handling

### 12.1 Network & Connectivity
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| EDGE-001 | Offline page load | Load app while offline | Cached content or offline message |
| EDGE-002 | Network loss mid-save | Start saving → Go offline | Error handled, data preserved |
| EDGE-003 | Slow network | 3G-speed connection | Loading states shown, no timeout errors |
| EDGE-004 | Request timeout | Server takes 30s+ | Timeout error with retry option |

### 12.2 Data Integrity
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| EDGE-005 | Concurrent edit | Edit same trip in 2 tabs | No data corruption, last save wins |
| EDGE-006 | Delete during edit | Delete trip while editing in another tab | Graceful error on save |
| EDGE-007 | Very long content | 2000 char description | Saved and displayed correctly |
| EDGE-008 | Unicode content | Japanese/emoji in title | Saved and displayed correctly |
| EDGE-009 | XSS prevention | Script tag in title | Escaped, no execution |
| EDGE-010 | SQL injection | SQL in form fields | Safely escaped |

### 12.3 UI Edge Cases
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| EDGE-011 | Rapid form submission | Click Save multiple times quickly | Single submission, button disabled |
| EDGE-012 | Form navigation | Start editing → Navigate away | Unsaved changes warning or autosave |
| EDGE-013 | Very long trip name | 200 character title | Truncated/ellipsis in UI where needed |
| EDGE-014 | Many activities | 50+ activities in a day | Scrollable, no performance issues |
| EDGE-015 | Many sections | 20+ sections in guide | Scrollable, no performance issues |
| EDGE-016 | Empty sections | Section with 0 items | Shows empty state/placeholder |
| EDGE-017 | Browser back/forward | Navigate with browser buttons | Correct page shown, no errors |

### 12.4 Image Generation Edge Cases
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| EDGE-018 | Generate image - no cover | Trip without cover photo | Gradient background used |
| EDGE-019 | Generate image - no destination | Trip without destination | Destination area empty/hidden |
| EDGE-020 | Generate image - 0 days | Empty daily trip | Stats show appropriately |
| EDGE-021 | Generate image - very long title | 200 char title | Text truncated/wrapped appropriately |
| EDGE-022 | Cover photo unavailable | Cover URL returns 404 | Graceful fallback |

---

## 13. Performance Tests

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| PERF-001 | Dashboard load with 100 trips | Page loads < 3 seconds |
| PERF-002 | Explore page initial load | First contentful paint < 2 seconds |
| PERF-003 | Itinerary form with 10 days | No lag during editing |
| PERF-004 | Image generation time | PNG generated < 10 seconds |
| PERF-005 | Autosave debounce | No excessive API calls during rapid typing |
| PERF-006 | Large cover photo upload | 5MB file uploads < 5 seconds |
| PERF-007 | Search/filter response | Results appear < 500ms |

---

## 14. Security Tests

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| SEC-001 | CSRF protection | Attempt cross-site request | Blocked or requires valid token |
| SEC-002 | Direct URL access (auth) | Access /dashboard without login | Redirect to login |
| SEC-003 | Direct URL access (authz) | Access /itinerary/[other-id]/edit | 403 or redirect |
| SEC-004 | File upload type bypass | Rename .exe to .jpg, upload | Rejected by validation |
| SEC-005 | Rate limiting | 100 rapid API calls | Rate limited response (429) |
| SEC-006 | Session hijacking | Use expired/invalid token | 401 Unauthorized |
| SEC-007 | Sensitive data exposure | Check API responses | No passwords, tokens, or PII leaked |
| SEC-008 | Cover photo path traversal | Malicious filename | Sanitized, no directory access |

---

## 15. Cross-Browser & Responsive Tests

### 15.1 Browser Compatibility
| ID | Browser | Test Focus |
|----|---------|------------|
| COMPAT-001 | Chrome (latest) | Full functionality |
| COMPAT-002 | Firefox (latest) | Full functionality (no Web Share) |
| COMPAT-003 | Safari (latest) | Full functionality, Web Share |
| COMPAT-004 | Edge (latest) | Full functionality |
| COMPAT-005 | Chrome Android | Mobile layout, Web Share |
| COMPAT-006 | Safari iOS | Mobile layout, Web Share |

### 15.2 Responsive Breakpoints
| ID | Breakpoint | Test Focus |
|----|------------|------------|
| RESP-001 | Mobile (< 640px) | Single column layouts, touch targets |
| RESP-002 | Tablet (640-1024px) | 2-column grids, medium spacing |
| RESP-003 | Desktop (> 1024px) | Full layouts, hover states |
| RESP-004 | Large desktop (> 1280px) | Max-width containers, spacing |

---

## 16. Accessibility Tests

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| A11Y-001 | Keyboard navigation | All interactive elements focusable via Tab |
| A11Y-002 | Screen reader | Meaningful labels and ARIA attributes |
| A11Y-003 | Color contrast | WCAG AA compliant contrast ratios |
| A11Y-004 | Focus indicators | Visible focus rings on all elements |
| A11Y-005 | Form error association | Errors linked to fields via aria-describedby |
| A11Y-006 | Modal focus trap | Focus trapped in open dialogs |
| A11Y-007 | Skip to content | Skip link available |
| A11Y-008 | Image alt text | All images have meaningful alt or aria-label |

---

## Test Priority Matrix

| Priority | Category | Example Tests |
|----------|----------|---------------|
| **P0 - Critical** | Auth, Core CRUD | AUTH-001, AUTH-013, ITIN-001, ITIN-024, ITIN-037 |
| **P1 - High** | Data integrity, Security | API auth tests, validation, XSS prevention |
| **P2 - Medium** | Features, UX | Autosave, share page, explore |
| **P3 - Low** | Edge cases, Polish | Very long content, multi-tab scenarios |

---

## Execution Strategy

1. **Unit Tests**: Validation schemas, utility functions, hooks
2. **Integration Tests**: API routes with mock Supabase
3. **E2E Tests**: Critical user journeys with Playwright/Cypress
4. **Manual Tests**: Visual, responsive, accessibility
5. **Performance Tests**: Lighthouse, load testing

---

## Notes

- All tests assume Supabase is properly configured with RLS
- Cover photo tests require Supabase Storage bucket setup
- Image generation tests require Puppeteer/Chromium available
- Web Share API tests require mobile device or supported browser
