// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Navigator {
		serial: Serial;
		usb: USB;
	}

	// Type for packet
	interface SensorPacket {
		temp: number;
		ppm: number;
		co2: number;
	}
}

export {};
