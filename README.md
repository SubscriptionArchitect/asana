# Webform Development (Dragon) — Script Actions

Appends a unique `#WF-XXXXXXXX` token to an Asana task title based on a stable hash of the task GID. Also writes a numeric custom field “WF Ticket #” if present.

## License & Attribution

Licensed under **Apache-2.0**.  
Redistributors **must** retain the `LICENSE` and `NOTICE` files.  
Preferred citation: “Used with attribution to Brandon Decker.”  
See `CITATION.cff` for formatted citation.

## Usage

Drop into an Asana Script Action environment that provides:
`project_gid, workspace_gid, task_gid, log(...), tasksApiInstance`.

