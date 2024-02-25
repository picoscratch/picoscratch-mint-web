<script>
	import File from "./File.svelte";
	import Spinner from "$lib/Spinner.svelte";
    import { bus } from "$lib/stores";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import PromptDialog from "$lib/dialogs/PromptDialog.svelte";
    import ConfirmDialog from "$lib/dialogs/ConfirmDialog.svelte";
	/**
     * @type {any[]}
     */
	let files = [];
	// let files = [{ isDir: true, filename: "somedir", size: 0 }, { isDir: false, filename: "aaa.py", size: 51645654357252 }, { isDir: false, filename: "aaa.csv", size: 765446788916454 }];

	export let root = "/";
	let currentDir = "/";
	let state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	let loading = true;
	/**
     * @type {any}
     */
	let prompt;
	/**
     * @type {any}
     */
	let confirm;
	let isDeleting = false;

	/**
     * @param {string[]} paths
     */
	function joinPaths(...paths) {
		return paths.join("/").replace(/\/+/g, "/");
	}

	/**
     * @param {string} dir
     */
	async function navigate(dir) {
		loading = true;
		currentDir = joinPaths(root, dir).replaceAll("//", "/");
		// window.electron.send("listFiles", currentDir, state);
		await $bus.emit({type: "list_files", path: currentDir});
	}

	async function navigateUp() {
		loading = true;
		currentDir = currentDir.split("/").slice(0, -1).join("/");
		// window.electron.send("listFiles", currentDir, state);
		await $bus.emit({type: "list_files", path: currentDir});
	}

	onMount(async () => {
		$bus.on("list_files", (/** @type {{ files: any[]; }} */ packet) => {
			files = packet.files;
			loading = false;
		})

		await navigate("");

		if(root != "/") {
			await navigateUp();
		}
	})

	// window.electron.onMessage("listFiles", (/** @type {string} */ _files, /** @type {string} */ _state) => {
	// 	if(_state != state) return;
	// 	files = JSON.parse(_files);
	// 	loading = false;
	// });

	/**
     * @param {string} path
     */
	function basename(path) {
		return path.split("/").slice(-1)[0];
	}

	/**
     * @param {{ isDir: any; filename: string; }} file
     */
	async function handleFileClick(file) {
		if(isDeleting) {
			if(await confirm("Datei löschen", { subtext: `Soll die Datei ${basename(file.filename)} wirklich gelöscht werden?`, confirm: "Ja", cancel: "Nein" })) {
				loading = true;
				// window.electron.send("deleteFile", file.filename);
				await $bus.emit({type: "delete_file", path: file.filename});
				await new Promise((resolve) => setTimeout(resolve, 200));
				await $bus.emit({type: "list_files", path: currentDir});
			}
			isDeleting = false;
			return;
		}
		if(file.isDir) {
			navigate(file.filename.replace(root, ""));
			return;
		}
		if(file.filename.endsWith(".py")) {
			goto("/files/edit/?file=" + encodeURIComponent(file.filename));
			return;
		} else if(file.filename.endsWith(".csv")) {
			goto("/files/view/?file=" + encodeURIComponent(file.filename));
			return;
		}
		// if(file.filename.endsWith(".csv")) {
		// 	window.location.href = "/graph?file=" + encodeURIComponent(file.filename);
		// }
	}
</script>

<PromptDialog bind:prompt />
<ConfirmDialog bind:confirm />

<!-- {JSON.stringify(files)} -->

