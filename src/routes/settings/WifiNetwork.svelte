<script>
	import Wifi1Icon from "svelte-fluentui-icons/icons/WiFi1_Filled.svelte";
	import Wifi2Icon from "svelte-fluentui-icons/icons/WiFi2_Filled.svelte";
	import Wifi3Icon from "svelte-fluentui-icons/icons/WiFi3_Filled.svelte";
	import Wifi4Icon from "svelte-fluentui-icons/icons/WiFi4_Filled.svelte";

	/**
     * @type {string}
     */
	export let name;
	/**
     * @type {string}
     */
	export let strength;
	/**
     * @type {string}
     */
	export let status;
	
	function getIcon() {
		switch (parseInt(strength)) {
			case 1:
				return Wifi1Icon;
			case 2:
				return Wifi2Icon;
			case 3:
				return Wifi3Icon;
			case 4:
				return Wifi4Icon;
			default:
				return Wifi1Icon;
		}
	}

	function getStatus() {
		switch (parseInt(status)) {
			case 0:
				return "";
			case 1:
				return "Gespeichert";
			case 2:
				return "Verbunden";
			default:
				return "";
		}
	}

	$: icon = getIcon();
</script>

<div class="net">
	<!-- <Wifi1Icon size="50" /> -->
	<svelte:component this={icon} size="50" />
	<div class="info">
		<span>{name}</span>
		<span id="status">{getStatus()}</span>
	</div>
</div>

<style>
	.net {
		display: flex;
		gap: 5px;
		align-items: center;
	}

	.net span {
		margin: 0;
		font-size: 1.3em;
	}

	.info {
		display: flex;
		flex-direction: column;
		gap: 0px;
	}

	#status {
		font-size: 1em;
		color: #acacac;
	}
</style>