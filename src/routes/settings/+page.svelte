<script>
	import Card from "$lib/Card.svelte";
	import WifiIcon from "svelte-fluentui-icons/icons/WiFi1_Filled.svelte";
	import ResetIcon from "svelte-fluentui-icons/icons/ArrowReset_Filled.svelte";
	import WifiNetwork from "./WifiNetwork.svelte";
	import { bus } from "$lib/stores";
	import Spinner from "$lib/Spinner.svelte";
    import { toast } from "svelte-sonner";

	/**
     * @param {number} rssi
     */
	function convertRSSIToStrength(rssi) {
    if (rssi >= -50) {
        return 1; // Strongest signal
    } else if (rssi >= -60) {
        return 2; // Good signal
    } else if (rssi >= -70) {
        return 3; // Weak signal
    } else {
        return 4; // Weakest signal
    }
	}

	function scanNetworks() {
		return new Promise((resolve, reject) => {
			let id = toast.loading("Es wird nach WLAN-Netzwerken gesucht...", { duration: Number.POSITIVE_INFINITY });
			$bus.emit({"type": "scan_networks"});
			$bus.on("scan_networks", (/** @type {{ networks: {ssid: string; rssi: number; security: number;}; current: { ssid: string; }; }} */ packet) => {
				resolve(packet);
				toast.dismiss(id);
			});
		});
	}
</script>

<div class="settings">
	<Card style="width: calc(100% - 24px - 15px);">
		<div class="setting">
			<WifiIcon size="50" />
			<h2>WLAN</h2>
		</div>
		<span class="setting-desc">Das Messgerät mit einem WLAN-Netzwerk verbinden</span>
		<hr>
		<div id="networks">
			<!-- <WifiNetwork name="Eckh" strength=1 status=2 />
			<WifiNetwork name="Eckh-IoT" strength=2 status=1 />
			<WifiNetwork name="Eckh-gast" strength=3 status=0 /> -->
			<!-- status 2 is connected, 1 is saved, 0 is nothing -->
			{#await scanNetworks()}
				<Spinner />
			{:then packet}
				{#each packet.networks.sort((/** @type {{ rssi: any; }} */ a, /** @type {{ rssi: any; }} */ b) => a.rssi - b.rssi).reverse() as network}
					<WifiNetwork name={network.ssid + " (" + network.rssi + ")"} strength={convertRSSIToStrength(network.rssi) + ""} status={"" + (packet.current.ssid == network.ssid ? 2 : 0)} />
				{/each}
			{:catch error}
				<p>Es ist ein Fehler aufgetreten: {error.message}</p>
			{/await}
		</div>
	</Card>
	<Card style="width: calc(100% - 24px - 15px); display: flex; flex-direction: column; gap: 5px;">
		<div class="setting">
			<ResetIcon size="50" />
			<h2>Auf Werkseinstellungen zurücksetzen</h2>
		</div>
		<span class="setting-desc">Alle Einstellungen werden zurückgesetzt</span><br>
		<span class="setting-note">Dies kann nicht rückgangig gemacht werden</span><br>
		<button style="margin-left: auto;">Zurücksetzen</button>
	</Card>
</div>

<style>
	.setting {
		display: flex;
		gap: 5px;
		align-items: center;
	}

	.setting h2 {
		margin: 0;
		font-size: 1.7em;
	}

	.settings {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	hr {
		border-color: #2e2e2e;
		border-width: 2px;
		border-style: dashed;
	}

	#networks {
		display: flex;
		gap: 5px;
		flex-direction: column;
	}

	.setting-desc,
	.setting-note {
		font-size: 1.4rem;
	}

	.setting-note {
		color: #acacac;
	}
</style>