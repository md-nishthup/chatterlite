# ChatterLite Group Chat Context

## Group Sidebar
- Persistent FAB "+" button in bottom-right corner to create a new group.
- Search bar at the top for finding public groups by name.

## Group Creation
- Step 1: Prompt user for a group name.
- Step 2: Allow multi-user selection from friend list.
- Step 3: Creator becomes default Group Admin.
- Step 4: Group is created with unique ID and metadata.

## Group Types
- **Public**: Join without approval or with request.
- **Private**: Only join by invite.
- **Secret**: Hidden from public list; invite-only.

## Group Roles
- **Admin**
  - Add/remove members.
  - Promote/demote admins.
  - Change group metadata (name, description, avatar).
  - Delete group.
- **Member**
  - Interact with chat.
  - Leave group.

## Group Features
- Chat:
  - Media sharing (images, videos, files)
  - Mentions (@username)
  - Inline replies
  - Typing indicators
  - Message reactions
  - Pinned messages
  - Threads (optional)
- UI:
  - Last message preview
  - Unread badge
  - "You were mentioned" highlight

## Group Profile
- Name
- Avatar
- Description
- Created at
- List of members with admin tags
- Total members

## Group Settings (Accessible via 3-dot menu)
- View group info
- Invite link generation
- Visibility settings
- Leave group
- Manage members (Admin-only)
- Mute notifications

## Group Join & Discovery
- Users can search public groups in sidebar.
- Options shown based on group type:
  - **Join**
  - **Request to Join**
  - **No access** (private/secret)

## UX Details
- Empty state when user is not in any group:
  - Message: “You’re not in any groups yet.”
  - CTA: “Create a Group” button or "+" FAB

## Backend Considerations
- Store group metadata in Firestore: `/groups/{groupId}`
- Member list stored as a subcollection or array
- Role management via flags (isAdmin)
- Visibility flag: `public`, `private`, `secret`

