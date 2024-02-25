<script>
	export let showDialog = false;

	/**
	 * @type {HTMLDialogElement}
	 */
	let dialog;

	$: if(dialog && showDialog) {
		dialog.showModal();
	} else if(dialog) {
		dialog.close();
	}
</script>

<dialog
	bind:this={dialog}
	on:close={() => (showDialog = false)}>
	<slot />
</dialog>

<style>
	dialog {
		background-color: rgba(29, 29, 29, 0.5);
		/* background-image: url($lib/images/noise.png); */
		/* background-size: contain; */
		backdrop-filter: blur(15px);
		padding: 10px;
		border: 2px solid rgba(46, 46, 46, 0.8);
		border-radius: 10px;
		color: white;
		animation: popIn 0.3s cubic-bezier(1,0,0,1);
	}

	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(5px);
	}

	@keyframes popIn {
		0% {
			transform: scale(0.3);
		}
		100% {
			transform: scale(1);
		}
	}
</style>