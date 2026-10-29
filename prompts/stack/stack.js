import inquirer from "inquirer";
import chalk from "chalk";

const orange = chalk.hex("#FF6200");

// Preset catalogue, grouped into tiers for readability.
// The `value` strings MUST stay identical to the keys in getStackMeta.js.
const PRESET_GROUPS = [
  {
    title: "Classic MERN family",
    color: chalk.cyanBright,
    items: [
      { value: "mern", label: "MERN", desc: "MongoDB · Express · React · Node" },
      { value: "mean", label: "MEAN", desc: "MongoDB · Express · Angular · Node" },
      { value: "mevn", label: "MEVN", desc: "MongoDB · Express · Vue · Node" },
    ],
  },
  {
    title: "Classic + Tailwind + Auth",
    color: chalk.magentaBright,
    items: [
      { value: "mern+tailwind+auth", label: "MERN + Tailwind + Auth", desc: "React stack with styling & auth" },
      { value: "mean+tailwind+auth", label: "MEAN + Tailwind + Auth", desc: "Angular stack with styling & auth" },
      { value: "mevn+tailwind+auth", label: "MEVN + Tailwind + Auth", desc: "Vue stack with styling & auth" },
    ],
  },
  {
    title: "Frontend / Edge",
    color: chalk.yellowBright,
    items: [
      { value: "react+tailwind+firebase", label: "React + Tailwind + Firebase", desc: "Serverless app, no backend" },
      { value: "nextjs", label: "Next.js", desc: "Modern full-stack React, no backend" },
      { value: "hono", label: "Hono", desc: "Hono + Prisma + React" },
    ],
  },
];

/**
 * Builds the grouped, separator-delimited list of preset choices.
 * Separators are inquirer.Separator instances and are passed through untouched.
 */
function buildPresetChoices() {
  const choices = [];
  for (const group of PRESET_GROUPS) {
    choices.push(new inquirer.Separator(chalk.gray.bold(`  ── ${group.title} ──`)));
    for (const item of group.items) {
      choices.push({
        name:
          group.color.bold(`⚡ ${item.label}`) +
          chalk.gray(` → ${item.desc}`),
        value: item.value,
        short: item.label,
      });
    }
  }
  return choices;
}

export async function askStackQuestions() {
  // Sentinel value bound to every "← Back" choice. It is an internal detail of
  // this function and must never leak into the returned config.
  const BACK = "__back__";

  // ── Step 1: high-level choice only (progressive disclosure) ──
  // Looped so that "← Back" from Step 2 can return here instead of forcing a
  // Ctrl+C cancel of the whole CLI.
  while (true) {
    const categoryAnswer = await inquirer.prompt([
      {
        type: "list",
        name: "category",
        message: chalk.bold("Step 1 — How do you want to start?"),
        choices: [
          new inquirer.Separator(chalk.gray.bold("  ── Build your own stack ──")),
          {
            name:
              orange.bold("⚡ Custom Stack") +
              chalk.gray(" → pick every piece yourself"),
            value: "custom",
            short: "Custom Stack",
          },
          new inquirer.Separator(chalk.gray.bold("  ── Ready-made ──")),
          {
            name:
              chalk.cyanBright.bold("⚡ Preset Stacks") +
              chalk.gray(" → use a pre-configured stack"),
            value: "presets",
            short: "Preset Stacks",
          },
        ],
        pageSize: 10,
        default: "custom",
      },
    ]);

    // Custom stack has its own wizard + language step — return immediately.
    // The intermediate category value "presets" never leaves this function.
    if (categoryAnswer.category === "custom") {
      return { stack: "custom" };
    }

    // ── Step 2: preset list, only reached when "Preset Stacks" was chosen ──
    let stack = null;
    while (stack === null) {
      const stackAnswer = await inquirer.prompt([
        {
          type: "list",
          name: "stack",
          message: chalk.bold("Step 2 — Choose a preset stack"),
          choices: [
            {
              name: chalk.yellowBright.bold("← Back to path selection"),
              value: BACK,
              short: "← Back",
            },
            new inquirer.Separator(),
            ...buildPresetChoices(),
          ],
          pageSize: 14,
          default: "mern",
        },
      ]);

      // Chose to go back — restart from Step 1.
      if (stackAnswer.stack === BACK) break;
      stack = stackAnswer.stack;

      // ── Step 3: language, with "← Back" to Step 2 ──
      let language = null;
      while (language === null) {
        const langAnswer = await inquirer.prompt([
          {
            type: "list",
            name: "language",
            message: chalk.bold("Choose your language"),
            choices: [
              {
                name: chalk.yellowBright.bold("← Back to preset selection"),
                value: BACK,
                short: "← Back",
              },
              new inquirer.Separator(),
              {
                name: orange.bold("JavaScript") + chalk.gray(" → no build step"),
                value: "javascript",
                short: "JavaScript",
              },
              {
                name:
                  chalk.blueBright.bold("TypeScript") +
                  chalk.gray(" → types & safer refactors"),
                value: "typescript",
                short: "TypeScript",
              },
            ],
            pageSize: 10,
            default: "typescript",
          },
        ]);

        // Chose to go back — re-prompt Step 2.
        if (langAnswer.language === BACK) break;
        language = langAnswer.language;
      }

      if (language !== null) {
        return { stack, language };
      }

      // Step 3 went back: reset so Step 2 is asked again.
      stack = null;
    }
  }
}
