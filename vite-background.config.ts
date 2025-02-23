import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
	build:{
		emptyOutDir: false, // So that popup and content build files don't get deleted
		target:"node16",
		rollupOptions:{
			input:{
				background: "./background/background.ts", // Entry Point
			},
			output:{
				entryFileNames: "assets/[name].js"
			}
		},
	},
	define: {
		'import.meta.env.OPENAI_API_KEY': JSON.stringify(process.env.OPENAI_API_KEY),
	},
})