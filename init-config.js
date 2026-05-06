const LITEVER = 331;
const urlParams = new URLSearchParams(window.location.search);
var localflag = urlParams.get('local'); //this will be replaced automatically in embedded kcpp
const STORAGE_PREFIX = (localflag?"e_":"")+"kaihordewebui_";
