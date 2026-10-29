import inquirer from "inquirer";
import chalk from "chalk";

/**
 * Language options for the project.
 */
const LANGUAGE_OPTIONS = [
  { label: "TypeScript", color: chalk.blueBright, desc: "Type-safe JavaScript superset", value: "typescript" },
  { label: "JavaScript", color: chalk.yellowBright, desc: "Classic dynamic scripting",     value: "javascript" },
];

/**
 * Prompts the user to select a programming language.
 *
 * @param {string} [stepLabel] - Optional step label prefix, e.g. "[1/9]".
 * @param {object} [options]
 * @param {string} [options.backValue] - When set, prepends a "← Back" choice
 *   that resolves to this value (the caller owns the sentinel).
 * @param {string} [options.backLabel] - Label for the back choice.
 * @returns {Promise<{ language: string }>}
 */
export async function askLanguage(stepLabel = "", { backValue, backLabel } = {}) {
  const prefix = stepLabel ? `${stepLabel} ` : "";

  const choices = LANGUAGE_OPTIONS.map((opt) => ({
    name:
      opt.color.bold(`⚡ ${opt.label}`) +
      chalk.gray(` → ${opt.desc}`),
    value: opt.value,
  }));

  // Optional navigation entry, rendered in colour so it reads as a button.
  if (backValue !== undefined) {
    choices.unshift(
      {
        name: chalk.yellowBright.bold(`← ${backLabel ?? "Back"}`),
        value: backValue,
        short: "← Back",
      },
      new inquirer.Separator()
    );
  }

  const { language } = await inquirer.prompt([
    {
      type: "list",
      name: "language",
      message: chalk.bold(`${prefix}Select a language:`),
      choices,
      default: "typescript",
    },
  ]);

  return { language };
}
