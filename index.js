export default (app) => {
  // Feature-1 (onboarding when clucked onissue )
  app.on("issues.opened", async (context) => {
    // Firstly, if you open any issue, lets great !

    // now, we will ask the pobot, to checl, if the hiero.yml file is in there or not
    /*
    comment for myself:
    1) firstly i created .github/hiero.yml in my test repo
    2) our bot prints whatever written in it
     */

    const config = await context.config("hiero.yml");
    if (!config || !config.welcome_message) {
      // if no file, do nothing!
      app.log.info("No config file found");
      return;
    }
    // otherwise we will ost whatever there is written in the config file
    const issueComment = context.issue({
      body: config.welcome_message,
    });
    return context.octokit.issues.createComment(issueComment);
  });

  // // Feature-2 (applying the tag, like that of documentaiot )
  // Writing this whole feature in the faeture 4

  // app.on(["pull_request.opened", "pull_request.reopened"], async (context) => {
  //   // extract changed file (for bot)
  //   const files = await context.octokit.pulls.listFiles(context.pullRequest());
  //   // we iterate in all the files, if any has .md, we label as documentaion
  //   const hasMarkdown = files.data.some((file) =>
  //     file.filename.endsWith(".md"),
  //   );
  //   if (hasMarkdown) {
  //     app.log.info("Markdown file detected! Adding documentation label.");
  //     return context.octokit.issues.addLabels(
  //       context.issue({ labels: ["documentation"] }),
  //     );
  //   } else {
  //     app.log.info("No markdown files found. Skipping labels.");
  //   }
  // });

  // Issue with this feature is, probot is fast, so it sends a request to guthub fastly, but github takes
  // time to fetch DB, so probot if just takes in initial value
  // Ex) if its my 1st pr, thenn probot fetches 0(instead of 1).

  // Feature-3 THE MILESTONE TRACKER (Upgraded)
  app.on("pull_request.closed", async (context) => {
    const pr = context.payload.pull_request;
    if (!pr.merged) {
      app.log.info("PR was closed but not merged. Ignoring.");
      return;
    }

    const username = pr.user.login;
    const repoFullName = context.payload.repository.full_name;

    // 3. Search GitHub
    const query = `repo:${repoFullName} is:pr is:merged author:${username}`;
    const searchResult = await context.octokit.search.issuesAndPullRequests({
      q: query,
    });

    let totalMerges = searchResult.data.total_count;

    // Overcoming GitHub's Search Delay
    // We check if GitHub's slow database included the PR we *just* merged
    const isIndexed = searchResult.data.items.some(
      (item) => item.number === pr.number,
    );

    if (!isIndexed) {
      // If it's missing, we manually add it to the count!
      app.log.info(
        "Search index delayed. Manually adding current PR to count.",
      );
      totalMerges += 1;
    }

    app.log.info(`User ${username} just hit ${totalMerges} merged PRs!`);

    // 5. The Progression Logic
    let milestoneMessage = "";
    if (totalMerges === 1) {
      milestoneMessage = `🎉 Congratulations on your very first merged PR, @${username}! Welcome to the Hiero developer ecosystem!`;
    } else if (totalMerges === 4) {
      milestoneMessage = `🔥 5 Merged PRs! You are on fire, @${username}! You are officially a Hiero Core Contributor!`;
    } else if (totalMerges === 10) {
      milestoneMessage = `🏆 10 MERGES! @${username}, you are an absolute legend. Thank you for your massive impact on this project!`;
    }

    // 6. Post the comment
    if (milestoneMessage !== "") {
      const issueComment = context.issue({
        body: milestoneMessage,
      });
      return context.octokit.issues.createComment(issueComment);
    } else {
      app.log.info("No milestone hit this time.");
    }
  });

  // Feature 4: PR labelling

  app.on(
    ["pull_request.opened", "pull_request.reopened", "pull_request.edited"],
    async (context) => {
      const pr = context.payload.pull_request;
      const title = pr.title;

      // --- 1. THE LINTER ---
      const titleRegex = /^(feat|fix|docs|chore): .+/;
      const isTitleValid = titleRegex.test(title);

      if (!isTitleValid) {
        app.log.info(`Invalid PR title detected: "${title}"`);
        await context.octokit.issues.createComment(
          context.issue({
            body: `🚫 **Invalid PR Title!** @${pr.user.login}, please rename this PR using [Conventional Commits](https://www.conventionalcommits.org/). \n\n**Example:** \`feat: add login button\`.`,
          }),
        );
        await context.octokit.issues.addLabels(
          context.issue({ labels: ["needs-title-update"] }),
        );
        // Note: We don't 'return' here anymore because we want the bot to keep checking for other things!
      }

      // Feature 5. THE SIZE CHECKER (Monster PR) ---
      /**
       * What happenes, is, that the contributors often push big PR's which is troublesome for the
       * maintainers, so this leads for the review of PR to take weeks.
       * So, what we try is , warn the contributor, that the PR is very big !
       */
      
      const totalChanges = pr.additions + pr.deletions;
      if (totalChanges > 50) {
        app.log.info(`Large PR detected: ${totalChanges} changes.`);
        await context.octokit.issues.createComment(
          context.issue({
            body: `⚠️ **Large PR Detected!** (${totalChanges} changes). Consider breaking this into smaller PRs to help maintainers review faster.`,
          }),
        );
      }

      // Feature 2 (Labelling the PR)
      const files = await context.octokit.pulls.listFiles(
        context.pullRequest(),
      );
      const hasMarkdown = files.data.some((file) =>
        file.filename.endsWith(".md"),
      );

      if (hasMarkdown) {
        app.log.info("Markdown detected! Adding label.");
        return context.octokit.issues.addLabels(
          context.issue({ labels: ["documentation"] }),
        );
      }
    },
  );
};
