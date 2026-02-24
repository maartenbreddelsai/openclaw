import { randomUUID } from "node:crypto";
import fs from "node:fs";
import * as path from "node:path";
import { resolvePreferredOpenClawTmpDir } from "../infra/tmp-openclaw-dir.js";

export function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

export function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

export function resolveTempPathParts(opts: { ext: string; tmpDir?: string; id?: string }): {
  ext: string;
  tmpDir: string;
  id: string;
} {
  const tmpDir = opts.tmpDir ?? resolvePreferredOpenClawTmpDir();
  if (!opts.tmpDir) {
    fs.mkdirSync(tmpDir, { recursive: true, mode: 0o700 });
  }
  return {
    tmpDir,
    id: opts.id ?? randomUUID(),
    ext: opts.ext.startsWith(".") ? opts.ext : `.${opts.ext}`,
  };
}

/**
 * Generate a temp file path for node actions (invoke, screen-record, camera, etc.)
 * @param kind - Action kind (e.g., "invoke", "screen-record", "camera-snap")
 * @param ext - File extension (e.g., "json", "mp4")
 * @param suffix - Optional suffix (e.g., "front" for camera facing)
 * @param prefix - Optional prefix, defaults to "openclaw"
 */
export function nodeTempPath(opts: {
  kind: string;
  ext: string;
  suffix?: string;
  prefix?: string;
  tmpDir?: string;
  id?: string;
}): string {
  const { tmpDir, id, ext } = resolveTempPathParts(opts);
  const prefix = opts.prefix ?? "openclaw";
  const suffix = opts.suffix ? `-${opts.suffix}` : "";
  return path.join(tmpDir, `${prefix}-${opts.kind}${suffix}-${id}${ext}`);
}
