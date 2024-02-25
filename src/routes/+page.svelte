<script>
	// @ts-nocheck
	import { WebUSBPacketBus } from "$lib/connection/PacketBus.js";
	import { onMount } from "svelte";
	import { Line } from "svelte-chartjs";
	import "chart.js/auto";
	import { Chart } from "chart.js";
	import "chartjs-adapter-moment";
	import ChartStreaming from "@robloche/chartjs-plugin-streaming";
	import { bus, chartData, chartsData } from "$lib/stores";
	import Card from "$lib/Card.svelte";
	import { toast } from "svelte-sonner";
	import { dndzone } from "svelte-dnd-action";
	import { flip } from "svelte/animate";
	import PauseIcon from "svelte-fluentui-icons/icons/PauseCircle_Filled.svelte";
	import PlayIcon from "svelte-fluentui-icons/icons/PlayCircle_Filled.svelte";
	import TableIcon from "svelte-fluentui-icons/icons/DocumentTable_Filled.svelte"

	Chart.register(ChartStreaming);

	Chart.defaults.set("plugins.streaming", {
		duration: 20000
	});
	Chart.defaults.color = "#fff";

	/**
	 * @type {SensorPacket[]}
	 */
	let allData = [];
	/**
	 * @type {SensorPacket[]}
	 */
	let dataQueue = [];
	/**
	 * @type {SensorPacket}
	 */
	let currentSensorData;
	/**
	 * @type {{[key: string]: {min: number, max: number, unit: string}}}
	 */
	const sensorInfo = {
		temp: {
			min: 0,
			max: 50,
			unit: "°C",
			friendlyName: "Temperatur"
		},
		tds: {
			min: 0,
			max: 200,
			unit: "ppm",
			friendlyName: "Wasserqualität"
		},
		co2: {
			min: 0,
			max: 2000,
			unit: "ppm",
			friendlyName: "CO<sub>2</sub>"
		},
		ph: {
			min: 0,
			max: 14,
			unit: "pH",
			friendlyName: "pH"
		}
	};
	let noDataCounter = 0;
	/**
     * @type {any}
     */
	let noDataToast = null;
	let paused = false;
	/**
	 * @type {SensorPacket}
	 */
	let beforePause;

	/**
	 * @param chart {Chart}
	 */
	async function refreshData(chart) {
		if(dataQueue.length > 0) {
			noDataCounter = 0;
			if(noDataToast) toast.dismiss(noDataToast);
			let d = dataQueue.shift();
			if(!d) return;
			chart.data.datasets[0].data.push({x: Date.now(), y: d.temp});
			chart.data.datasets[1].data.push({x: Date.now(), y: d.ppm});
			chart.data.datasets[2].data.push({x: Date.now(), y: d.co2});

			chart.data = chart.data;
		} else {
			noDataCounter++;
			if(noDataCounter == 10) {
				noDataToast = toast.info("USB-Modus einschalten", {description: "Es werden keine Daten empfangen. Schalten Sie im Menu den USB-Modus ein.", duration: Number.POSITIVE_INFINITY});
			}
		}
	}

	onMount(() => {
		$bus.on("sensor", (/** @type {SensorPacket} */ data) => {
			allData.push({time: new Date(), ...data});
			dataQueue.push(data);
			currentSensorData = data;
			items = items;
		});
	});

	let items = [{
		id: 1,
		sensor: "temp",
		type: "bar"
	}, {
		id: 2,
		sensor: "tds",
		type: "bar"
	}, {
		id: 3,
		sensor: "co2",
		type: "chart"
	}, {
		id: 4,
		sensor: "ph",
		type: "bar"
	}];
	const flipDurationMs = 300;

	// Move non-available sensors to the end
	$: {
		items = items.sort((a, b) => {
			if(sensorAvailability(a.sensor) && !sensorAvailability(b.sensor)) return -1;
			if(!sensorAvailability(a.sensor) && sensorAvailability(b.sensor)) return 1;
			return 0;
		});
	}

	/**
     * @param {{ detail: { items: any; }; }} e
     */
	function handleDndConsider(e) {
		items = e.detail.items;
	}
	/**
     * @param {{ detail: { items: any; }; }} e
     */
	function handleDndFinalize(e) {
		items = e.detail.items;
	}

	/**
     * @param {number} min
     * @param {number} max
     * @param {number} value
     */
	function minMaxToPercent(min, max, value) {
		return (value - min) / (max - min) * 100;
	}

	function sensorProgress(sensor) {
		const sensorData = paused ? beforePause : currentSensorData;
		return minMaxToPercent(sensorInfo[sensor].min, sensorInfo[sensor].max, sensorData ? sensorData[sensor] : 0);
	}

	function getSensorValueAsText(sensor) {
		const sensorData = paused ? beforePause : currentSensorData;
		if(!sensorData) return "";
		if(sensorData[sensor] == null) return "";
		console.log(sensorData[sensor] + " " + sensorInfo[sensor].unit);
		return sensorData[sensor] + " " + sensorInfo[sensor].unit;
	}

	function sensorAvailability(sensor) {
		const sensorData = paused ? beforePause : currentSensorData;
		return sensorData && sensorData[sensor] != null;
	}

	function anySensorAvailable(sensorData) {
		return items.some(i => sensorAvailability(i.sensor));
	}

	function pause() {
		beforePause = currentSensorData;
		paused = true;
	}

	function saveCSV() {
		let csv = "data:text/csv;charset=utf-8,";
		csv += "Zeit,Temperatur,Wasserqualität,CO2\n";
		for(let i = 0; i < allData.length; i++) {
			const d = allData[i];
			csv += `${d.time.toLocaleTimeString("de-DE")},${d.temp},${d.ppm},${d.co2}\n`;
		}
		const encodedUri = encodeURI(csv);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", "data.csv");
		document.body.appendChild(link);
		link.click();
	}

	const phscale = ["CC2828", "CC4628", "CC6328", "CC8128", "CC9528", "CCBC28", "71CC28", "249028", "28CC74", "28CCC3", "287ECC", "2843CC", "4428B4", "3E1F97", "321979"];

	function floatToPhColor(ph) {
		const index = Math.floor(ph);
		if(index < 0) return phscale[0];
		if(index > 14) return phscale[14];
		return phscale[index];
	}
