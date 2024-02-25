<script>
// @ts-nocheck

	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import { bus } from "$lib/stores";
	import Spinner from "$lib/Spinner.svelte";
	import { goto } from "$app/navigation";
	import { Line } from "svelte-chartjs";
	import "chart.js/auto";
	import { Chart } from "chart.js";

	const file = $page.url.searchParams.get("file") || "";
	let isLoading = true;
	let fileContent = "";
	/**
	 * @type {{ labels: string[]; datasets: { label: string; data: (number | null)[]; borderColor: string; fill: boolean; }[] }}
	 */
	let chartData = {
		labels: ["Label 1", "Label 2"], // Time
		datasets: [{ // Sensors
			label: "Dataset 1",
			data: [1, 2],
			borderColor: "hsl(0, 100%, 50%)",
			fill: false
		}, {
			label: "Dataset 2",
			data: [2, 1],
			borderColor: "hsl(100, 100%, 50%)",
			fill: false
		}]
	};

	/**
	 * @param {string} csv
	 */
	function readCSVIntoChart(csv) {
		/**
		 * csv format:
		 * Zeit,Temp,CO2,TDS,pH
		 * 00:01:10,25,1000,200,7
		 * 00:01:20,25,1000,200,7
		 * 00:01:30,25,1000,200,7
		 * 
		 * and so on... the header could be different, but the first column is always the time
		 * 
		 * load that into the chart data
		 * 
			*/
		const lines = csv.split("\n");
		const header = lines[0].split(",");
		chartData.labels = lines.slice(1).map(line => line.split(",")[0]);
		chartData.datasets = header.slice(1).map((label, i) => {
			return {
				label,
				data: lines.slice(1).map(line => line.split(",")[i + 1]),
				borderColor: `hsl(${i * 100}, 100%, 50%)`,
				fill: false
			}
		});

		console.log(chartData);
	}

	onMount(() => {
		$bus.on("read_file", (/** @type {{ content: string; }} */ packet) => {
			// @ts-ignore
			fileContent = packet.content;
			console.log(fileContent);
			readCSVIntoChart(fileContent);
			isLoading = false;
		})

		$bus.emit({type: "read_file", path: file});
	})
</script>

{#if !isLoading}
	<Line data={chartData} options={{
		scales: {
			x: {
				grid: {
					color: "#3f3f3f"
				}
			},
			y: {
				grid: {
					color: "#3f3f3f"
				}
			}
		}
	}}>

	</Line>
{:else}
	<div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column;">
		<Spinner />
		<h2>Datei wird eingelesen...</h2>
	</div>
{/if}