init();

//this is needed for PWA to work on chrome, so users can install KoboldAI Lite to device
if ('serviceWorker' in navigator) {

	//for local mode, we do not load any PWA service worker.
	//this will prevent PWA functionality locally but will avoid the scary 404 errors
	if(!localflag)
	{
		console.log("Try to register service worker...");
		try {
			navigator.serviceWorker.register("sw.js")
			.then(()=>{
				console.log("service worker registered");
			})
			.catch(err=>{
				console.log("error while registering service worker 2: " + err);
			});
		} catch (error) {
			console.log("error while registering service worker 1: " + error.message);
		}
	}
}
else
{
	console.log("service workers API not available");
}
