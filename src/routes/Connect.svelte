<script>
	import Card from "$lib/Card.svelte";
	import Spinner from "$lib/Spinner.svelte";
	import { WebSocketPacketBus, WebUSBPacketBus } from "$lib/connection/PacketBus";
	import { busType, bus, connection, devices, serial as serialStore, selectedDevices, chartsData, sensorInfo } from "$lib/stores";
	import USBIcon from "svelte-fluentui-icons/icons/USBPlug_Filled.svelte";
	import WifiIcon from "svelte-fluentui-icons/icons/WiFi1_Filled.svelte";
	import PlusIcon from "svelte-fluentui-icons/icons/Add_Filled.svelte";
	import { toast } from "svelte-sonner";
	import MintImage from "$lib/images/mint.png";
	import Dialog from "$lib/dialogs/Dialog.svelte";
	import { onMount } from "svelte";

	let typeCardVisible = true;
	let usbCardVisible = false;
	let netCardVisible = false;

	async function connectOverUSB() {
		$selectedDevices = ["unknown"];
		// @ts-ignore
		$chartsData = {};
		for(const sensor of Object.keys(sensorInfo)) {
			// @ts-ignore
			$chartsData[sensor] = {
				datasets: [{
					data: [],
					borderWidth: 1
				}]
			};
		}

		if(!WebUSBPacketBus.supported()) {
			toast.error("Ihr Browser unterstützt die WebSerial-API nicht, welche für die Verbindung mit dem Messgerät über USB benötigt wird. Bitte verwenden Sie einen anderen Webbrowser.");
			return;
		}
		typeCardVisible = false;
		usbCardVisible = true;
		$busType = "usb";
		$bus = new WebUSBPacketBus();
		// @ts-ignore
		await $bus.init(() => {
			$connection = true;
		}, () => {
			reset();
		});

		/**
		 * @param packet {SensorPacket}
		 */
		function getSerial(packet) {
			$bus.off("sensor", getSerial);
			$selectedDevices = [packet.serial];
		}
		$bus.on("sensor", getSerial)
		// @ts-ignore
		window.bus = $bus;
	}

	async function connectOverNetwork() {
		// toast.warning("Diese Funktion ist noch nicht verfügbar.");
		typeCardVisible = false;
		netCardVisible = true;
	}

	/**
     * @param {string} serial
     */
	function connectToDevice(serial) {
		$selectedDevices = [serial];
		// @ts-ignore
		$chartsData = {};
		for(const sensor of Object.keys(sensorInfo)) {
			// @ts-ignore
			$chartsData[sensor] = {
				datasets: [{
					data: [],
					borderWidth: 1
				}]
			};
		}
		try {
			const websocket = new WebSocket("wss://mintsrv.picoscratch.de");
			websocket.addEventListener("message", console.log);
			$bus = new WebSocketPacketBus(websocket);
			$bus.on("error", (/** @type {{ error: number; }} */ error) => {
				if(error.error && error.error == 1) {
					toast.error("Es konnte keine Verbindung mit dem Messgerät hergestellt werden. Bitte stellen Sie sicher, dass das Messgerät eingeschaltet ist und sich im Netzwerkmodus befindet.");
					reset();
					return;
				}
			});
			$connection = true;
			$busType = "wifi";
			$serialStore = serial;
			typeCardVisible = false;
			// @ts-ignore
			window.bus = $bus;
			websocket.addEventListener("open", () => {
				websocket.send(JSON.stringify({
					type: "serial",
					serial
				}));
			});
			websocket.addEventListener("close", () => {
				toast.error("Verbindung zum Messgerät wurde unterbrochen.");
				reset();
			});
		} catch(e) {
			console.error(e);
			toast.error("Es konnte keine Verbindung mit unserem Server hergestellt werden. Bitte versuchen Sie es später erneut.");
			reset();
			return;
		}
	}

	function connectToDevices() {
		// @ts-ignore
		$chartsData = {};
		for(const sensor of Object.keys(sensorInfo)) {
			// @ts-ignore
			$chartsData[sensor] = {
				datasets: []
			};

			for(const serial of $selectedDevices) {
				// @ts-ignore
				$chartsData[sensor].datasets.push({
					data: [],
					borderWidth: 1
				});
			}
		}

		try {
			const websocket = new WebSocket("wss://mintsrv.picoscratch.de");
			websocket.addEventListener("message", console.log);
			$bus = new WebSocketPacketBus(websocket);
			$bus.on("error", (/** @type {{ error: number; }} */ error) => {
				if(error.error && error.error == 1) {
					toast.error("Es konnte keine Verbindung mit einem oder mehreren Messgeräten hergestellt werden. Bitte stellen Sie sicher, dass ALLE Messgeräte eingeschaltet sind und sich im Netzwerkmodus befinden.");
					reset();
					return;
				}
			});
			$connection = true;
			$busType = "wifi";
			$serialStore = "multi";
			typeCardVisible = false;
			// @ts-ignore
			window.bus = $bus;
			websocket.addEventListener("open", () => {
				for(const serial of $selectedDevices) {
					websocket.send(JSON.stringify({
						type: "serial",
						serial
					}));
				}
			});
			websocket.addEventListener("close", () => {
				toast.error("Verbindung zu einem oder mehrerer Messgeräte wurde unterbrochen.");
				reset();
			});
		} catch(e) {
			console.error(e);
			toast.error("Es konnte keine Verbindung mit unserem Server hergestellt werden. Bitte versuchen Sie es später erneut.");
			reset();
			return;
		}
	}

	function reset() {
		$connection = false;
		$busType = "";
		typeCardVisible = true;
		usbCardVisible = false;
		netCardVisible = false;
	}

	let showNewDeviceDialog = false;
	/**
     * @type {HTMLCanvasElement}
     */
	let canvas;
	let newDeviceName = "";
	let newDeviceSN = "";
	let useMulti = false;

	function addDevice() {
		if(newDeviceName === "" || newDeviceSN === "") {
			alert("Bitte füllen Sie alle Felder aus.");
			return;
		}
		$devices.push({
			name: newDeviceName,
			serial: newDeviceSN
		})
		$devices = $devices;
		showNewDeviceDialog = false;
	}

	onMount(() => {
		// Print the text "not available" to the canvas
		const ctx = canvas.getContext("2d");
		if(!ctx) return;
		// Fill black
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.font = "30px Arial";
		ctx.fillStyle = "white";
		const text = "QR-Scan ist noch nicht verfügbar";
		// Draw the text in the middle of the canvas
		const x = (canvas.width / 2) - (ctx.measureText(text).width / 2);
		const y = (canvas.height / 2) - 15;
		ctx.fillText(text, x, y);
	})

	onMount(() => {
		const params = new URLSearchParams(location.search);
		if(params.has("serial")) {
			// @ts-ignore
			connectToDevice(params.get("serial"));
			params.delete("serial");
			// Remove all parameters from the URL without reloading the page
			history.replaceState(null, "", location.pathname);
		}
	})
