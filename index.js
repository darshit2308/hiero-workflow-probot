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
  app.on(["pull_request.opened", "pull_request.reopened"], async (context) => {
    // extract changed file (for bot)
    const files = await context.octokit.pulls.listFiles(context.pullRequest());
    // we iterate in all the files, if any has .md, we label as documentaion
    const hasMarkdown = files.data.some((file) =>
      file.filename.endsWith(".md"),
    );
    if (hasMarkdown) {
      app.log.info("Markdown file detected! Adding documentation label.");
      return context.octokit.issues.addLabels(
        context.issue({ labels: ["documentation"] }),
      );
    } else {
      app.log.info("No markdown files found. Skipping labels.");
    }
  });

  // Issue with this feature is, probot is fast, so it sends a request to guthub fastly, but github takes
  // time to fetch DB, so probot if just takes in initial value
  // Ex) if its my 1st pr, thenn probot fetches 0(instead of 1).

  // ==========================================================
  // FEATURE 3: THE MILESTONE TRACKER (Upgraded)
  // ==========================================================
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

    // 4. THE SENIOR FIX: Overcoming GitHub's Search Delay
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
};
