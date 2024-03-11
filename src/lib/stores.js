import { writable } from "svelte/store";
import AbstractPacketBus from "./connection/PacketBus";
import { onMount } from "svelte";
import { browser } from "$app/environment";

export const connection = writable(false);
export const busType = writable("");
export const bus = writable(new AbstractPacketBus());
export const serial = writable("");

export const chartData = writable({
	datasets: [{
		label: "Temperatur",
		data: [],
		borderWidth: 1
	}, {
		label: "Wasserqualität",
		data: [],
		borderWidth: 1
	}, {
		label: "CO2",
		data: [],
		borderWidth: 1
	}]
});

export const chartsData = writable({
	temp: {
		datasets: [{
			data: [],
			borderWidth: 1
		}]
	},
	tds: {
		datasets: [{
			data: [],
			borderWidth: 1
		}]
	},
	co2: {
		datasets: [{
			data: [],
			borderWidth: 1
		}]
	},
	ph: {
		datasets: [{
			data: [],
			borderWidth: 1
		}]
	}
})

export const devices = writable(browser ? JSON.parse(localStorage.getItem("devices") || "[]") : []);
devices.subscribe((value) => {
	if(browser) {
		window.localStorage.setItem("devices", JSON.stringify(value));
	}
});

export const selectedDevices = writable([]);

/**
 * @type {{[key: string]: {min: number, max: number, unit: string, friendlyName: string}}}
 */
export const sensorInfo = {
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
}
