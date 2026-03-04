export default [
	{
		input: './three-xr-controller-manager.js',
		external: ['three'],
		plugins: [
		],
		output: [
			{
				format: 'esm',
				file: 'build/three-xr-controller-manager.module.js'
			}
		]
	}
];
