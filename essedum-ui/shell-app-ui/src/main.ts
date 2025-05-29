import('./bootstrap')
	.catch(err => console.error("An error occured while loading the 'bootstrap' module."));


// import { loadManifest } from '@angular-architects/module-federation';

// loadManifest("/assets/json/mf.manifest.json")
// 	.catch(err => console.error(err))
// 	.then(_ => import('./bootstrap'))
// 	.catch(err => console.error(err));
