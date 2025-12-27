#!/usr/bin/env ts-node
import { Command } from "commander";
import simpleGit, { type SimpleGit } from "simple-git";
import chalk from "chalk";
import { getGitDiff } from "../src/git";
import { generateCommitMessage } from "../src/llm";
import dotenv from "dotenv";
dotenv.config();

const git: SimpleGit = simpleGit();
const program = new Command();

program
  .name("commit")
  .description("AI-powered Git commit using Google Gemini")
  .version("1.0.0")
  .option("-p, --push", "push after committing");

program.action(async (options) => {
  try {
    const diff = await getGitDiff();

    if (!diff || diff.includes("No changes staged")) {
      console.log(chalk.yellow("Nostaged changes to commit, Samuel!"));
      process.exit(0);
    }

    console.log(chalk.blue("Analyzingstaged change...\n"));
    const message = await generateCommitMessage(diff);

    console.log(chalk.green("Commit message generated:\n"));
    console.log(chalk.green(`"${message}"\n`));

    console.log(chalk.blue(`> ran: git commit -m "${message}"`));

    await git.commit(message);

    console.log(chalk.green("\nCommit successful"));

    if (options.push) {
      console.log(chalk.blue("> ran: git push"));
      await git.push();
      console.log(chalk.green("Push successful"));
    }
  } catch (error) {
    console.error(chalk.red("Commit failed:"), error);
    process.exit(1);
  }
});

program.parse(process.argv);
