/* SPDX-License-Identifier: Apache-2.0 */
/*
 * Webform Development (Dragon) — Script Actions
 * Appends a unique "#WF-XXXXXXXX" token to the task title.
 *
 * Author: Brandon Decker
 * Date: 2025-09-04
 * License: Apache-2.0
 *
 * Runtime provides: project_gid, workspace_gid, task_gid, log(...), tasksApiInstance
 */

async function run() {
  const VALID_RE  = /#WF-\d{8}\b$/;                // valid trailing token
  const ANY_WF_RE = /#\s*wf[-\s_]?(\d{1,8})\b/gi;  // legacy/malformed tokens
  const squash = (s) => String(s || "").replace(/\s+/g, " ").trim();

  // 32-bit FNV-1a → stable 8-digit token from gid
  function hash8(input) {
    let h = 0x811c9dc5 >>> 0;
    const s = String(input);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    const n = h % 100000000;
    return String(n).padStart(8, "0");
  }

  const taskRes = await tasksApiInstance.getTask(task_gid, {
    opt_fields: "gid,name,custom_fields.name,custom_fields.gid,custom_fields.type",
  });
  const task = taskRes.data;
  const original = String(task.name || "");

  if (VALID_RE.test(original)) {
    log("Valid #WF-XXXXXXXX already present. Skipping.");
    return;
  }

  const base  = squash(original.replace(ANY_WF_RE, ""));
  const token = hash8(task.gid);
  const finalTitle = `${base} #WF-${token}`;

  const data = { name: finalTitle };

  const wfField = (task.custom_fields || []).find(
    (f) => f && f.name === "WF Ticket #" && f.type === "number"
  );
  if (wfField) {
    data.custom_fields = { [wfField.gid]: Number(token) };
  }

  await tasksApiInstance.updateTask({ data }, task_gid);
  log(`Updated → "${finalTitle}"${wfField ? " + set WF Ticket #." : ""}`);
}

run();
