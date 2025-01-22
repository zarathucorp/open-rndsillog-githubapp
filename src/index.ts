import { Probot } from "probot";
import { convertMarkdownToPDF } from "./func/pdf.js";
import { v4 as uuidv4 } from "uuid";
import checkPermission from "./auth/checkPermission.js";
import axios from "axios";
import { Repository } from "@octokit/webhooks-types";

type github_type = "Commit" | "PR" | "Issue";
export const sendToBackend = async (markdownContent: string, repositoryInfo: Repository, eventType: github_type) => {
	try {
		// const { data } = await axios.post("https://3010-61-78-80-75.ngrok-free.app" + `/dashboard/note/github`, 
		const { data } = await axios.post(process.env.API_SERVER_URL + `/dashboard/note/github`, {
			markdownContent: markdownContent,
			eventType: eventType,
			repositoryInfo: {
				owner: repositoryInfo.owner.login,
				name: repositoryInfo.name,
				url: repositoryInfo.html_url,
				full_name: repositoryInfo.full_name,
			},
		});

		if (data.status !== "succeed") {
			throw new Error("Failed to send data to backend");
		}
	} catch (e: any) {
		console.error(e);
	}
};

export default (app: Probot) => {
	app.on(["issues.opened", "issues.closed", "issues.reopened"], async (context) => {
		if (!(await checkPermission(context.payload.repository))) return;
		const { action, issue } = context.payload;
		let markdownContent = "";

		if (action === "opened" && issue) {
			console.log("Issue opened");
			markdownContent = generateIssueMarkdown(issue, "Issue Opened");
		} else if (action === "closed" && issue) {
			console.log("Issue closed");
			markdownContent = generateIssueMarkdown(issue, "Issue Closed");
		} else if (action === "reopened" && issue) {
			console.log("Issue reopened");
			markdownContent = generateIssueMarkdown(issue, "Issue Reopened");
		}
		await sendToBackend(markdownContent, context.payload.repository, "Issue");
		await convertMarkdownToPDF(markdownContent, uuidv4(), context.payload.repository, "Issue");
	});

	app.on(["issue_comment.created"], async (context) => {
		if (!(await checkPermission(context.payload.repository))) return;
		const { comment } = context.payload;

		if (comment) {
			const markdownContent = generateCommentMarkdown(comment);
			await sendToBackend(markdownContent, context.payload.repository, "Issue");
			await convertMarkdownToPDF(markdownContent, uuidv4(), context.payload.repository, "Issue");
		}
	});

	app.on("push", async (context) => {
		if (!(await checkPermission(context.payload.repository))) return;
		const commits = context.payload.commits;

		if (commits && commits.length > 0) {
			const markdownContent = generateCommitsMarkdown(commits);
			await sendToBackend(markdownContent, context.payload.repository, "Commit");
			await convertMarkdownToPDF(markdownContent, uuidv4(), context.payload.repository, "Commit");
		}
	});

	app.on(["pull_request.opened", "pull_request.closed", "pull_request.reopened"], async (context) => {
		if (!(await checkPermission(context.payload.repository))) return;
		const { action, pull_request } = context.payload;

		if (pull_request) {
			const markdownContent = generatePullRequestMarkdown(pull_request, action);
			await sendToBackend(markdownContent, context.payload.repository, "PR");
			await convertMarkdownToPDF(markdownContent, uuidv4(), context.payload.repository, "PR");
		}
	});
};

// // Duplicate code
// export function generateIssueMarkdown(issue: any, action: string): string {
// 	const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
// 	const body = issue.body || "No description";
// 	const segments = Array.from(segmenter.segment(body));
// 	const firstLine = segments.slice(0, segments.findIndex(segment => segment.segment === '\n') + 1).join('');

// 	return `## ${action}\n- Title: ${issue.title}\n- Description: \n\`\`\`markdown\n${firstLine.trim()}\n(...)\n\`\`\`\n- Author: ${issue.user.login}\n- URL: [Link](${issue.html_url})\n---`;
// }

export function generateIssueMarkdown(issue: any, action: string): string {
	const description = issue.body ? issue.body.split('\n')[0] + `\n(...)` : "No description";
	return `## ${action}\n- Title: ${issue.title}\n- Description: \n\`\`\`markdown\n${description}\n\`\`\`\n- Author: ${issue.user.login}\n- URL: [Link](${issue.html_url})\n`;
}

export function generateCommentMarkdown(comment: any): string {
	return `## Comment Created\n- Author: ${comment.user.login}\n- Comment: ${comment.body}\n- URL: [Link](${comment.html_url})\n`;
}

export function generateCommitsMarkdown(commits: any[]): string {
	return commits.reduce((markdown, commit) => {
		return markdown + `## Commit by ${commit.author.name}\n- **SHA:** ${commit.id}\n- **Message:** ${commit.message}\n- **URL:** [Commit Link](${commit.url})\n\n`;
	}, "# Commit Details\n\n");
}

export function generatePullRequestMarkdown(pull_request: any, action: string): string {
	let markdownContent = `## Pull Request Event: ${action}\n`;
	markdownContent += `- PR Number: ${pull_request.number}\n`;
	markdownContent += `- Title: ${pull_request.title}\n`;
	markdownContent += `- Author: ${pull_request.user.login}\n`;
	markdownContent += `- State: ${pull_request.state}\n`;
	markdownContent += `- Created At: ${pull_request.created_at}\n`;
	if (action === "closed" && pull_request.merged) {
		markdownContent += `- Merged: Yes\n`;
	} else if (action === "closed") {
		markdownContent += `- Merged: No\n`;
	}
	return markdownContent;
}
