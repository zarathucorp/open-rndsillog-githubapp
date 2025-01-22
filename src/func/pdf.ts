import MarkdownPDF from "markdown-pdf";
import path from "path";
import * as fs from "fs";
import { uploadPDFToBlobStorage } from "./upload.js";
import { Repository } from "@octokit/webhooks-types";
import { addNote, getRepoInfo } from "../database/supabase.js";
import { NewNoteType } from "../types/NoteType.js";
import { RepositoryType } from "@/types/Repository.js";
import getCurrentDateTime from "../func/time.js";

type github_type = "Commit" | "PR" | "Issue";

export async function convertMarkdownToPDF(markdownContent: string, filename: string, repositoryInfo: Repository, eventType: github_type) {
	return;
	const __dirname = path.resolve();
	const pdfPath = path.join(__dirname, "pdf", `${filename}.pdf`);

	MarkdownPDF()
		.from.string(markdownContent)
		.to(pdfPath, async () => {
			try {
				const currentTime = getCurrentDateTime();
				const dbRepositoryInfo: RepositoryType[] | false = await getRepoInfo(repositoryInfo.owner.login, repositoryInfo.name);

				if (!dbRepositoryInfo) {
					deleteFile(pdfPath);
					return;
				}

				console.log(`Found ${dbRepositoryInfo.length} repository entries in the database.`);

				const promises = dbRepositoryInfo.map(async (repo: RepositoryType) => {
					try {
						const uploadedFilename = await uploadPDFToBlobStorage(pdfPath, repositoryInfo);
						const saveNoteInfo: NewNoteType = {
							id: uploadedFilename,
							user_id: repo.user_id,
							bucket_id: repo.bucket_id,
							title: `${currentTime}에 생성된 ${eventType} 노트(GitHub)`,
							file_name: `${currentTime}에 생성된 ${eventType} 노트(GitHub)`,
							is_github: true,
							github_type: eventType,
							github_link: repositoryInfo.url,
						};

						const dbUploadResult = await addNote(saveNoteInfo);
						if (!dbUploadResult) {
							throw new Error("Error adding note to database");
						}
					} catch (error) {
						console.error("Error processing repository entry:", error);
					}
				});

				// Wait for all the promises to resolve
				await Promise.allSettled(promises);

				// After all operations are complete, unlink the file
				deleteFile(pdfPath);
			} catch (error) {
				console.error("Unexpected error:", error);
				deleteFile(pdfPath);
				throw error;
			}
		});
}

function deleteFile(filePath: string) {
	fs.unlink(filePath, (err) => {
		if (err) {
			if (err.code === "ENOENT") {
				console.error(`File not found: ${filePath}`);
			} else {
				console.error(`Error deleting file: ${err.message}`);
			}
		}
	});
}
