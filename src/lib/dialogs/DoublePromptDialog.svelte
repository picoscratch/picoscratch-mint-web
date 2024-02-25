<script>
	import Dialog from "./Dialog.svelte";

	// type prompt = (title: string, { placeholder, value, submit, cancel }?: { placeholder?: string | undefined; value?: string | undefined; submit?: string | undefined; cancel?: string | undefined; }) => Promise<string | null>;

	let title = "Prompt Dialog";
	
	let placeholder1 = "";
	let value1 = "";
	let type1 = "text";
	/**
	 * @type {HTMLInputElement}
	 */
	let input1;
	
	let placeholder2 = "";
	let value2 = "";
	let type2 = "text";
	/**
	 * @type {HTMLInputElement}
	 */
	let input2;

	let submit = "OK";
	let cancel = "Abbrechen";
	let showDialog = false;
	/**
	 * @type {(value: [string, string] | null) => void}
	 */
	let resolve;
	
	/**
	 * 
	 * @param {string} _title
	 * @param {
			placeholder1?: string,
			value1?: string,
			submit?: string,
			cancel?: string,
			type1?: "text" | "password",
			placeholder2?: string,
			value2?: string,
			type2?: "text" | "password"
		} options
		@returns {Promise<[string, string] | null>}
	 */
	export function prompt(
		_title,
		{ placeholder1: _placeholder1, value1: _value1, submit: _submit, cancel: _cancel, type1: _type1, placeholder2: _placeholder2, value2: _value2, type2: _type2 }
		= {placeholder1: "", value1: "", submit: "OK", cancel: "Abbrechen", type1: "text", placeholder2: "", value2: "", type2: "text"}) {
		return new Promise((res) => {
			if(!_placeholder1) _placeholder1 = "";
			if(!_value1) _value1 = "";
			if(!_submit) _submit = "OK";
			if(!_cancel) _cancel = "Abbrechen";
			if(!_type1) _type1 = "text";
			if(!_placeholder2) _placeholder2 = "";
			if(!_value2) _value2 = "";
			if(!_type2) _type2 = "text";
			title = _title;
			placeholder1 = _placeholder1;
			value1 = _value1;
			submit = _submit;
			cancel = _cancel;
			type1 = _type1;
			placeholder2 = _placeholder2;
			value2 = _value2;
			type2 = _type2;
			input1.value = "";
			input2.value = "";
			resolve = res;

			showDialog = true;
		})
	}

	function submitValue() {
		resolve([input1.value, input2.value]);
		showDialog = false;
	}

	function cancelSubmit() {
		resolve(null);
		showDialog = false;
	}
</script>

<Dialog {showDialog}>
	<div style="display: flex; align-items: center; flex-direction: column; gap: 10px;">
		<h2 style="margin: 0; font-size: 2rem; text-align: center;">{title}</h2>
		<input type={type1} placeholder={placeholder1} value={value1} bind:this={input1}>
		<input type={type2} placeholder={placeholder2} value={value2} bind:this={input2} on:keyup={(e) => {
			if(e.key == "Enter") submitValue();
		}}>
		<div style="display: flex; gap: 10px;">
			<button on:click={submitValue}>{submit}</button>
			<button on:click={cancelSubmit}>{cancel}</button>
		</div>
	</div>
</Dialog>