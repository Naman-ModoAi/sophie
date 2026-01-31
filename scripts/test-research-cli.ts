#!/usr/bin/env tsx
/**
 * Interactive CLI for testing frontend research agents
 * Matches functionality of backend/cli_research_agent.py
 *
 * Usage: npm run test:research
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import readline from 'readline';
import chalk from 'chalk';
import { PersonResearchAgent } from '../lib/research/agents/person-agent';
import { CompanyResearchAgent } from '../lib/research/agents/company-agent';
import { PersonResearch, CompanyResearch } from '../lib/research/types';

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

// Demo data matching backend
const DEMO_PEOPLE = [
  {
    name: "Satya Nadella",
    email: "satya@microsoft.com",
    company: "Microsoft",
  },
  {
    name: "Sundar Pichai",
    email: "sundar@google.com",
    company: "Google",
  },
  {
    name: "Dario Amodei",
    email: "dario@anthropic.com",
    company: "Anthropic",
  },
  {
    name: "Ravikesh Kumar",
    email: "ravikesh@nuworks.co",
    company: "IcecreamLabs",
  },
  {
    name: "Naman",
    email: "naman@getmodo.in",
    company: "Icecreamlabs",
  },
  {
    name: "Madhu",
    email: "madhu@icecreamlabs.com",
    company: "IcecreamLabs",
  },
];

const DEMO_COMPANIES = [
  { name: "Microsoft", domain: "microsoft.com" },
  { name: "Google", domain: "google.com" },
  { name: "Anthropic", domain: "anthropic.com" },
  { name: "OpenAI", domain: "openai.com" },
  { name: "NVIDIA", domain: "nvidia.com" },
  { name: "IcecreamLabs", domain: "icecreamlabs.com" },
  { name: "Modo", domain: "getmodo.in" },
];

class ResearchAgentCLI {
  private personAgent: PersonResearchAgent;
  private companyAgent: CompanyResearchAgent;
  private rl: readline.Interface;

  constructor() {
    this.personAgent = new PersonResearchAgent();
    this.companyAgent = new CompanyResearchAgent();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Print a header with decorative border
   */
  private printHeader(title: string): void {
    const border = '='.repeat(80);
    console.log(chalk.cyan(`\n${border}`));
    console.log(chalk.bold.white(`  ${title}`));
    console.log(chalk.cyan(`${border}`));
  }

  /**
   * Print a section title
   */
  private printSection(title: string): void {
    console.log(chalk.yellow(`\n${title}`));
  }

  /**
   * Get user input
   */
  private getInput(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(`\n${prompt}: `, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Wait for user to press Enter
   */
  private async waitForEnter(): Promise<void> {
    await this.getInput('Press Enter to continue');
  }

  /**
   * Display main menu and get user choice
   */
  private async showMainMenu(): Promise<string> {
    this.printHeader('Research Agent Interactive CLI');
    console.log(chalk.white('  [1] Test Person Research'));
    console.log(chalk.white('  [2] Test Company Research'));
    console.log(chalk.white('  [3] Custom Research (manual input)'));
    console.log(chalk.white('  [q] Quit'));
    console.log(chalk.cyan('='.repeat(80)));

    return await this.getInput('Select an option');
  }

  /**
   * Display person research results
   */
  private displayPersonResearch(result: PersonResearch): void {
    console.log(chalk.cyan('\n' + '='.repeat(80)));
    console.log(chalk.bold.white(`  Person Research: ${result.name}`));
    console.log(chalk.cyan('='.repeat(80)));
    console.log(chalk.yellow('Email:'), result.email);
    console.log(chalk.yellow('\nMarkdown Content:'));
    console.log(result.markdown_content);
  }

  /**
   * Display company research results
   */
  private displayCompanyResearch(result: CompanyResearch): void {
    console.log(chalk.cyan('\n' + '='.repeat(80)));
    console.log(chalk.bold.white(`  Company Research: ${result.name}`));
    console.log(chalk.cyan('='.repeat(80)));
    console.log(chalk.yellow('Domain:'), result.domain);
    console.log(chalk.yellow('\nMarkdown Content:'));
    console.log(result.markdown_content);
  }

  /**
   * Research a demo person
   */
  private async researchDemoPerson(): Promise<void> {
    this.printHeader('Demo Person Research');

    console.log(chalk.white('\nAvailable Demo People:'));
    DEMO_PEOPLE.forEach((person, idx) => {
      console.log(chalk.white(`  [${idx + 1}] ${person.name} (${person.company})`));
    });

    const choice = await this.getInput(`Select a person (1-${DEMO_PEOPLE.length})`);
    const index = parseInt(choice) - 1;

    if (index < 0 || index >= DEMO_PEOPLE.length || isNaN(index)) {
      console.log(chalk.red('\nInvalid selection. Please try again.'));
      return;
    }

    const person = DEMO_PEOPLE[index];
    console.log(chalk.cyan(`\nResearching ${person.name}...`));

    try {
      const result = await this.personAgent.researchPerson({
        name: person.name,
        email: person.email,
        company: person.company,
      });

      this.displayPersonResearch(result);
    } catch (error) {
      console.error(chalk.red('\n[ERROR] Research failed:'), error);
      if (error instanceof Error) {
        console.error(chalk.red('Details:'), error.message);
      }
    }

    await this.waitForEnter();
  }

  /**
   * Research a custom person
   */
  private async researchCustomPerson(): Promise<void> {
    this.printHeader('Custom Person Research');

    const name = await this.getInput('Enter person name');
    if (!name) {
      console.log(chalk.red('\nName is required.'));
      return;
    }

    const email = await this.getInput('Enter email');
    if (!email) {
      console.log(chalk.red('\nEmail is required.'));
      return;
    }

    const company = await this.getInput('Enter company (optional)');

    console.log(chalk.cyan(`\nResearching ${name}...`));

    try {
      const result = await this.personAgent.researchPerson({
        name,
        email,
        company: company || undefined,
      });

      this.displayPersonResearch(result);
    } catch (error) {
      console.error(chalk.red('\n[ERROR] Research failed:'), error);
      if (error instanceof Error) {
        console.error(chalk.red('Details:'), error.message);
      }
    }

    await this.waitForEnter();
  }

  /**
   * Research a demo company
   */
  private async researchDemoCompany(): Promise<void> {
    this.printHeader('Demo Company Research');

    console.log(chalk.white('\nAvailable Demo Companies:'));
    DEMO_COMPANIES.forEach((company, idx) => {
      console.log(chalk.white(`  [${idx + 1}] ${company.name} (${company.domain})`));
    });

    const choice = await this.getInput(`Select a company (1-${DEMO_COMPANIES.length})`);
    const index = parseInt(choice) - 1;

    if (index < 0 || index >= DEMO_COMPANIES.length || isNaN(index)) {
      console.log(chalk.red('\nInvalid selection. Please try again.'));
      return;
    }

    const company = DEMO_COMPANIES[index];
    console.log(chalk.cyan(`\nResearching ${company.name}...`));

    try {
      const result = await this.companyAgent.researchCompany({
        domain: company.domain,
        companyName: company.name,
      });

      this.displayCompanyResearch(result);
    } catch (error) {
      console.error(chalk.red('\n[ERROR] Research failed:'), error);
      if (error instanceof Error) {
        console.error(chalk.red('Details:'), error.message);
      }
    }

    await this.waitForEnter();
  }

  /**
   * Research a custom company
   */
  private async researchCustomCompany(): Promise<void> {
    this.printHeader('Custom Company Research');

    const domain = await this.getInput('Enter company domain');
    if (!domain) {
      console.log(chalk.red('\nDomain is required.'));
      return;
    }

    const companyName = await this.getInput('Enter company name (optional)');

    console.log(chalk.cyan(`\nResearching ${companyName || domain}...`));

    try {
      const result = await this.companyAgent.researchCompany({
        domain,
        companyName: companyName || undefined,
      });

      this.displayCompanyResearch(result);
    } catch (error) {
      console.error(chalk.red('\n[ERROR] Research failed:'), error);
      if (error instanceof Error) {
        console.error(chalk.red('Details:'), error.message);
      }
    }

    await this.waitForEnter();
  }

  /**
   * Custom research menu
   */
  private async customResearch(): Promise<void> {
    this.printHeader('Custom Research');

    console.log(chalk.white('\n  [1] Research a Person'));
    console.log(chalk.white('  [2] Research a Company'));
    console.log(chalk.white('  [b] Back to main menu'));

    const choice = await this.getInput('Select an option');

    switch (choice) {
      case '1':
        await this.researchCustomPerson();
        break;
      case '2':
        await this.researchCustomCompany();
        break;
      case 'b':
        return;
      default:
        console.log(chalk.red('\nInvalid option. Please try again.'));
    }
  }

  /**
   * Main run loop
   */
  async run(): Promise<void> {
    console.log(chalk.bold.cyan('\n' + '='.repeat(80)));
    console.log(chalk.bold.white('  Welcome to Research Agent Interactive CLI!'));
    console.log(chalk.bold.cyan('='.repeat(80)));

    while (true) {
      const choice = await this.showMainMenu();

      switch (choice) {
        case '1':
          await this.researchDemoPerson();
          break;
        case '2':
          await this.researchDemoCompany();
          break;
        case '3':
          await this.customResearch();
          break;
        case 'q':
          console.log(chalk.yellow('\nGoodbye!'));
          this.rl.close();
          process.exit(0);
        default:
          console.log(chalk.red('\nInvalid option. Please try again.'));
      }
    }
  }
}

// Main execution
async function main() {
  // Check for required environment variables
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    console.error(chalk.red('[ERROR] GOOGLE_GEMINI_API_KEY not found in environment'));
    console.log(chalk.yellow('Please set it in .env.local'));
    console.log(chalk.yellow('Note: Using Gemini 2.0 with Google Search grounding (no Serper API needed)'));
    process.exit(1);
  }

  const cli = new ResearchAgentCLI();

  // Graceful exit on Ctrl+C
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\nGoodbye!'));
    process.exit(0);
  });

  await cli.run();
}

// Run the CLI
main().catch((error) => {
  console.error(chalk.red('[ERROR] Fatal error:'), error);
  process.exit(1);
});
