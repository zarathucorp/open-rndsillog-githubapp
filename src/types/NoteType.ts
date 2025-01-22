type BaseNoteType = {
	id: string;
	user_id: string;
	bucket_id: string;
	title: string;
	file_name: string;
	is_github: boolean;
	github_type: "Commit" | "PR" | "Issue";
	github_hash?: string;
	github_link?: string;
};

type NewNoteType = BaseNoteType & {};

export { BaseNoteType, NewNoteType };
