import { createClient } from "@supabase/supabase-js";
import { NewNoteType } from "@/types/NoteType.js";
import { RepositoryType } from "@/types/Repository.js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_KEY = process.env.SUPABASE_KEY as string;

if (!SUPABASE_URL || !SUPABASE_KEY) {
	console.error("Supabase credentials are not set in environment variables.");
	process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;

export async function addNote(note: NewNoteType): Promise<boolean> {
	try {
		const { error, status } = await supabase.from("note").insert(note);

		if (error) {
			console.error("Error inserting note into the database:", error);
			return false;
		}

		console.log(`Note inserted successfully with status ${status}`);
		return true;
	} catch (error) {
		console.error("Unexpected error inserting note into the database:", error);
		throw error;
	}
}

export async function getRepoInfo(username: string, repositoryName: string): Promise<RepositoryType[] | false> {
	try {
		const { data, error } = await supabase.from("gitrepo").select("*").eq("git_username", username).eq("git_repository", repositoryName).eq("is_deleted", false);

		if (error) {
			console.error("Error fetching repository info from the database:", error);
			throw error;
		}

		if (!data || data.length === 0) {
			console.error("Repository info not found in the database.");
			return false;
		}

		console.log(`Repository info found for ${username}/${repositoryName}`);
		return data as RepositoryType[];
	} catch (error) {
		console.error("Unexpected error fetching repository info from the database:", error);
		throw error;
	}
}