<div class="menu">
	<span class="current">{(root == "/" ? "/" : "") + currentDir.replace(root, "").replace("//", "/") || "/"}</span>
	<button on:click={async () => {
		const name = await prompt("Neues Pythonscript erstellen", {
			placeholder: "Dateiname"
		});
		if(name) {
			await $bus.emit({type: "write_file", path: joinPaths(currentDir, name + ".py"), content: ""});
			loading = true;
			await $bus.emit({type: "list_files", path: currentDir});
		}
	}}>
		<svg width="40px" height="40px" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v6a2 2 0 0 0 2 2h6v10a2 2 0 0 1-2 2h-6.81A6.5 6.5 0 0 0 4 11.498V4a2 2 0 0 1 2-2h6Z" fill="#ffffff"/><path d="M13.5 2.5V8a.5.5 0 0 0 .5.5h5.5l-6-6ZM12 17.5a5.5 5.5 0 1 0-11 0 5.5 5.5 0 0 0 11 0ZM7 18l.001 2.503a.5.5 0 1 1-1 0V18H3.496a.5.5 0 0 1 0-1H6v-2.5a.5.5 0 1 1 1 0V17h2.497a.5.5 0 0 1 0 1H7Z" fill="#ffffff"/></svg>
	</button>
	<button on:click={() => {
		isDeleting = !isDeleting;
	}}>
		<svg width="40px" height="40px" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21.5 6a1 1 0 0 1-.883.993L20.5 7h-.845l-1.231 12.52A2.75 2.75 0 0 1 15.687 22H8.313a2.75 2.75 0 0 1-2.737-2.48L4.345 7H3.5a1 1 0 0 1 0-2h5a3.5 3.5 0 1 1 7 0h5a1 1 0 0 1 1 1Zm-7.25 3.25a.75.75 0 0 0-.743.648L13.5 10v7l.007.102a.75.75 0 0 0 1.486 0L15 17v-7l-.007-.102a.75.75 0 0 0-.743-.648Zm-4.5 0a.75.75 0 0 0-.743.648L9 10v7l.007.102a.75.75 0 0 0 1.486 0L10.5 17v-7l-.007-.102a.75.75 0 0 0-.743-.648ZM12 3.5A1.5 1.5 0 0 0 10.5 5h3A1.5 1.5 0 0 0 12 3.5Z" fill="#ffffff"/></svg>
	</button>
	<button on:click={() => {
		loading = true;
		// window.electron.send("listFiles", currentDir, state);
		$bus.emit({type: "list_files", path: currentDir});
	}}>
		<svg width="40px" height="40px" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 4.75a7.25 7.25 0 1 1-7.201 6.406C4.867 10.568 4.44 10 3.849 10c-.515 0-.968.358-1.03.87A9.25 9.25 0 1 0 6.25 4.754V4.25a1 1 0 0 0-2.001 0v2.698A9.322 9.322 0 0 0 4.216 7h.034v.25a1 1 0 0 0 1 1h3a1 1 0 0 0 0-2h-.666A7.219 7.219 0 0 1 12 4.75Z" fill="#ffffff"/></svg>
	</button>
	<!-- <svg on:click={() => {

	}} on:keypress width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.5 11a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Zm0 2-.09.007a.5.5 0 0 0-.402.402L17 13.5V16L14.498 16l-.09.008a.5.5 0 0 0-.402.402l-.008.09.008.09a.5.5 0 0 0 .402.402l.09.008H17v2.503l.008.09a.5.5 0 0 0 .402.402l.09.008.09-.008a.5.5 0 0 0 .402-.402l.008-.09V17l2.504.001.09-.008a.5.5 0 0 0 .402-.402l.008-.09-.008-.09a.5.5 0 0 0-.403-.402l-.09-.008H18v-2.5l-.008-.09a.5.5 0 0 0-.402-.403L17.5 13Zm2.25-6.5a2.25 2.25 0 0 1 2.229 1.938l.016.158.005.154v3.06A6.5 6.5 0 0 0 12.023 20H4.25a2.25 2.25 0 0 1-2.245-2.096L2 17.75v-7.251l6.207.001.196-.009a2.25 2.25 0 0 0 1.088-.393l.156-.12L13.821 6.5h5.929ZM8.207 4c.46 0 .908.141 1.284.402l.156.12 2.103 1.751-3.063 2.553-.085.061a.75.75 0 0 1-.29.106L8.206 9 2 8.999V6.25a2.25 2.25 0 0 1 2.096-2.245L4.25 4h3.957Z" fill="#ffffff"/></svg> -->
</div>
{#if !loading}
	<div class="files">
		{#if !(currentDir == root || (currentDir == "" && root == "/"))}
			<File file={{ isDir: true, filename: "..", special: "updir", size: 0 }} on:click={() => {
				navigateUp();
			}} on:keypress={() => {
				navigateUp();
			}} />
		{/if}
		{#each files as file}
			<File {file} bind:isDeleting on:click={() => {
				handleFileClick(file);
			}} on:keypress={() => {
				handleFileClick(file);
			}} />
		{/each}
	</div>
{:else}
	<div class="loading">
		<Spinner />
	</div>
{/if}

<style>
	.files {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
	}

	.menu {
		display: flex;
		gap: 5px;
		margin-bottom: 10px;
	}

	.current {
		font-size: 1.3em;
		background-color: rgb(29, 29, 29, 0.5);
		border: #2e2e2e 2px solid;
		padding: 10px;
		border-radius: 10px;
		width: calc(100% - 20px);
		display: inline-block;
	}

	.menu svg {
		width: 40px !important;
		height: 40px !important;
		cursor: pointer;
	}

	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>