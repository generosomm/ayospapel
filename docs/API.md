# API - Physical Receiving Slice

All endpoints return JSON under `/api`. Authentication uses an HTTP-only
same-site session cookie. Error responses use:

```json
{
  "error": {
    "code": "STABLE_CODE",
    "message": "Safe user-facing message"
  }
}
```

## Authentication

- `POST /api/auth/login` - invite-only email/password sign-in; rate-limited.
- `POST /api/auth/logout` - invalidate the current server-side session.
- `GET /api/auth/me` - return the current authorized principal.

## Reference data

- `GET /api/reference-data` - clients, open periods, storage locations,
  document categories, and physical receiving channels visible to the caller.

Owner sees all active clients. Staff sees assigned clients unless explicit
broad access is granted. A client contact sees only its linked client and no
physical storage-location list.

## Batches

- `GET /api/batches` - up to 100 recent batches within the caller's client
  boundary.
- `POST /api/batches/physical` - owner or authorized staff creates a physical
  receiving record.
- `POST /api/batches/digital` - authorized staff or a linked client contact
  uploads a synthetic PDF/JPEG/PNG batch using multipart form data.
- `GET /api/batches/:id/acknowledgement` - safe acknowledgement for an
  authorized user; internal notes are excluded.
- `GET /api/batches/:id/attachments` - authorized attachment metadata.
- `GET /api/attachments/:id/download` - server-authorized private download with
  attachment disposition and content-sniffing protection.

Physical creation requires a UUID `clientRequestId`, accessible client and open
period, receiving timestamp, handover or pickup channel, sender, at least one
approved category, optional paired count/unit, notes, and active location.
Repeating the same request ID returns the original batch.

Digital uploads allow 20 files, 15 MB per file, and 100 MB per batch. File
signatures are checked against PDF, JPEG, or PNG types. The local adapter is
synthetic-development infrastructure only.
