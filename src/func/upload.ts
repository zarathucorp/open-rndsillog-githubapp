import { BlobServiceClient, BlockBlobUploadStreamOptions } from "@azure/storage-blob";
import dotenv from "dotenv";
import * as fs from "fs";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";
import { Repository } from "@octokit/webhooks-types";

dotenv.config();

const connectionString = process.env.CONNECTION_STRING as string;
const containerName = process.env.CONTAINER_NAME as string;

if (!connectionString || !containerName) {
	console.error("Azure Blob Storage credentials are not set in environment variables.");
	process.exit(1);
}

export async function uploadPDFToBlobStorage(pdfPath: string, repositoryInfo: Repository): Promise<string> {
	const gitUsername = repositoryInfo.owner.login;
	const gitRepository = repositoryInfo.name;
	const uploadFilenameUUID = uuidv4();
	const uploadFilename = `${uploadFilenameUUID}.pdf`;

	try {
		if (path.extname(pdfPath).toLowerCase() !== ".pdf") {
			throw new Error("File must be a PDF");
		}

		const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
		const containerClient = blobServiceClient.getContainerClient(containerName);
		const blockBlobClient = containerClient.getBlockBlobClient(uploadFilename);

		const options: BlockBlobUploadStreamOptions = {
			blobHTTPHeaders: {
				blobContentType: "application/pdf",
			},
		};

		const stream = fs.createReadStream(pdfPath);
		const uploadBlobResponse = await blockBlobClient.uploadStream(stream, undefined, undefined, options);
		console.log(`Upload of blob ${pdfPath} successful, Request ID: ${uploadBlobResponse.requestId}`);

		const tags = {
			git_username: gitUsername,
			git_repositoryName: gitRepository,
		};

		try {
			const setTagsResponse = await blockBlobClient.setTags(tags);
			console.log("Tags set successfully:", setTagsResponse.requestId);
		} catch (error: any) {
			console.error(`Error setting tags on blob ${uploadFilename}`, error.message);
		}
	} catch (error: any) {
		console.error(`Error uploading PDF to Azure Blob Storage:\nFile path: ${pdfPath}`, error.message);
	}

	return uploadFilenameUUID;
}
