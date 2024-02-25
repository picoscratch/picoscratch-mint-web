<script>
	import logo from '$lib/images/picoscratch-large.png';
  import NavIcon from "svelte-fluentui-icons/icons/Navigation_Filled.svelte";
	import { busType, serial } from './stores';

	$: devType = $busType == "usb" ? "USB (keine Seriennummer)" : $busType == "wifi" ? "WLAN (" + $serial + ")" : "";
</script>

<header>
	<div class="corner" style="display: flex; gap: 10px;">
		<img src={logo} alt="PicoScratch" />
	</div>

	<div id="user">
		<h3>{devType}</h3>
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;

		view-transition-name: header;
	}

	#user {
		text-align: right;
		margin: 5px;
	}

	#user h3 {
		margin-top: 10px;
		margin: 0;
		font-size: 1.5em;
	}

	.corner {
		width: 3em;
		/* height: 3em; */
		margin: 5px;
	}

	.corner img {
		width: 14em;
		border-radius: 10px;
		object-fit: contain;
	}
</style>
