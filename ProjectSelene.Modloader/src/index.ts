import { startUI } from './ui/ui';
import { worker } from './worker';

if (process.env.NODE_ENV === 'development') {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	import('../public/index.html'); import('../public/manifest.json'); import('../public/favicon.ico'); import('../public/logo192.png'); import('../public/logo512.png'); import('../public/character-halo-outline.png'); import('../public/character-outline.png'); import('../public/full_moon.svg');
	new EventSource('/esbuild').addEventListener('change', () => location.reload());
}

Object.assign(window, {
	require(name: string) {
		if (name === 'fs') {
			return new Proxy({}, {
				get(target, prop) {
					console.log('fs', prop);
					return ({
						promises: new Proxy({}, {
							get(target, prop) {
								console.log('fs.promises', prop);
								return ({
									async readFile(name: string) {
										console.log('readFile', name);
										if (name === '/fs/dataPath/\\Saves\\Default\\System.save') {
											return '{"lastUsedID":"auto","sub":{"options":{"volume-master":100,"volume-music":75,"volume-sound":100,"volume-gameplay":100,"volume-ui":100,"volume-ambience":100,"language":0,"debug-test-toggle":true,"debug-test-slider":50,"debug-test-group":0,"debug-test-info":{"langID":27,"assetId":"database.options","en_US":"This is a test info. It does nothing. Hi Modders! Take this as an example of an info. Yes we know it\'s kinda hacked."},"gamepad-input-mode":0,"left-stick-sensitivity":1,"right-stick-sensitivity":1,"debug-num":0.5,"skip-confirm":true,"snap-move-dir":false,"camera-offset":1,"font-bitmap":true,"display-hud":true,"text-scroll-speed":1.5,"gamepad-icons":0,"attack-face-dir":false,"quick-step":false,"modifier-slowdown":true,"save-cursor-pos":true,"cursor-lock":false,"hold-item-use":false,"hud-hp-display":0,"hud-item-display":0,"allow-weapon-duplicates":false},"controls":{"inputs":{"mouseLeft":{"keyboard1":"Button1","keyboard2":null,"gamepad":null},"menu":{"keyboard1":"Tab","keyboard2":null,"gamepad":"PAD_Start"},"pause":{"keyboard1":"Escape","keyboard2":null,"gamepad":null},"confirm":{"keyboard1":"Enter","keyboard2":null,"gamepad":"PAD_Face0"},"back":{"keyboard1":"Button2","keyboard2":"Backspace","gamepad":"PAD_Face1"},"menuUp":{"keyboard1":"ArrowUp","keyboard2":null,"gamepad":"PAD_UP"},"menuRight":{"keyboard1":"ArrowRight","keyboard2":null,"gamepad":"PAD_RIGHT"},"menuDown":{"keyboard1":"ArrowDown","keyboard2":null,"gamepad":"PAD_DOWN"},"menuLeft":{"keyboard1":"ArrowLeft","keyboard2":null,"gamepad":"PAD_LEFT"},"menuHelp":{"keyboard1":"Digit1","keyboard2":null,"gamepad":"PAD_Select"},"menuShortcut1":{"keyboard1":"Digit2","keyboard2":null,"gamepad":"PAD_Face2"},"menuShortcut2":{"keyboard1":"Digit3","keyboard2":null,"gamepad":"PAD_Face3"},"menuShortcut3":{"keyboard1":"Digit4","keyboard2":null,"gamepad":"PAD_RightStick"},"menuShortcut4":{"keyboard1":"Digit5","keyboard2":null,"gamepad":"PAD_LeftStick"},"menuCycleForwards":{"keyboard1":"KeyE","keyboard2":null,"gamepad":"PAD_RightShoulder"},"menuCycleBackwards":{"keyboard1":"KeyQ","keyboard2":null,"gamepad":"PAD_LeftShoulder"},"up":{"keyboard1":"KeyW","keyboard2":null,"gamepad":null},"right":{"keyboard1":"KeyD","keyboard2":null,"gamepad":null},"down":{"keyboard1":"KeyS","keyboard2":null,"gamepad":null},"left":{"keyboard1":"KeyA","keyboard2":null,"gamepad":null},"attack":{"keyboard1":"Button1","keyboard2":null,"gamepad":"PAD_Face2"},"aiming":{"keyboard1":"Button2","keyboard2":"Button5","gamepad":null},"dash":{"keyboard1":"Space","keyboard2":null,"gamepad":"PAD_Face1"},"guard":{"keyboard1":"KeyR","keyboard2":null,"gamepad":"PAD_LeftShoulder"},"special":{"keyboard1":"KeyQ","keyboard2":null,"gamepad":"PAD_LeftTrigger"},"command":{"keyboard1":"ShiftLeft","keyboard2":null,"gamepad":"PAD_Face3"},"interact":{"keyboard1":"Button1","keyboard2":"KeyE","gamepad":"PAD_Face0"},"neutral":{"keyboard1":"Digit1","keyboard2":null,"gamepad":"PAD_UP"},"aether":{"keyboard1":"Digit2","keyboard2":null,"gamepad":"PAD_DOWN"},"fire":{"keyboard1":"Digit3","keyboard2":null,"gamepad":"PAD_RIGHT"},"ice":{"keyboard1":"Digit4","keyboard2":null,"gamepad":"PAD_LEFT"},"modifier":{"keyboard1":"ControlLeft","keyboard2":null,"gamepad":"PAD_RightShoulder"},"itemUp":{"keyboard1":"Digit8","keyboard2":null,"gamepad":"PAD_UP"},"itemRight":{"keyboard1":"Digit5","keyboard2":null,"gamepad":"PAD_RIGHT"},"itemLeft":{"keyboard1":"Digit6","keyboard2":null,"gamepad":"PAD_LEFT"},"itemDown":{"keyboard1":"KeyH","keyboard2":null,"gamepad":"PAD_DOWN"},"langCorrect":{"keyboard1":"F7","keyboard2":null,"gamepad":null},"snapshot":{"keyboard1":"F8","keyboard2":null,"gamepad":null},"fps":{"keyboard1":"F3","keyboard2":null,"gamepad":null},"shooting":{"keyboard1":null,"keyboard2":null,"gamepad":"PAD_RightTrigger"},"neutralModifier":{"keyboard1":null,"keyboard2":null,"gamepad":"PAD_Face3"},"aetherModifier":{"keyboard1":null,"keyboard2":null,"gamepad":"PAD_Face0"},"fireModifier":{"keyboard1":null,"keyboard2":null,"gamepad":"PAD_Face1"},"iceModifier":{"keyboard1":null,"keyboard2":null,"gamepad":"PAD_Face2"}}}},"meta":{"auto":{"id":"auto","time":1673544664915.2834,"sub":{"track":{"playtime":103.32399999997277}}}}}';
										}
										return await (await fetch(name, {
											method: 'GET',
										})).text();
									},
									async stat(name: string) {
										console.log('stat', name);
										return {ctimeMs: 1673544664915.2834};
									},
									writeFile(name: string, content: string) {
										console.log('writeFile', name, content);

									},
									rename(from: string, to: string) {
										console.log('rename', from, to);

									},
								} as any)[prop];
							},
						}),
						existsSync(name: string) {
							console.log('existsSync', name);
							return false;
						},
						mkdirSync(name: string) {
							console.log('mkdirSync', name);
							return;
						},
						async readdir(name: string, options: string, callback: (a: any, b: any) => void) {
							const path = '/fs/game/' + name.substring('/terra'.length).replace(/\\/g, '/').replace('data/local/terra/', '');
							console.log('readdir', path, options);
        
        
							const result =  await (await fetch(path, {
								method: 'GET',
								headers: {
									'X-SW-Command': 'readDir',
								},
							})).json();
							const mapped = result.map((e: any) => ({name: e.name, isDirectory(){return e.isDir;}, isFile(){return !e.isDir;}}));
							callback(undefined,mapped);
						},
					} as any)[prop];
				},
			});
		}
	},
	nw: {
		App: {
			argv: [],
			dataPath: '/fs/dataPath/',
		},
		Screen: {
			screens: [{
				bounds: {
					height: 720 * 2,
					width: 1280 * 2,
				},
			}],
		},
	},
	process: {
		versions: {
			'node-webkit': '0.67.1',
		},
	},
});

worker.setup().then(() => startUI());


//directory allowdirs webkitdirectory