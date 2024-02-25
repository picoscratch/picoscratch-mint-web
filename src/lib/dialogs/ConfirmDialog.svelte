<script>
	import Dialog from "./Dialog.svelte";

	// type confirm = (title: string, { placeholder, value, submit, cancel }?: { placeholder?: string | undefined; value?: string | undefined; submit?: string | undefined; cancel?: string | undefined; }) => Promise<string | null>;

	let title = "Confirm Dialog";
	let subtext = "";
	let confirmText = "OK";
	let cancel = "Abbrechen";
	let showDialog = false;
	/**
	 * @type {(value: boolean) => void}
	 */
	let resolve;

	/**
	 * 
	 * @param {string} _title The title for the dialog
	 * @param {
			subtext?: string,
			confirm?: string,
			cancel?: string,
		} options Optional options for the dialog
	 */
	export function confirm(
		_title,
		{ subtext: _subtext, confirm: _confirm, cancel: _cancel }
		= {subtext: "", confirm: "OK", cancel: "Abbrechen"}) {
		return new Promise((res) => {
			if(!_subtext) _subtext = "";
			if(!_confirm) _confirm = "OK";
			if(!_cancel) _cancel = "Abbrechen";
			title = _title;
			subtext = _subtext;
			confirmText = _confirm;
			cancel = _cancel;
			resolve = res;

			showDialog = true;
		})
	}

	function confirmAction() {
		resolve(true);
		showDialog = false;
	}

	function cancelAction() {
		resolve(false);
		showDialog = false;
	}
</script>

<Dialog {showDialog}>
	<div style="display: flex; align-items: center; flex-direction: column; gap: 10px;">
		<h2 style="margin: 0; font-size: 2rem; text-align: center;">{title}</h2>
		<span style="font-size: 1.3rem;">{subtext}</span>
		<div style="display: flex; gap: 10px;">
			<button on:click={confirmAction}>{confirmText}</button>
			<button on:click={cancelAction}>{cancel}</button>
		</div>
	</div>
</Dialog>