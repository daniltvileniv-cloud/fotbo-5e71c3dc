# Admin block

Attached by the `attach_block` tool. This file is the record that it is installed —
deleting it does not remove the code, and the code does not work without the files
listed below.

## What was added

    src/features/admin/AdminApp.jsx       shell: login gate, sidebar, nested routes
    src/features/admin/AdminLogin.jsx     password form
    src/features/admin/ResourceList.jsx   searchable table, edit/delete actions
    src/features/admin/ResourceForm.jsx   create/edit form
    src/features/admin/fields.jsx         field types and their renderers
    src/features/admin/useResource.js     data loading, relation lookups
    src/store/adminAuth.jsx               session; the token lives in React state only
    src/app/blocks.jsx                    regenerated so the router mounts /admin/*

Nothing else changed. The router, the server and the pages were not touched.

## How it works

The panel has no per-entity screens. It reads `resources` from `admin.config.json`
through `GET /api/admin/schema` (admin-only, and the password is never sent to the
browser), then renders a list and a form for each resource.

Adding a managed collection is a few lines of JSON, not a new screen:

```json
"resources": {
  "products": {
    "label": "Products",
    "labelKey": "title",
    "listFields": ["imageUrl", "title", "price"],
    "fields": [
      { "name": "title", "type": "text", "required": true },
      { "name": "price", "type": "money", "currency": "UAH" },
      { "name": "categoryId", "type": "select", "from": "categories" }
    ]
  }
}
```

Field types: `text`, `textarea`, `number`, `money`, `boolean`, `date`, `image`,
`select`. A `select` needs `from` — the collection it points at.

## Rules

- `/admin` is reachable by URL only. It is never linked from the site.
- The password in `admin.config.json` is generated per project. Keep it.
- Write access to the API is guarded server-side; a gate that exists only in React
  is not a gate.
- The session token is held in React state, so a reload returns to the login form.
  That is correct behaviour.

## Changing it

Edit `admin.config.json` first — nearly everything is configuration. If a request
genuinely does not fit (a bulk action, a stats dashboard), add ONE screen of your
own under `src/features/admin/` and route it; leave the generic panel for the rest.
