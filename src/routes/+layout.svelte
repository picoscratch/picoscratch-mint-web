<script>
	import Header from "$lib/Header.svelte";
	import Nav from "$lib/nav/Nav.svelte";
	import { bus, connection } from "$lib/stores";
	import "$lib/styles.css";
	import { onMount } from "svelte";
	import Connect from "./Connect.svelte";
	import { Toaster } from "svelte-sonner";
</script>

<svelte:head>
	<title>PicoScratch MINT</title>
	<meta name="description" content="Web-Tool um PicoScratch MINT-Messgeräte zu verwalten. Es können Sensordaten in ein Diagramm eingetragen werden, Dateien ausgelesen und mehr.">
	<meta name="keywords" content="picoscratch, mint, messgerät, messgeraet, picoscratch wlan">
	<meta name="author" content="PicoScratch">
</svelte:head>

<Toaster theme="dark" richColors closeButton />

<div class="app">
	<Header />
	<div class="content">
		{#if $connection == true}
			<Nav />
		{/if}

		<main>
			{#if $connection == true}
				<slot></slot>
			{:else}
				<Connect />
			{/if}
		</main>
	</div>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		display: flex;
		flex-direction: column;
		padding-left: 1rem;
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
		height: 90vh;
		/* overflow-y: scroll; */
		overflow-y: auto;
		view-transition-name: content;
	}

	.content {
		display: flex;
	}
</style>