</script>

<Dialog bind:showDialog={showNewDeviceDialog}>
	<h2>Neues Gerät hinzufügen</h2>
	<div style="display: flex; flex-direction: column; align-items: center; gap: 15px; margin-bottom: 10px;">
		<input type="text" placeholder="Name des Geräts" bind:value={newDeviceName}>
		<canvas id="qr-canvas" bind:this={canvas} width=500 height=500 style="border-radius: 15px;"></canvas>
		<input type="text" placeholder="Seriennummer" bind:value={newDeviceSN}>
	</div>
	<div class="buttons">
		<button class="btn-primary" on:click={addDevice}>Fertig</button>
	</div>
</Dialog>

<div class="wrapper">
	<Card style="width: auto; display: {typeCardVisible ? "block" : "none"}">
		<h2>Verbindung mit Messgerät herstellen</h2>
		<div class="buttons">
			<button on:click={connectOverUSB}>
				<USBIcon size=100 />
				<span>über USB</span>
			</button>
			<button on:click={connectOverNetwork}>
				<WifiIcon size=100 />
				<span>über WLAN</span>
			</button>
		</div>
	</Card>
	<Card style="width: auto; text-align: center; display: {usbCardVisible ? "block" : "none"};" >
		<h2>Verbindung wird hergestellt...</h2>
		<div style="display: flex;flex-direction: column; align-items: center;">
			<Spinner />
			<ul>
				<li>Verbinden Sie Ihr Messgerät über ein USB-C-fähiges Kabel mit Ihrem Computer</li>
				<li>Wählen Sie das Messgerät in der oben angezeigten Liste an</li>
			</ul>
			<br><br>
			<span>Geht nicht? Stellen Sie sicher dass Ihr Kabel Datenübertragung unterstützt.</span>
		</div>
	</Card>
	<Card style="width: auto; text-align: center; display: {netCardVisible ? "block" : "none"};" >
		<h2>WLAN-Verbindung herstellen</h2>
		<div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap; justify-content: center;">
			{#each $devices as device}
				<Card style="width: auto;">
					<img src={MintImage} alt="PicoScratch MINT-Messgerät" width="200em">
					<h2>{device.name}</h2>
					<span style="color: #acacac;">{device.serial}</span>
					<button class={useMulti ? ($selectedDevices.includes(device.serial) ? "btn-primary" : "") : "btn-primary"} style="margin-top: 5px; margin-left: auto; margin-right: auto;" on:click={() => {
						if(useMulti) {
							if($selectedDevices.includes(device.serial)) {
								$selectedDevices = $selectedDevices.filter((serial) => serial !== device.serial);
							} else {
								$selectedDevices = [...$selectedDevices, device.serial];
							}
						} else connectToDevice(device.serial);
					}}>{useMulti ? ($selectedDevices.includes(device.serial) ? "Abwählen" : "Auswählen") : "Verbinden"}</button>
				</Card>
			{/each}
			<Card style="width: auto; height: calc(355px - 24px); display: flex; justify-content: center; flex-direction: column;">
				<button on:click={() => { showNewDeviceDialog = true; }}>
					<PlusIcon size=200 />
					<h2>Neu</h2>
				</button>
			</Card>
		</div>
		<hr style="border: 2px #3e3e3e solid; border-radius: 10px;">
		<div class="buttons">
			<button on:click={() => {
				useMulti = !useMulti;
			}}>
				{useMulti ? "Einzelndes Gerät verbinden" : "Mehrere Geräte verbinden"}
			</button>
			{#if useMulti}
				<button class="btn-primary" on:click={() => {
					connectToDevices();
				}}>Verbinden</button>
			{/if}
		</div>
	</Card>
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
	}

	h2 {
		margin: 5px;
		font-size: 2.4rem;
	}

	.buttons {
		display: flex;
		gap: 10px;
		justify-content: center;
	}

	button {
		display: flex;
		flex-direction: column;
		gap: 5px;
		height: auto;
		align-items: center;
	}
</style>