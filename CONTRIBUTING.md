# Team contribution and merge rules

Ranee is the Project Manager and final decision-maker. Use [team areas](docs/team-roles.md), [interface contract](docs/interface-contract.md), and your GitHub issue as the authority for work. Repository settings must enforce the rules below; this document alone is not branch protection.

1. Clone the repository, follow [how to run](docs/how-to-run.md), pull current `main`, then create the branch named in your issue. Use one branch and one PR per complete work area; a small foundation PR may precede Ranee's later integration PR.
2. Edit only the paths owned by your issue. If a needed change is outside your area or a contract is missing, describe the exact file and blocker on your issue. Ranee decides any named boundary override. Do not require a teammate's personal handoff or approval.
3. Keep commits focused. Never commit `.env`, API keys, `node_modules`, `dist`, logs, or unapproved datasets/assets.
4. Run the relevant commands in [how to run](docs/how-to-run.md), inspect `git diff --check` and the changed-file list, then push your task branch.
5. Open a PR into `main` linking the issue. Include behavior, changed paths, checks actually run, screenshots or test evidence, and limitations. Request `@seavens3nt` review. A draft PR is appropriate for incomplete work.
6. Ranee reviews member PRs against issue acceptance, scope, source fidelity, ownership, build/test results, safety, accessibility, and demo behavior. New commits require renewed review when protections dismiss stale approvals. Resolve review threads before merge.
7. Only Ranee authorizes a merge. Members must not approve or merge one another's PRs. Do not push directly to `main`, force push it, or bypass checks silently. Ranee's own PR uses the documented owner-PR path permitted by the repository ruleset.
8. After merge, pull updated `main`, run the integrated checks, and inspect the merged behavior. Issue closure and `Completed and verified` status require separate evidence, not just a pushed branch or green PR.

## MVP proof before submission

The stationary demo must show live camera plus map, one tested sign yielding the correct country-specific sourced rule and Gemini speech, an unsupported/unknown input, and clear simulation labels. If a feature cannot be verified, remove or mark it as a limitation in the pitch.
