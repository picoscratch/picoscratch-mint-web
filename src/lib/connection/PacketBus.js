// Packets are JSON objects with a type field and other fields depending on the type.
// PacketBus implementations are required to implement an _emit method that takes a packet and simply sends it over the bus like USB or a WebSocket.
// They also need to call the _onPacket method when a packet is received, which is implemented in AbstractPacketBus.

import { toast } from "svelte-sonner";
import {
  serial as serialpolyfill, SerialPort as SerialPortPolyfill,
} from "web-serial-polyfill";

export default class AbstractPacketBus {
	constructor() {
		/**
		 * @type {Object.<string, any[]>}
		 */
		this._handlers = {};
	}

	/**
	 * PacketBus implementations need to implement this method to send a packet over their bus. Make sure to @ override this method.
	 * @param {any} packet
	 */
	async _emit(packet) {
		throw new Error("To be implemented by PacketBus implementation");
	}

	/**
	 * PacketBus implementations need to call this method when a packet is received with the packet as the argument. Do not @ override this method.
	 * @param {any} packet The received packet
	 */
	_onPacket(packet) {
		if (!this._handlers[packet.type]) {
			return;
		}
		this._handlers[packet.type].forEach(handler => handler(packet));
	}

	//
	// Public API
	//

	/**
	 * Call this method to register an event handler for a specific packet type.
	 * @param {*} type The packet type to listen for
	 * @param {*} handler A function that will be called when a packet of the specified type is received with the packet as the argument
	 */
	on(type, handler) {
		if (!this._handlers[type]) {
			this._handlers[type] = [];
		}
		this._handlers[type].push(handler);
	}

	/**
	 * Call this method to unregister an event handler for a specific packet type.
	 * @param {*} type The packet type to stop listening for
	 * @param {*} handler The handler function to unregister
	 */
	off(type, handler) {
		if (!this._handlers[type]) {
			return;
		}
		const index = this._handlers[type].indexOf(handler);
		if (index !== -1) {
			this._handlers[type].splice(index, 1);
		}
	}

	/**
	 * Call this method to send a packet over the bus.
	 * @param {*} packet The packet to send
	 */
	async emit(packet) {
		await this._emit(packet);
	}
}

export class WebSocketPacketBus extends AbstractPacketBus {
	/**
	 * @param {any} webSocket
	 */
	constructor(webSocket) {
		super();
		this._webSocket = webSocket;
		this._webSocket.onmessage = (/** @type {{ data: string; }} */ event) => {
			const packet = JSON.parse(event.data);
			this._onPacket(packet);
		};
	}

	get websocket() {
		return this._webSocket;
	}

	/**
	 * @param {any} packet
	 */
	async _emit(packet) {
		this._webSocket.send(JSON.stringify(packet));
	}
}

export class WebUSBPacketBus extends AbstractPacketBus {
	static get USB_VENDOR_ID() {
		return 0x2e8a;
	}

	static get USB_PRODUCT_ID() {
		return 0x0005;
	}

	constructor() {
		super();
		if(navigator.serial) {
			this.serial = navigator.serial;
		} else {
			this.serial = serialpolyfill;
			this.SerialPort = SerialPortPolyfill;
		}
	}

	static supported() {
		return navigator.serial || navigator.usb;
	}

	/**
	 * Call this function with await to initialize the WebUSB connection.
	 * The user will be prompted to select a device.
	 * @param {() => void} onConnect A function that will be called when the connection is opened
	 * @param {() => void} onClose A function that will be called when the connection is closed
	 */
	async init(onConnect, onClose) {
		console.log([{
			usbVendorId: WebUSBPacketBus.USB_VENDOR_ID,
			usbProductId: WebUSBPacketBus.USB_PRODUCT_ID
		}]);
		try {
			this._port = await this.serial.requestPort({ filters: [{ usbVendorId: WebUSBPacketBus.USB_VENDOR_ID, usbProductId: WebUSBPacketBus.USB_PRODUCT_ID }]});
			await this._port.open({ baudRate: 9600, bufferSize: 255, dataBits: 8, flowControl: "none", parity: "none", stopBits: 1 });
		} catch (e) {
			console.error(e);
			// @ts-ignore
			toast.error("Verbindung fehlgeschlagen " + e.message);
			onClose();
			this.close();
			return;
		}
		this._port.addEventListener("disconnect", () => {
			console.log("WebUSB disconnect event")
			this._port = null;
			onClose();
			toast.error("Verbindung verloren");
		});
		this._onClose = onClose;
		toast.success("Verbindung hergestellt");
		onConnect();
		this._encoder = new TextEncoder();

		this._readLoop();
	}

	async _readLoop() {
		// if (!this._reader) {
		// 	return;
		// }
		// let { value, done } = await this._reader.read();
		// if (done) {
		// 	console.log("WebUSB read loop done");
		// 	return;
		// }
		// if(!value) {
		// 	return;
		// }
		// try {
		// 	const packet = JSON.parse(value);
		// 	console.log(packet);
		// 	this._onPacket(packet);
		// } catch(ignore) {console.log("Ignored: " + value)}
		// requestAnimationFrame(() => this._readLoop());

		while(this._port.readable) {
			const reader = this._port.readable.getReader();
			this._reader = reader;
			try {
				let string = "";
				while(true) {
					const { value, done } = await reader.read();
					if(done) {
						// reader has been cancelled
						console.log("WebUSB read loop done");
						return;
					}
					const decoded = new TextDecoder().decode(value);
					string += decoded;
					if(decoded.endsWith("\n")) {
						break;
					}
				}
				try {
					const packet = JSON.parse(string);
					console.log(packet);
					this._onPacket(packet);
				} catch(ignore) {console.log("Ignored: " + string)}
			} catch(e) {
				console.error("Reading error", e)
				toast.error("Verbindung verloren");
				if(this._onClose) this._onClose();
				this.close();
			} finally {
				reader.releaseLock();
			}
		}
		console.log("WebUSB read loop exited");
	}

	/**
	 * @param {any} packet
	 */
	async _emit(packet) {
		if(!this._port || !this._encoder || !this._port.writable) {
			return;
		}
		const writer = this._port.writable.getWriter()
		await writer.write(this._encoder.encode(JSON.stringify(packet) + "\n"))
		writer.releaseLock()
	}

	/**
	 * Call this function to close the WebUSB connection.
	 */
	async close() {
		if (!this._port) {
			return;
		}
		if(this._reader) this._reader.cancel();
		try {
			await this._port.close();
		} catch(ignore) {}
		this._port = null;
		this._reader = null;
	}
}