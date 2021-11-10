import * as core from '@actions/core';
console.log('1');
import { shouldSkipBranch } from './utils';
console.log('2');
import { getInputs } from './action-inputs';
console.log('3');
import { GithubConnector } from './github-connector';
console.log('4');
import { JiraConnector } from './jira-connector';
console.log('5');

async function run(): Promise<void> {
  const { FAIL_WHEN_JIRA_ISSUE_NOT_FOUND } = getInputs();

  try {
    const { BRANCH_IGNORE_PATTERN } = getInputs();
    const githubConnector = new GithubConnector();
    const jiraConnector = new JiraConnector();

    if (!githubConnector.isPRAction) {
      console.log('This action meant to be run only on PRs');
      process.exit(0);
    }

    if (shouldSkipBranch(githubConnector.headBranch, BRANCH_IGNORE_PATTERN)) {
      process.exit(0);
    }

    const issueKey = githubConnector.getIssueKeyFromTitle();

    await jiraConnector.getTicketDetails(issueKey);
    // const details = await jiraConnector.getTicketDetails(issueKey);
    // await githubConnector.updatePrDetails(details);
  } catch (error) {
    console.log('JIRA key was not found');
    core.error(error.message);

    if (FAIL_WHEN_JIRA_ISSUE_NOT_FOUND) {
      core.setFailed(error.message);
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

run();
