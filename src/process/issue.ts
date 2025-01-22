// import { convertMarkdownToPDF } from "../func/pdf.js";
// import { v4 as uuidv4 } from "uuid";

// function processIssueEvent(context) {
// 	const { action, issue } = context.payload;
// 	let markdownEntry = "";
// 	if (action === "opened" && issue) {
// 		console.log("Issue opened");
// 		markdownEntry = `### Issue Opened\n- Title: ${issue.title}\n- Description: ${issue.body || "No description"}\n- Author: ${issue.user.login}\n- URL: ${issue.html_url}\n---`;
// 	} else if (action === "closed" && issue) {
// 		console.log("Issue Closed");
// 		markdownEntry = `### Issue Closed\n- Title: ${issue.title}\n- Closer: ${issue.user.login}\n- URL: ${issue.html_url}\n---`;
// 	} else if (action === "reopened" && issue) {
// 		console.log("Issue Reopened");
// 		markdownEntry = `### Issue Reopened\n- Title: ${issue.title}\n- Re-opener: ${issue.user.login}\n- URL: ${issue.html_url}\n---`;
// 	}
// 	convertMarkdownToPDF(markdownEntry, uuidv4());
// }
