// The few OS facts this plugin needs, in one place: a PATH that still works when bb is
// launched from a GUI, and where a share is normally mounted on this machine.
import os from "node:os";
import path from "node:path";
import { z } from "zod";

const EXTRA_PATH_DIRS =
  process.platform === "darwin"
    ? ["/opt/homebrew/bin", "/opt/homebrew/sbin", "/usr/local/bin", "/usr/local/sbin"]
    : ["/usr/local/bin", "/usr/local/sbin", path.join(os.homedir(), ".local", "bin")];

/**
 * PATH for every child process this plugin spawns (`bash` running the always-on script,
 * `ssh`, a headless browser).
 *
 * A union, never a replacement. The pinned system dirs keep `bash`, `ssh` and `sh`
 * resolving predictably when bb is launched from a GUI or an AppImage with a thin PATH —
 * that was the point of pinning. But `process.env.PATH` has to come along: `bb` itself is
 * frequently outside every pinned dir (an AppImage mount, `~/.local/bin`, a tarball
 * install), and a PATH that hides it makes `command -v bb` fail on the always-on machine.
 */
export const BASE_PATH = [
  "/usr/bin",
  "/bin",
  "/usr/sbin",
  "/sbin",
  ...EXTRA_PATH_DIRS,
  ...(process.env.PATH ?? "").split(":").filter(Boolean),
].join(":");

/** Where a shared drive is usually mounted here: `/Volumes` on macOS, `/mnt` on Linux. */
export const MOUNT_BASE = process.platform === "darwin" ? "/Volumes" : "/mnt";

export const systemSchema = z.object({
  /** `process.platform` of the machine bb runs on — not the browser looking at it. */
  platform: z.enum(["darwin", "linux", "win32", "other"]),
  mountBase: z.string(),
  /** The mount point example the Set up form shows for this OS. */
  mountExample: z.string(),
});

export type System = z.infer<typeof systemSchema>;

export function systemInfo(): System {
  const platform = process.platform === "darwin" || process.platform === "linux" || process.platform === "win32" ? process.platform : "other";
  return {
    platform,
    mountBase: MOUNT_BASE,
    mountExample: path.join(MOUNT_BASE, "MyNAS"),
  };
}