</script>

<div class="actions" style="margin-left: auto; margin-right: 15px; margin-bottom: 10px;">
	<button on:click={saveCSV}>
		<TableIcon size=50 />
	</button>
	{#if paused}
		<button on:click={() => paused = false}>
			<PlayIcon size=50 />
		</button>
	{:else}
		<button on:click={() => pause()}>
			<PauseIcon size=50 />
		</button>
	{/if}
</div>
{#if anySensorAvailable(currentSensorData)}
	<div class="cards" use:dndzone={{items, flipDurationMs, dropTargetStyle: {outline: "none"}}} on:consider={handleDndConsider} on:finalize={handleDndFinalize}>
		{#each items as item(item.id)}
			<div class="card" animate:flip={{duration: flipDurationMs}} style="width: 30rem;">
				<Card style="width: calc(100% - 24px); transition: opacity 200ms ease-in-out; {!sensorAvailability(item.sensor) ? "opacity: 0;" : ""}">
					<h2>
						<!-- svelte-ignore a11y-missing-attribute -->
						<a on:dblclick={() => {
							item.type = item.type == "bar" ? "chart" : "bar";
						}} role="button" tabindex=0>
							{@html sensorInfo[item.sensor].friendlyName}
						</a>
					</h2>
					{#if sensorAvailability(item.sensor)}
						{#if item.type == "bar"}
							<div class="bar" style="height: 20px; width: 100%; background-color: #3e3e3e; border-radius: 10px; overflow: hidden;">
								<div class="inner-bar" style="height: 100%; width: {sensorProgress(item.sensor)}%; background-color: {item.sensor != "ph" ? "rgba(101, 85, 221)" : "#" + floatToPhColor(currentSensorData["ph"])}; text-align: right; font-weight: bold;">
									<span style="margin-right: 10px;">
										{getSensorValueAsText(item.sensor)}
									</span>
								</div>
							</div>
						{:else if item.type == "chart"}
							<Line data={$chartsData[item.sensor]} options={{
								scales: {
									x: {
										type: 'realtime',
										realtime: {
											delay: 2000,
											onRefresh: (chart) => {
												console.log(chart.data.datasets);
												chart.data.datasets[0].data.push({x: Date.now(), y: currentSensorData[item.sensor]});
											}
										},
										beginAtZero: true,
										suggestedMax: 20,
										grid: {
											color: "#3f3f3f"
										}
									},
									y: {
										grid: {
											color: "#3f3f3f"
										}
									}
								},
								plugins: {
									legend: {
										display: false
									},
									streaming: {
										pause: paused
									}
								}
							}}>

							</Line>
						{/if}
					{:else}
						<span>Keine Daten</span>
					{/if}
				</Card>
			</div>
		{/each}
	</div>
{:else}
	<div style="text-align: center; margin-top: 50px;">
		<span style="font-size: 3em; font-weight: bold;">Keine Sensoren verfügbar</span>
	</div>
{/if}

<style>
	h2 {
		margin: 0;
		padding: 0;
		font-size: 2.4em;
	}

	.cards {
		display: flex;
		flex-wrap: wrap;
		gap: 15px;
	}
</style>