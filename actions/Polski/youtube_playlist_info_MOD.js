module.exports = {

//---------------------------------------------------------------------
// Action Name
//
// This is the name of the action displayed in the editor.
//---------------------------------------------------------------------

name: "Pobierz info o Playlistcie",

//---------------------------------------------------------------------
// Action Section
//
// This is the section the action will fall into.
//---------------------------------------------------------------------

section: "Muzyka",

//---------------------------------------------------------------------
// Action Subtitle
//
// This function generates the subtitle displayed next to the name.
//---------------------------------------------------------------------

subtitle: function(data) {
	const info = ['Video IDs', 'Video URLs', 'Video Titles', 'Channel IDs', 'Channel URLs', 'Channel Names', 'Video Positons', 'Video Publish Dates', 'Thumbnail (Default)', 'Thumbnail (Medium)', 'Thumbnail (High)', 'Thumbnail (Standard)', 'Thumbnail (Maxres)'];
	const storage = ['', 'Temp Variable', 'Server Variable', 'Global Variable'];
	return `Store ${info[parseInt(data.info)]} from ${storage[parseInt(data.storage)]} (${data.varName})`;
},

//---------------------------------------------------------------------
// DBM Mods Manager Variables (Optional but nice to have!)
//
// These are variables that DBM Mods Manager uses to show information
// about the mods for people to see in the list.
//---------------------------------------------------------------------

// Who made the mod (If not set, defaults to "DBM Mods")
author: "ZockerNico",

// The version of the mod (Defaults to 1.0.0)
version: "1.9.5", //Added in 1.9.5

// A short description to show on the mod line for this mod (Must be on a single line)
short_description: "This action will add every video info from a youtube playlist to a list in DBM.",

// If it depends on any other mods by name, ex: WrexMODS if the mod uses something from WrexMods
depends_on_mods: [
	{name:'WrexMods',path:'aaa_wrexmods_dependencies_MOD.js'}
],

//---------------------------------------------------------------------
// Action Storage Function
//
// Stores the relevant variable info for the editor.
//---------------------------------------------------------------------

variableStorage: function(data, varType) {
	const type = parseInt(data.storage);
	if(type !== varType) return;
	return ([data.varName, 'List']);
},

//---------------------------------------------------------------------
// Action Fields
//
// These are the fields for the action. These fields are customized
// by creating elements with corresponding IDs in the HTML. These
// are also the names of the fields stored in the action's JSON data.
//---------------------------------------------------------------------

fields: ["url", "apikey", "results", "info", "storage", "varName"],

//---------------------------------------------------------------------
// Command HTML
//
// This function returns a string containing the HTML used for
// editting actions. 
//
// The "isEvent" parameter will be true if this action is being used
// for an event. Due to their nature, events lack certain information, 
// so edit the HTML to reflect this.
//
// The "data" parameter stores constants for select elements to use. 
// Each is an array: index 0 for commands, index 1 for events.
// The names are: sendTargets, members, roles, channels, 
//                messages, servers, variables
//---------------------------------------------------------------------

html: function(isEvent, data) {
	return `
<div class="embed">
    <embedleftline style="background-color: #2b9696;"></embedleftline>
    <div class="embedinfo">
        <span class="embed-auth"><u>Tłumaczenie:</u><br>Stworzono przez <b>Meffiu#9999</b><br>
        <u><span class="wrexlink" data-url="https://www.paypal.com/pools/c/8ar9aXPH54">Wesprzyj!</span></u></span><br>
        <span class="embed-desc">Dodano w: 2.1.1<br></span>
    </div>
</div><br>
<div>
	<div>
		<p>
			Stworzono przez ZockerNico.<br>Edytowane przez Armağan#2448.
		</p>
	</div>
	<div style="float: left; width: 105%;">
		<br>URL Playlisty:<br>
		<input id="url" class="round" type="text" value="https://www.youtube.com/playlist?list=PLkfg3Bt9RE055BeP8DeDZSUCYxeSLnobe"><br>
	</div>
	<div style="float: left; width: 105%;">
		Klucz API:<br>
		<input id="apikey" class="round" type="text" placeholder="Wstaw YouTube Data V3 Klucz API..."><br>
	</div>
	<div style="float: left; width: 35%;">
		Informacja:<br>
		<select id="info" class="round">
			<option value="0">ID Filmów</option>
			<option value="1" selected>URL Filmów</option>
			<option value="2">Tytuły Filmów</option>
			<option value="3">ID Kanałów</option>
			<option value="4">URL Kanałów</option>
			<option value="5">Nazwy Kanałów</option>
			<option value="6">Pozycje Filmów</option>
			<option value="7">Daty publikacji Filmów</option>
			<option value="8">Miniaturki (Domyślne)</option>
			<option value="9">Miniaturki (Średnie)</option>
			<option value="10">Miniaturki (Wysokie)</option>
			<option value="11">Miniaturki (Standardowe)</option>
			<option value="12">Miniaturki (Max. rozdzielczość))</option>
		</select>
	</div>
	<div style="float: right; width: 60%;">
		Max wyników:<br>
		<input id="results" class="round" type="text" placeholder="Puste = 100">
	</div>
	<div style="float: left; width: 35%;">
		<br>Zapisz w:<br>
		<select id="storage" class="round">
			${data.variables[1]}
		</select>
	</div>
	<div id="varNameContainer" style="float: right; width: 60%;">
		<br>Nazwa zmiennej:<br>
		<input id="varName" class="round" type="text">
	</div>
	<div style="float: left; width: 95%; padding-top: 8px;">
		<p>
			<br>Ta akcja spowoduje zapisanie każdego filmu w ramach maksymalnych wyników i zwrócenie wybranej informacji o źródle jako listy.
		</p>
	</div>
</div>`
},

//---------------------------------------------------------------------
// Action Editor Init Code
//
// When the HTML is first applied to the action editor, this code
// is also run. This helps add modifications or setup reactionary
// functions for the DOM elements.
//---------------------------------------------------------------------

init: function() {
},

//---------------------------------------------------------------------
// Action Bot Function
//
// This is the function for the action within the Bot's Action class.
// Keep in mind event calls won't have access to the "msg" parameter, 
// so be sure to provide checks for variable existance.
//---------------------------------------------------------------------

action: function(cache) {
	const data = cache.actions[cache.index];
	const WrexMODS = this.getWrexMods();
	const ypi = WrexMODS.require('youtube-playlist-info');
	var _this = this;

	//Check input
	if(!data.url) {
		return console.log('Please insert a playlist url!');
	};
	if(!data.apikey) {
		return console.log('Please insert a api key!');
	};

	//Load playlist
	const playlist = this.evalMessage(data.url, cache);
	const playlistID = playlist.slice(38);
	var apikey = "";
	if(data.apikey) {
		apikey = this.evalMessage(data.apikey, cache);
	};
	var results = 100;
	if(data.results) {
		results = parseInt(this.evalMessage(data.results, cache));
	};
	const options = {
		maxResults: results
	};
	ypi(apikey, playlistID, options).then(items => {
		var urlList = [];
		var type = parseInt(data.info, cache);
		switch(type) {
			case 0://Video ID
				items.forEach(item=> {
					urlList.push(item.resourceId.videoId);
				});
				break;
			case 1://Video URL
				items.forEach(item=> {
					urlList.push(`https://www.youtube.com/watch?v=${item.resourceId.videoId}`);
				});
				break;
			case 2://Video Title
				items.forEach(item=> {
					urlList.push(item.title);
				});
				break;
			case 3://Channel ID
				items.forEach(item=> {
					urlList.push(item.channelId);
				});
				break;
			case 4://Channel URL
				items.forEach(item=> {
					urlList.push(`https://www.youtube.com/channel/${item.channelId}`);
				});
				break;
			case 5://Channel Name
				items.forEach(item=> {
					urlList.push(item.channelTitle);
				});
				break;
			case 6://Video Position
				items.forEach(item=> {
					urlList.push(item.position);
				});
				break;
			case 7://Video Publish Date
				items.forEach(item=> {
					urlList.push(item.publishedAt);
				});
				break;
			case 8://Thumbnail (Default)
				items.forEach(item=> {
					urlList.push(item.thumbnails.default);
				});
				break;
			case 9://Thumbnail (Medium)
				items.forEach(item=> {
					urlList.push(item.thumbnails.medium);
				});
				break;
			case 10://Thumbnail (High)
				items.forEach(item=> {
					urlList.push(item.thumbnails.high);
				});
				break;
			case 11://Thumbnail (Standard)
				items.forEach(item=> {
					urlList.push(item.thumbnails.standard);
				});
				break;
			case 12://Thumbnail (Maxres)
				items.forEach(item=> {
					urlList.push(item.thumbnails.maxres);
				});
				break;
			default:
				break;
		};
		//Store list
		// Debug Disabled.
		// console.log(urlList);
		const varName = _this.evalMessage(data.varName, cache);
		const storage = parseInt(data.storage);
		_this.storeValue(urlList, storage, varName, cache);

		//OOF
		_this.callNextAction(cache);

	}).catch(console.error);


},

//---------------------------------------------------------------------
// Action Bot Mod
//
// Upon initialization of the bot, this code is run. Using the bot's
// DBM namespace, one can add/modify existing functions if necessary.
// In order to reduce conflictions between mods, be sure to alias
// functions you wish to overwrite.
//---------------------------------------------------------------------

mod: function(DBM) {
}

}; // End of module