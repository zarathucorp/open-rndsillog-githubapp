import { Repository } from "@octokit/webhooks-types";
import supabase from "../database/supabase.js";

export default async function checkPermission(repositoryInfo: Repository): Promise<boolean> {
	const gitUsername = repositoryInfo.owner.login;
	const gitRepository = repositoryInfo.name;
	console.log(`Checking permissions for ${gitUsername}/${gitRepository}`);

	try {
		const { data, error } = await supabase.from("gitrepo").select("*").ilike("git_username", gitUsername).ilike("git_repository", gitRepository);

		if (error) {
			console.error("Supabase query error:", error);
			return false;
		}

		if (data.length === 0) {
			console.error("No matching repository found in gitrepo table.");
			return false;
		}

		return true;
	} catch (err) {
		console.error("Unexpected error:", err);
		return false;
	}
}
