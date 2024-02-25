<div {...$$restProps}>
	<slot></slot>
</div>

<style>
	div {
		background-color: rgba(29, 29, 29, 0.5);
		/* background-image: url("$lib/images/noise.png");
		background-size: contain; */
		backdrop-filter: blur(15px);
		padding: 10px;
		width: 30%;
		border: 2px solid rgba(46, 46, 46, 0.8);
		border-radius: 10px;
	}
</style>