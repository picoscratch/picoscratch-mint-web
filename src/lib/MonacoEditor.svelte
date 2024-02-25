<script>
	import { onMount } from "svelte";
	import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
	import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
	import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
	import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
	import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

	export let options = {
		value: `print("Hello, World!")`,
		language: "python",
		theme: "vs-dark",
		tabSize: 2,
		fontFamily: "Source Code Pro",
	};

	/**
	 * @type {HTMLDivElement}
	 */
	let divEditor;
	/**
	 * @type {import("monaco-editor").editor.IStandaloneCodeEditor}
	 */
	export let editor;
	let Monaco;

	// @ts-ignore
	onMount(async () => {
		self.MonacoEnvironment = {
			getWorker: (_moduleId, label) => {
				if (label === "json") {
					return new jsonWorker();
				}
				if (label === "css" || label === "scss" || label === "less") {
					return new cssWorker();
				}
				if (label === "html" || label === "handlebars" || label === "razor") {
					return new htmlWorker();
				}
				if (label === "typescript" || label === "javascript") {
					return new tsWorker();
				}
				return new editorWorker();
			}
		};


		Monaco = await import("monaco-editor");
		editor = Monaco.editor.create(divEditor, options);
		// Get the text from the editor
		const text = editor.getValue();
		editor.setValue

		return () => {
			editor.dispose();
		};
	})
</script>

<div bind:this={divEditor} style="height: 100%; border-radius: 10px; overflow: hidden;"></div>