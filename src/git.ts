import { simpleGit } from "simple-git";
import type { SimpleGit } from "simple-git";

const git: SimpleGit = simpleGit();

export const getGitDiff = async () => {
  try {
    await git.raw(["config", "core.autocrlf", "true"]);
    const diff = await git.diff(["--cached", "--ignore-space-at-eol"]);
    if (diff) return diff;
    const unstaged = await git.diff(["--ignore-space-at-eol"]);
    return unstaged || "No changes detected";
  } catch (error) {
    console.error(error);
    return "";
  }
};
