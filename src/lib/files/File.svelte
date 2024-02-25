<script>
	/**
	 * @type {{ isDir: boolean, filename: string, size: number, special?: string }}
	 */
	export let file;
	export let isDeleting = false;
	import folder from "$lib/images/file/folder.png";
	import updir from "$lib/images/file/updir.png";
	import iconFile from "$lib/images/file/file.png";
	import executable from "$lib/images/file/executable.png";
	import dataFile from "$lib/images/file/datafile.png";

	/**
     * @param {number} bytes
     */
	function bytesToHumanReadableString(bytes) {
		if(bytes == 0) {
			return "0 B";
		}
		// Get the base unit.
		const baseUnit = Math.pow(1024, 0);

		// Calculate the exponent.
		const exponent = Math.floor(Math.log(bytes) / Math.log(1024));

		// Get the unit name.
		const unit = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][exponent];

		// Calculate the normalized value.
		const normalizedValue = bytes / baseUnit ** exponent;

		// Return the human-readable string.
		return normalizedValue.toFixed() + " " + unit;
	}

	function fileIcon() {
		if(file.special == "updir") return updir;
		if(file.isDir) return folder;
		if(file.filename.endsWith(".py")) return executable;
		if(file.filename.endsWith(".csv")) return dataFile;
		return iconFile;
	}

	/**
     * @param {string} path
     */
	function basename(path) {
		return path.split("/").slice(-1)[0];
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="file {isDeleting ? "deleting" : ""}" on:click on:keypress>
	<h2>
		<img src={fileIcon()} alt="File/Folder">
		<span>{basename(file.filename)}</span>
	</h2>
	{#if !file.isDir}
		<span>
			{bytesToHumanReadableString(file.size)}
		</span>
	{/if}
</div>

<style>
	.file {
		display: flex;
		gap: 5px;
		align-items: center;
		flex-direction: column;
		border-radius: 15px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.file h2 {
		margin: 5px;
		display: flex;
		flex-direction: column;
		text-align: center;
		align-items: center;
	}

	.file h2 img {
		width: 100px;
		aspect-ratio: 1;
	}

	.file h2 span {
		text-overflow: ellipsis; max-width: 150px; word-break: break-all;
	}

	.file:hover {
		background-color: rgb(29, 29, 29, 0.8);
		backdrop-filter: blur(15px);
	}

	.file.deleting {
		animation: shake 0.7s infinite reverse;
	}

	@keyframes shake {
		0% { transform: rotate(0deg); }
		25% { transform: rotate(5deg); }
		50% { transform: rotate(-5deg); }
		75% { transform: rotate(5deg); }
		100% { transform: rotate(-5deg); }
	}
</style>