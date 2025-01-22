import { UUID } from "crypto";

type RepositoryType = {
	id: UUID;
	bucket_id: UUID;
	repo_url: string;
	user_id: UUID;
	git_username: string;
	git_repository: string;
};

export { RepositoryType };
