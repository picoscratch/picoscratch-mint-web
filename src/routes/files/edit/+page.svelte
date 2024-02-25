<script>
	import MonacoEditor from "$lib/MonacoEditor.svelte";
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import { bus } from "$lib/stores";
	import Spinner from "$lib/Spinner.svelte";
    import { goto } from "$app/navigation";

	const file = $page.url.searchParams.get("file") || "";
	/**
	 * @type {import("monaco-editor").editor.IStandaloneCodeEditor}
	 */
	let editor;
	let isLoading = true;
	let isSaving = false;
	let initialContent = "";

	/**
	 * @param {string} path
	 */
	function basename(path) {
		return path.split("/").slice(-1)[0];
	}

	onMount(() => {
		$bus.on("read_file", (/** @type {{ content: string; }} */ packet) => {
			// @ts-ignore
			initialContent = packet.content;
			isLoading = false;
		})
		$bus.on("write_file", () => {
			isSaving = false;
		})

		$bus.emit({type: "read_file", path: file});
	})
</script>

{#if !isLoading}
	<div style="display: flex; justify-content: right; gap: 10px; margin-bottom: 5px; align-items: center;">
		<h1 style="margin-right: auto; margin-top: 0; margin-bottom: 0;">{basename(file)}</h1>
		<button on:click={() => {
			const content = editor.getValue();
			$bus.emit({type: "write_file", path: file, content});
			isSaving = true;
		}}>
			{#if !isSaving}
				<svg width="40px" height="40px" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.75 3h-1A2.75 2.75 0 0 0 3 5.75v12.5A2.75 2.75 0 0 0 5.75 21H6v-6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 15v6h.25A2.75 2.75 0 0 0 21 18.25V8.286a3.25 3.25 0 0 0-.952-2.299l-2.035-2.035A3.25 3.25 0 0 0 15.75 3v4.5a2.25 2.25 0 0 1-2.25 2.25H9A2.25 2.25 0 0 1 6.75 7.5V3Z" fill="#ffffff"/><path d="M14.25 3v4.5a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75V3h6ZM16.5 21v-6a.75.75 0 0 0-.75-.75h-7.5a.75.75 0 0 0-.75.75v6h9Z" fill="#ffffff"/></svg>
			{:else}
				<Spinner />
			{/if}
		</button>
		<button on:click={() => {
			goto("/files");
		}} disabled={isSaving}>
			<svg width="40px" height="40px" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m4.21 4.387.083-.094a1 1 0 0 1 1.32-.083l.094.083L12 10.585l6.293-6.292a1 1 0 1 1 1.414 1.414L13.415 12l6.292 6.293a1 1 0 0 1 .083 1.32l-.083.094a1 1 0 0 1-1.32.083l-.094-.083L12 13.415l-6.293 6.292a1 1 0 0 1-1.414-1.414L10.585 12 4.293 5.707a1 1 0 0 1-.083-1.32l.083-.094-.083.094Z" fill="#ffffff"/></svg>
		</button>
	</div>
	<MonacoEditor
		options={{
			value: initialContent,
			language: "python",
			theme: "vs-dark",
			tabSize: 2,
			fontFamily: "Source Code Pro",
		}}
		bind:editor
	/>
{:else}
	<div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column;">
		<Spinner />
		<h2>Datei wird eingelesen...</h2>
	</div>
{/if}