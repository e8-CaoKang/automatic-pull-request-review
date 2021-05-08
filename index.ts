import core from '@actions/core';
import github from '@actions/github';

const token = core.getInput('repo-token');
const requestEvent = core.getInput('event');
const body = core.getInput('body');

const octokit = github.getOctokit(token)

if (
  (requestEvent === 'COMMENT' || requestEvent === 'REQUEST_CHANGES') &&
  !body
) {
  core.setFailed('Event type COMMENT & REQUEST_CHANGES require a body.');
}

const pullRequest = github.context.payload['pull_request'];

if (!pullRequest) {
  core.setFailed('This action is meant to be ran on pull requests');
}

const query = `
mutation {
  addPullRequestReview(input: {
    pullRequestId: "${(<any>pullRequest)['node_id']}",
    event: ${requestEvent},
    body: "${body}"
  }) {clientMutationId}
}`;

octokit.graphql(query).catch((err) => {
  core.error(err);
  core.setFailed(err.message);
});
