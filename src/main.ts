import * as core from '@actions/core';
import { shouldSkipBranch } from './utils';
import { getInputs } from './action-inputs';
import { GithubConnector } from './github-connector';
import { JiraConnector } from './jira-connector';

async function run(): Promise<void> {
  try {
    console.log('3');
    const { BRANCH_IGNORE_PATTERN } = getInputs();
    console.log('4');
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

    const { FAIL_WHEN_JIRA_ISSUE_NOT_FOUND } = getInputs();
    if (FAIL_WHEN_JIRA_ISSUE_NOT_FOUND) {
      core.setFailed(error.message);
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

run();
