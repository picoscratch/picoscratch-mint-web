import { rmdir } from "fs/promises";

async function deleteDirectory(path) {
	try {
		await rmdir(path, { recursive: true });
		console.log(`Directory ${path} deleted successfully.`);
	} catch (error) {
		console.error(`Error deleting directory ${path}: ${error.message}`);
		console.log('Retrying after 3 seconds...');
		await wait(3000); // Wait for 3 seconds before retrying
		await deleteDirectory(path); // Retry recursively
	}
}

function wait(ms) {
	return new Promise(resolve => {
			setTimeout(resolve, ms);
	});
}

await deleteDirectory(".svelte-kit/types")
await deleteDirectory(".svelte-kit/output")
await deleteDirectory("build")