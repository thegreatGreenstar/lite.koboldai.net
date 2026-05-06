class AestheticInstructUISettings {
	constructor() {
		this.aui_margin_left = 5;
		this.aui_margin_right = 5;
		this.aui_margin_top = 5;
		this.aui_margin_bottom = 0;
		this.aui_padding_left = 15;
		this.aui_padding_right = 15;
		this.aui_padding_top = 10;
		this.aui_padding_bottom = 5;

		this.background_minHeight = 80;
		this.centerHorizontally = false;

		this.border_style = 'Rounded';
		this.portrait_width_AI = 80;
		this.portrait_ratio_AI = 1.0;
		this.portrait_width_you = 80;
		this.portrait_ratio_you = 1.0;

		this.rounded_bubbles = true;
		this.match_background = false;

		this.you_portrait = null;
		this.AI_portrait = "default";

		this.font_size = 12;

		this.bubbleColor_you = 'rgb(41, 52, 58)';
		this.text_tcolor_you = 'rgb(255, 255, 255)';
		this.speech_tcolor_you = 'rgb(150, 150, 200)'
		this.action_tcolor_you = 'rgb(178, 178, 178)';

		this.bubbleColor_AI = 'rgb(20, 20, 40)';
		this.text_tcolor_AI = 'rgb(255, 255, 255)';
		this.speech_tcolor_AI = 'rgb(150, 150, 200)'
		this.action_tcolor_AI = 'rgb(178, 178, 178)';

		this.code_block_background = 'rgb(0, 0, 0)';
		this.code_block_foreground = 'rgb(210, 50, 50)';
	}

	padding() { return `${this.aui_padding_top}px ${this.aui_padding_right}px ${this.aui_padding_bottom}px ${this.aui_padding_left}px`;}
	margin() { return `${this.aui_margin_top}px ${this.aui_margin_right}px ${this.aui_margin_bottom}px ${this.aui_margin_left}px`; }

}

let aestheticInstructUISettings = new AestheticInstructUISettings();
let tempAestheticInstructUISettings = null; // These exist to act as backup when customizing, to revert when pressing the 'Cancel' button.

function selectAvatarImage(isSelfPortrait)
{
	let finput = document.getElementById('portraitFileInput');
	finput.click();
	finput.onchange = (event) => {
		if (event.target.files.length > 0 && event.target.files[0]) {
			const file = event.target.files[0];
			const reader = new FileReader();
			reader.onload = function(img) {
				compressImage(img.target.result, loadCompressedImage, true, AVATAR_PX);
				function loadCompressedImage(compressedImageURI, aspectratio) {
					if(isSelfPortrait)
					{
						aestheticInstructUISettings.you_portrait = compressedImageURI;
						document.getElementById('portrait_ratio_you').value = aspectratio.toFixed(2);
					}
					else
					{
						aestheticInstructUISettings.AI_portrait = compressedImageURI;
						document.getElementById('portrait_ratio_AI').value = aspectratio.toFixed(2);
					}
					refreshAestheticPreview(true);
				}
			}
			reader.readAsDataURL(file);
		}
		finput.value = "";
	};
}

function initializeInstructUIFunctionality() {
	// Initialize color pickers
	document.querySelectorAll('.enhancedcolorPicker, .enhancedStandardColorPicker').forEach(element => {
		let useBackground = !element.classList.contains('enhancedcolorPicker');
		let colorPicker = document.createElement('input');
		colorPicker.type = 'color';
		colorPicker.style.opacity = '0';
		colorPicker.style.position = 'absolute';
		colorPicker.style.width = '100%';
		colorPicker.style.height = '100%';
		colorPicker.classList.add("colorpickerchild");
		colorPicker.value = element.style[`${useBackground ? 'backgroundColor' : 'color'}`];
		element.style.position = 'relative';
		element.appendChild(colorPicker);
		// If we're on Safari browser and in iOS, we need some adjustments for the colorpickers to work.
		// this happens because the clicks need to be directly done on the colorPicker for iOS in Safari.
		if (/^((?!Chrome|Firefox).)*Safari/i.test(navigator.userAgent) && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
			// Create a wrapper for the existing content. This will fix the offset slightly.
			let contentWrapper = document.createElement('div');
			contentWrapper.style.position = 'relative';
			contentWrapper.style.zIndex = '0';
			element.appendChild(contentWrapper);
			// Finally, make the colorPicker directly clickable, and offset it slightly towards the text block.
			colorPicker.style.zIndex = '1';
			colorPicker.style.margin = '-20px';
		}
		else {
			colorPicker.style.zIndex = '-1';
			element.addEventListener('click', () => colorPicker.click());
		}

		// Initialize the functionalities of the colorPicker
		colorPicker.addEventListener('change', function() {
			element.style[`${useBackground ? 'backgroundColor' : 'color'}`] = this.value;
		});
		element.addEventListener('mouseover', () => element.style.cursor = "pointer");
	});

	// Initialize functionality for the portrait pickers.
	document.querySelectorAll('#you-portrait, #AI-portrait').forEach(element => {
		element.addEventListener('click', (e) => {
			selectAvatarImage(element.id=="you-portrait");
		});
		element.addEventListener('mouseover', () => element.style.cursor = "pointer");
	});

	//portrait reset button
	document.getElementById("reset-portrait").addEventListener('click', (e) => {
		aestheticInstructUISettings.you_portrait = null;
		aestheticInstructUISettings.AI_portrait = "default";
		document.getElementById('portrait_ratio_AI').value = 1.0;
		document.getElementById('portrait_width_AI').value = 100;
		document.getElementById('portrait_ratio_you').value = 1.0;
		document.getElementById('portrait_width_you').value = 100;
		refreshAestheticPreview(true);
	});

	//full aesthetic reset button
	document.getElementById("reset-all-aesthetic-instruct").addEventListener('click', (e) => {
		let ns = new AestheticInstructUISettings();
		aestheticInstructUISettings = deepCopyAestheticSettings(ns);
		refreshAestheticPreview(false);
	});

	refreshAestheticPreview(false);
}

function openAestheticUISettingsMenu() {
	tempAestheticInstructUISettings = deepCopyAestheticSettings(aestheticInstructUISettings);
	document.getElementById("aestheticsettingscontainer").classList.remove("hidden");
	updateAestheticTextPreview();
}

function hideAestheticUISettingsMenu(confirm) {
	if (!confirm) {
		aestheticInstructUISettings = deepCopyAestheticSettings(tempAestheticInstructUISettings);
		refreshAestheticPreview(false);
	}
	tempAestheticInstructUISettings = null;
	document.getElementById("aestheticsettingscontainer").classList.add("hidden");
	render_gametext();
}

function deepCopyAestheticSettings(original) {
	let copy = new AestheticInstructUISettings();
	for (let [key, value] of Object.entries(original)) {
		copy[key] = value;
	}
	return copy;
}

function refreshAestheticPreview(updateFromUI = true) {
	if (updateFromUI) { updateDataFromUI(); }
	updateUIFromData();
	updateAestheticTextPreview();
	character_creator_updateimg();
}

function updateDataFromUI() {
	aestheticInstructUISettings.text_tcolor_you = getColorPickerValueFromElement(`you-text-colorselector`);
	aestheticInstructUISettings.speech_tcolor_you = getColorPickerValueFromElement(`you-speech-colorselector`);
	aestheticInstructUISettings.action_tcolor_you = getColorPickerValueFromElement(`you-action-colorselector`);
	aestheticInstructUISettings.bubbleColor_you = document.getElementById(`you-bubble-colorselector`).style.backgroundColor;
	aestheticInstructUISettings.text_tcolor_AI = getColorPickerValueFromElement(`AI-text-colorselector`);
	aestheticInstructUISettings.speech_tcolor_AI = getColorPickerValueFromElement(`AI-speech-colorselector`);
	aestheticInstructUISettings.action_tcolor_AI = getColorPickerValueFromElement(`AI-action-colorselector`);
	aestheticInstructUISettings.bubbleColor_AI = document.getElementById(`AI-bubble-colorselector`).style.backgroundColor;

	aestheticInstructUISettings.code_block_background = document.getElementById('code-block-background-colorselector').style.color;
	aestheticInstructUISettings.code_block_foreground = document.getElementById('code-block-foreground-colorselector').style.color;

	aestheticInstructUISettings.match_background = document.getElementById('aui_match_background').checked;
	aestheticInstructUISettings.rounded_bubbles = document.getElementById('aui_rounded_bubbles').checked;
	aestheticInstructUISettings.font_size = document.getElementById('instruct-font-size').value;
	aestheticInstructUISettings.border_style = document.getElementById('instructBorderStyle').value;
	aestheticInstructUISettings.portrait_width_AI = document.getElementById('portrait_width_AI').value;
	aestheticInstructUISettings.portrait_ratio_AI = document.getElementById('portrait_ratio_AI').value;
	aestheticInstructUISettings.portrait_width_you = document.getElementById('portrait_width_you').value;
	aestheticInstructUISettings.portrait_ratio_you = document.getElementById('portrait_ratio_you').value;
	aestheticInstructUISettings.background_minHeight = document.getElementById('instruct-min-backgroundHeight').value;
	aestheticInstructUISettings.centerHorizontally = document.getElementById('instructModeCenterHorizontally').checked;

	aestheticInstructUISettings.aui_margin_left = cleannum(parseInt(document.getElementById('aui_margin_left').value, 10), 0, 300);
	aestheticInstructUISettings.aui_margin_right = cleannum(parseInt(document.getElementById('aui_margin_right').value, 10), 0, 300);
	aestheticInstructUISettings.aui_margin_top = cleannum(parseInt(document.getElementById('aui_margin_top').value, 10), 0, 300);
	aestheticInstructUISettings.aui_margin_bottom = cleannum(parseInt(document.getElementById('aui_margin_bottom').value, 10), 0, 300);
	aestheticInstructUISettings.aui_padding_left = cleannum(parseInt(document.getElementById('aui_padding_left').value, 10), 0, 300);
	aestheticInstructUISettings.aui_padding_right = cleannum(parseInt(document.getElementById('aui_padding_right').value, 10), 0, 300);
	aestheticInstructUISettings.aui_padding_top = cleannum(parseInt(document.getElementById('aui_padding_top').value, 10), 0, 300);
	aestheticInstructUISettings.aui_padding_bottom = cleannum(parseInt(document.getElementById('aui_padding_bottom').value, 10), 0, 300);

	//basic sanitization
	aestheticInstructUISettings.font_size = cleannum(aestheticInstructUISettings.font_size, 5, 50);
	aestheticInstructUISettings.portrait_width_AI = cleannum(aestheticInstructUISettings.portrait_width_AI, 10, 250);
	aestheticInstructUISettings.portrait_ratio_AI = cleannum(aestheticInstructUISettings.portrait_ratio_AI, 0.01, 3).toFixed(2);
	aestheticInstructUISettings.portrait_width_you = cleannum(aestheticInstructUISettings.portrait_width_you, 10, 250);
	aestheticInstructUISettings.portrait_ratio_you = cleannum(aestheticInstructUISettings.portrait_ratio_you, 0.01, 3).toFixed(2);
	aestheticInstructUISettings.background_minHeight = cleannum(aestheticInstructUISettings.background_minHeight, 0, 300);

	function getColorPickerValueFromElement(id) {
		let element = document.getElementById(id);
		let computedStyle = window.getComputedStyle(element);
		return computedStyle.color;
	}
}

function updateUIFromData() {
	// Parse color settings and apply to the related parts in the UI.
	setElementColor(`you-text-colorselector`, aestheticInstructUISettings.text_tcolor_you, false);
	setElementColor(`you-speech-colorselector`, aestheticInstructUISettings.speech_tcolor_you, false);
	setElementColor(`you-action-colorselector`, aestheticInstructUISettings.action_tcolor_you, false);
	setElementColor(`you-bubble-colorselector`, aestheticInstructUISettings.bubbleColor_you, true);

	setElementColor(`AI-text-colorselector`, aestheticInstructUISettings.text_tcolor_AI, false);
	setElementColor(`AI-speech-colorselector`, aestheticInstructUISettings.speech_tcolor_AI, false);
	setElementColor(`AI-action-colorselector`, aestheticInstructUISettings.action_tcolor_AI, false);
	setElementColor(`AI-bubble-colorselector`, aestheticInstructUISettings.bubbleColor_AI, true);

	setElementColor('code-block-background-colorselector', aestheticInstructUISettings.code_block_background, false);
	setElementColor('code-block-foreground-colorselector', aestheticInstructUISettings.code_block_foreground, false);

	// Apply the settings from the json file to the UI.
	document.getElementById('aui_match_background').checked = aestheticInstructUISettings.match_background;
	document.getElementById('aui_rounded_bubbles').checked = aestheticInstructUISettings.rounded_bubbles;
	document.getElementById('instruct-font-size').value = aestheticInstructUISettings.font_size;
	document.getElementById('instructBorderStyle').value = aestheticInstructUISettings.border_style;
	document.getElementById('portrait_width_AI').value = aestheticInstructUISettings.portrait_width_AI;
	document.getElementById('portrait_ratio_AI').value = aestheticInstructUISettings.portrait_ratio_AI;
	document.getElementById('portrait_width_you').value = aestheticInstructUISettings.portrait_width_you;
	document.getElementById('portrait_ratio_you').value = aestheticInstructUISettings.portrait_ratio_you;
	document.getElementById('instruct-min-backgroundHeight').value = aestheticInstructUISettings.background_minHeight;
	document.getElementById('instructModeCenterHorizontally').checked = aestheticInstructUISettings.centerHorizontally;

	if(document.getElementById('instructBorderStyle').value == 'Circle')
	{
		document.querySelectorAll('.rectPortraitMode').forEach((x) => x.classList.add('hidden'));
	}
	else
	{
		document.querySelectorAll('.rectPortraitMode').forEach((x) => x.classList.remove('hidden'));
	}

	document.getElementById('aui_margin_left').value = aestheticInstructUISettings.aui_margin_left;
	document.getElementById('aui_margin_right').value = aestheticInstructUISettings.aui_margin_right;
	document.getElementById('aui_margin_top').value = aestheticInstructUISettings.aui_margin_top;
	document.getElementById('aui_margin_bottom').value = aestheticInstructUISettings.aui_margin_bottom;
	document.getElementById('aui_padding_left').value = aestheticInstructUISettings.aui_padding_left;
	document.getElementById('aui_padding_right').value = aestheticInstructUISettings.aui_padding_right;
	document.getElementById('aui_padding_top').value = aestheticInstructUISettings.aui_padding_top;
	document.getElementById('aui_padding_bottom').value = aestheticInstructUISettings.aui_padding_bottom;

	function setElementColor(id, newColor, isBackground) {
		let element = document.getElementById(id);
		if (!element) { console.warn(`Element with ID: ${id} not found.`); return; }
		if (isBackground) {
			element.style.backgroundColor = newColor;
		}
		else {
			element.style.color = newColor;
		}
		var childInput = element.querySelector('.colorpickerchild');
		if (childInput && newColor.includes("rgb")) {
			childInput.value = rgb_to_hex(newColor);
		} else if(childInput) {
			childInput.value = newColor;
		}
	}
}

function updateAestheticTextPreview() {
	let preview = `The shadows dance across the walls under the flickering candlelight of the quiet tavern.\n\nIt is well past dinnertime, and a cool breeze fills the room, which is nearly silent except for the hushed conversations from the few remaining patrons.\n{{[OUTPUT]}}\n*A small Kobold wearing a tattered brown cloak scurries up to you*\n\n"Excuse me, adventurer, I am Kobo the Kobold," he coughs softly and continues, "could you spare me a little coin? I haven't eaten for so long..." *kobo looks downcast with pleading eyes*\n{{[INPUT]}}\n*retrieves a small copper coin from a leather pouch, and places it on the table*\n\n"Hmm, that depends. Do you know to calculate the factorial of a number?", you chuckle.\n{{[OUTPUT]}}\nThe pathetic Kobold looks taken aback by your strange request, but then grudgingly agrees. *sighs heavily* "I guess..." *takes a few steps backwards, and starts scratching into the grimy floor with a stick*\n\n"Kobo just needs some food..." The kobold takes a deep breath and starts writing.\n\n\`\`\`\ndef factorial(n):\n  if n == 0:\n    return 1\n  else:\n    return n * factorial(n-1)\n\`\`\`\n*Kobo looks at you again* "Is that... acceptable?"\n{{[INPUT]}}\n*patting the sad kobold on his head, as he gratefully accepts the coin*\n\n"Aww there you go! Try not to spend it all it one place."\n\nYou watch as Kobo scampers off into the distance.`;
	if(localsettings.opmode==3)
	{
		preview = replaceAll(preview,'\n{{[OUTPUT]}}\n', `\n${localsettings.chatopponent.split("||$||")[0]}: `);
		preview = replaceAll(preview,'\n{{[INPUT]}}\n', `\n${localsettings.chatname}: `);
	}
	else if(localsettings.opmode==1 || localsettings.opmode==2)
	{
		preview = replaceAll(preview,'{{[OUTPUT]}}', "");
		preview = replaceAll(preview,'{{[INPUT]}}', "");
	}
	document.getElementById('aesthetic_text_preview').innerHTML = render_aesthetic_ui(preview,true);
}

function render_aesthetic_ui(input, isPreview) //class suffix string used to prevent defined styles from leaking into global scope
{
	const avatarImage = function(for_ai) { //todo: this is still bad code, but will keep it for now
		if((for_ai && !as.AI_portrait) || (!for_ai && !as.you_portrait) || as.border_style == 'None')
		{
			return ''; //for no portrait
		}
		let reinvertcolor = localsettings.invert_colors?" invert_colors":"";
		let radius = (as.border_style == 'Circle' ? '1000rem' : (as.border_style == 'Rounded' ? '1.6rem' : '0.1rem'));
		let width, height;
		let imgclassname = "";
		if (!for_ai) {
			width = as.portrait_width_you;
			height = (as.border_style == 'Circle' ? as.portrait_width_you : as.portrait_width_you / as.portrait_ratio_you);
			imgclassname = "you-portrait-image";
		} else {
			width = as.portrait_width_AI;
			height = (as.border_style == 'Circle' ? as.portrait_width_AI : as.portrait_width_AI / as.portrait_ratio_AI);
			imgclassname = "AI-portrait-image";
		}
		return `<div class='${imgclassname}${classSuffixStr}${reinvertcolor}' style='width:${width}px; height:${height}px; border-radius: ${radius}'></div>`;
	}

	if(localsettings.separate_end_tags) {
		if (get_instruct_starttag_end(true)) {
			input = replaceAll(input, get_instruct_starttag_end(true), "");
		}
		if (get_instruct_endtag_end(true)) {
			input = replaceAll(input, get_instruct_endtag_end(true), "");
		}
		if (get_instruct_systag_end(true)) {
			input = replaceAll(input, get_instruct_systag_end(true), "");
		}
	}

	if(!isPreview)
	{
		if(aestheticInstructUISettings.match_background)
		{
			document.getElementById('enhancedchatinterface_inner').style.backgroundColor = aestheticInstructUISettings.bubbleColor_AI;
		}else
		{
			document.getElementById('enhancedchatinterface_inner').style.backgroundColor = null;
		}
	}
	let as = aestheticInstructUISettings;
	let classSuffixStr = isPreview ? "prv" : "";
	let portraitsStyling = // Also, implement portraits as css classes. Now chat entries can reuse them instead of recreating them.
	`<style>
		.you-portrait-image${classSuffixStr} {margin: 6px 6px; background:url(${as.you_portrait}); background-clip: content-box; background-position: 50% 50%; background-size: 100% 100%; background-origin: content-box; background-repeat: no-repeat; border:none;}
		.AI-portrait-image${classSuffixStr} {margin: 6px 6px; background:url(${(as.AI_portrait!="default"?as.AI_portrait:niko_square)}); background-clip: content-box; background-position: 50% 50%; background-size: 100% 100%; background-origin: content-box; background-repeat: no-repeat; border:none;}
		#chat_msg_body code, #aesthetic_text_preview code
		{
			color: ${as.code_block_foreground};
			background-color: ${as.code_block_background};
		}
		#chat_msg_body pre, #aesthetic_text_preview pre {
			min-width:80%;
			white-space:pre-wrap;
			margin:8px 20px 2px 20px;
			padding-bottom: 12px;
			background-color:${as.code_block_background};
			color:${as.code_block_foreground};
		}
		.aui_aiturn_block{
			color: ${as.text_tcolor_AI};
			background-color:${as.bubbleColor_AI};
		}
		.aui_myturn_block{
			color: ${as.text_tcolor_you};
			background-color:${as.bubbleColor_you};
		}
		.aui_myturn_block em, .aui_myturn_block b :not(code){
			color: ${as.action_tcolor_you};
			font-style: italic;
			font-weight: normal;
		}
		.aui_aiturn_block em, .aui_aiturn_block b :not(code){
			color: ${as.action_tcolor_AI};
			font-style: italic;
			font-weight: normal;
		}
		.aui_myturn_block .quotespn {
			color: ${as.speech_tcolor_you};
			font-weight: normal;
		}
		.aui_aiturn_block .quotespn {
			color: ${as.speech_tcolor_AI};
			font-weight: normal;
		}
		#chat_msg_body blockquote, #aesthetic_text_preview blockquote
		{
			font-size: ${as.font_size}px;
			margin-bottom: 4px;
		}
	</style>
	`;

	//refactor - repack as turns
	let chatunits = [];
	input = replace_instruct_placeholders(input);
	if(localsettings.opmode==3) //chat mode
	{
		chatunits = repack_chat_history(input);
	}
	else if(localsettings.opmode==2)
	{
		//aesthetic mode repacks adventure as one big chunk
		chatunits = repack_adventure_history(input);
	}
	else if(localsettings.opmode==1)
	{
		//aesthetic mode repacks story as one big chunk
		chatunits = [{"msg":input, "myturn":false, "unlabelled_name":true, "unlabelled_img":true}];
	}
	else
	{
		chatunits = repack_instruct_history(input);
		repact_instruct_turns_beautify_render(chatunits);
	}

	let newbodystr = "";
	let countmap = new Map();
	let pendstream = "";
	if (synchro_pending_stream != "" && !isPreview) {
		pendstream = escape_html(pending_context_preinjection) + format_streaming_text(escape_html(synchro_pending_stream));
		let allow_cont_prev_turn = ((localsettings.opmode==4 && pending_context_preinjection=="") || (localsettings.opmode==3 && localsettings.allow_continue_chat));
		let appended = false;
		if(!appended && chatunits.length>0 && chatunits[chatunits.length-1].myturn==false && chatunits[chatunits.length-1].msg && allow_cont_prev_turn)
		{
			let codeblockcount = (chatunits[chatunits.length-1].msg.match(/```/g) || []).length; //only allow continue if not in codeblock
			//inject into previous turn, only for instruct OR continuechat
			if(codeblockcount==0 || codeblockcount%2==0)
			{
				chatunits[chatunits.length-1].add_stream_msg = `<span class='pending_text'>${pendstream}</span>`;
				appended = true;
			}
		}
		if(!appended)
		{
			chatunits.push({"msg":"","add_stream_msg":`<span class='pending_text'>${pendstream}</span>`,"myturn":false,"unlabelled_name":true, "unlabelled_img":false});
		}
	}
	let turnsincluded = count_visible_turns(chatunits);
	for(var i=0;i<chatunits.length;++i)
	{
		let curr = chatunits[i];

		if(localsettings.max_display_chars>0 && i<(chatunits.length-turnsincluded))
		{
			continue;
		}

		//for aesthetic mode, use fancy quotes, but we must exclude anything in codeblocks, and html tags
		let temphtmlstash = [];
		curr.msg = curr.msg.replace(/<[^>]*>/g, (htmlPart) => { temphtmlstash.push(htmlPart); return `[temp_replaced_html_${temphtmlstash.length - 1}]`; });
		curr.msg = curr.msg.split(/(```[\s\S]*?\n[\s\S]*?```)/g).map(partA => {
			if (partA.startsWith('```') && partA.endsWith('```')) {
				return partA; // leave as is
			} else {
				const partsB = partA.split(/(`.*?`)/g);
				const combinedB = partsB.map(partB => {
					if (partB.startsWith('`') && partB.endsWith('`')) {
						return partB; // leave as is
					} else {
						let x = partB.replace(/[“”"]/g, "&quot;");
						x = x.replace(/(^|[^\d])&quot;([\s\S]*?)&quot;/g, '$1<span class="quotespn">“$2”</span>');
						return x;
					}
				}).join('');
				return combinedB;
			}
		}).join('');
		curr.msg = curr.msg.replace(/\[temp_replaced_html_(.*?)\]/gm, (match, p) => {
			return temphtmlstash[p];
		});

		curr = repack_postprocess_turn(curr, countmap, true);
		if(curr.add_stream_msg)
		{
			curr.msg += curr.add_stream_msg; //add it last so it doesnt mess up the pending_text tags
		}

		if(!curr.msg)
		{
			continue; //if turn is empty skip it
		}

		let namepart = (curr.name!="" && localsettings.show_nametags?`<p class='aui_nametag'>${escape_html(curr.name)}</p>`:"");
		let showavatar = true;

		//adventure and story has no names or avatars, also handle unlabelled first turns for chat/instruct
		if((!curr.myturn && curr.unlabelled_name) || (localsettings.opmode==2 || localsettings.opmode==1))
		{
			namepart = "";
		}
		if((!curr.myturn && curr.unlabelled_img) || (localsettings.opmode==2 || localsettings.opmode==1))
		{
			showavatar = false;
		}

		//for adventure mode, highlight our actions with blockquotes
		if (localsettings.opmode == 2 && curr.myturn) {
			curr.msg = `<blockquote>${curr.msg}</blockquote>`;
		}

		//prepare the main turn block
		newbodystr += `<div style='display:flex; align-items:stretch; flex-direction: row;'>`;
		if(curr.myturn)
		{
			newbodystr += `${(showavatar?avatarImage(false):"")}
			<div class='aui_myturn_block'`;
		}
		else
		{
			newbodystr += `${(showavatar?avatarImage(true):"")}
			<div class='aui_aiturn_block'`;
		}
		newbodystr += ` style='flex: 1; display:flex; padding: ${as.padding()}; margin: ${as.margin()}; min-height:${as.background_minHeight}px;`
		+ ` font-size: ${as.font_size}px; flex-direction:column; align-items: ${as.centerHorizontally ? 'center' : 'flex-start'};`
		+ ` justify-content: center; border-radius: ${as.rounded_bubbles ? '15px' : '0px'}'>`
		+ `<div>${namepart}${curr.msg}</div></div></div>`;
	}

	return portraitsStyling + newbodystr.replaceAll(/(\r\n|\r|\n)/g,'<br>'); // Finally, convert newlines to HTML format and return the stylized string.
}
// end of aesthetic ui

function PerformWebsearch(webSearchQuery, onDone)
{
	let proceedSearching = function() //called once search query is prepared
	{
		if(!localsettings.websearch_multipass && (webSearchQuery==lastSearchQuery || webSearchQuery==""))
		{
			onDone(); //use cached results
		}
		else
		{
			if(pending_response_id=="")
			{
				pending_response_id = "-1";
				websearch_in_progress = true;
				render_gametext(false);
			}
			let murl = `${custom_kobold_endpoint}${koboldcpp_websearch_endpoint}`;
			murl = apply_proxy_url(murl);
			fetch(murl, {
				method: 'POST',
				headers: get_kobold_header(),
				body: JSON.stringify({q: webSearchQuery}),
			})
			.then(x => x.json())
			.then(values => {
				lastSearchQuery = webSearchQuery;
				if(lastSearchResults && lastSearchResults.length>0)
				{
					recentSearchQueries.push(lastSearchResults[0]);
					if(recentSearchQueries.length>2)
					{
						recentSearchQueries.shift();
					}
				}
				lastSearchResults = values;
				if(pending_response_id=="-1")
				{
					pending_response_id = "";
				}
				websearch_in_progress = false;
				onDone();
			})
			.catch(error => {
				console.log("WebSearch Error: " + error);
				lastSearchResults = [];
				recentSearchQueries = [];
				lastSearchQuery = "";
				if(pending_response_id=="-1")
				{
					pending_response_id = "";
				}
				websearch_in_progress = false;
				onDone();
			});
		}
	}

	//websearch
	if (localsettings.websearch_enabled && is_using_kcpp_with_websearch())
	{
		webSearchQuery = webSearchQuery.trim();

		if(webSearchQuery=="")
		{
			webSearchQuery = (gametext_arr.length > 0 ? gametext_arr.slice(-1)[0] : "");
			webSearchQuery = replace_search_placeholders(webSearchQuery);
			webSearchQuery = webSearchQuery.trim();
			if(webSearchQuery=="")
			{
				webSearchQuery = (gametext_arr.length > 1 ? gametext_arr.slice(-2,-1)[0] : "");
			}
		}
		webSearchQuery = replace_search_placeholders(webSearchQuery);
		webSearchQuery = webSearchQuery.trim();
		webSearchQuery = webSearchQuery.replace(/(?:\r\n|\r|\n)/g, '. ');

		if(localsettings.websearch_multipass && gametext_arr.length > 0)
		{
			let search_context = concat_gametext(true, ""); //will be truncated later

			//use tool call to generate the search prompt to be used
			generate_websearch_prompt(search_context,webSearchQuery,(generated_searchstr)=>{
				webSearchQuery = generated_searchstr;
				proceedSearching();
			});
		}
		else
		{
			proceedSearching();
		}
	}
	else
	{
		lastSearchResults = [];
		recentSearchQueries = [];
		lastSearchQuery = "";
		websearch_in_progress = false;
		onDone();
	}
}

function addDocumentToTextDB()
{
	let tryImportLorebookAsTextDB = (str) => {
		try {
			let obj = JSON.parse(str);
			return importLorebookAsTextDB(obj);
		}
		catch (e) {
			return false
		}
	}
	promptUserForLocalFile((fileDetails) => {
		let { file, fileName, ext, content, plaintext } = fileDetails;
		if (!plaintext) {
			return; //not importable, not text
		}
		let importLorebookResult = tryImportLorebookAsTextDB(plaintext);
		if (!importLorebookResult) {
			replaceDocumentFromTextDB(fileName, plaintext);
		}
	});
}

const generateNewEmbedding = asyncRunner(function* (text) { //generates new embedding from kcpp

	if (documentdb_provider == 3) //openai embeddings provider
	{
		let selmodel = document.getElementById("oai_embd_model").value;
		let reqOpt = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + localsettings.saved_oai_embd_key
			},
			body: JSON.stringify({
					"input": text,
					"model": selmodel,
					"encoding_format": "float"
			})
		};
		if (globalabortcontroller) {
			reqOpt.signal = globalabortcontroller.signal;
		}
		let sub_endpt = localsettings.saved_oai_embd_url;
		return fetch(sub_endpt, reqOpt).then((response) => response.json()).catch(err=>{
			console.log("error while fetching embeddings: " + err);
		});

	} else { //kcpp embeddings provider
		let reqOpt = {
			method: 'POST', // or 'PUT'
			headers: get_kobold_header(),
			body: JSON.stringify({
				"input": text,
				"truncate": true
			}),
		};
		if (globalabortcontroller) {
			reqOpt.signal = globalabortcontroller.signal;
		}
		let sub_endpt = apply_proxy_url(`${custom_kobold_endpoint}/api/extra/embeddings`);
		return fetch(sub_endpt, reqOpt).then((response) => response.json()).catch(err=>{
			console.log("error while fetching embeddings: " + err);
		});
	}
});
const DBComputeAndLoadEmbedding = asyncRunner(function* (hash, documentName, documentContent) //gets a cached embedding, recomputes if missing
{
	//if db is not initialized, init it
	const isIndexedDBSupported = !!window.indexedDB;
	if(isIndexedDBSupported && Object.keys(embeddings_cache).length === 0)
	{
		let iddb = yield indexeddb_load('EmbeddingsCache', '');
		if (iddb && iddb != "") {
			try {
				embeddings_cache = JSON.parse(iddb);
			} catch (e) {
				console.log("Fail to parse embeddings cache");
			}
		}
	}

	// Check if the embedding is already cached
	let currentEmbedding = embeddings_cache[hash];
	if (!currentEmbedding) {
		// Generate new embedding
		const embedding = yield generateNewEmbedding(documentContent);
		if (embedding && embedding.data && embedding.data.length > 0 && embedding.data[0].embedding) {
			const newembedding = {
				document: documentName ? documentName : "",
				hash: hash,
				embedding: embedding.data[0].embedding,
				snippet: documentContent,
				modelUsed: embedding.model
			};
			embeddings_cache[hash] = newembedding;
			if(isIndexedDBSupported)
			{
				indexeddb_save('EmbeddingsCache',JSON.stringify(embeddings_cache));
			}
		}
	}
	return embeddings_cache[hash];
});
function DBClearEmbeddings() //erases all cached embeddings
{
	embeddings_cache = {};
	const isIndexedDBSupported = !!window.indexedDB;
	if(isIndexedDBSupported)
	{
		indexeddb_save('EmbeddingsCache',JSON.stringify(embeddings_cache));
	}
	estimate_and_show_textDB_usage();
}
const getRankedEmbeddings = asyncRunner(function* (searchTerm, paragraphs)
{
	const cosineSimilarity = (A, B) => {
		let dotproduct = 0;
		let mA = 0;
		let mB = 0;
		for (let i = 0; i < A.length; i++) {
			dotproduct += A[i] * B[i];
			mA += A[i] * A[i];
			mB += B[i] * B[i];
		}
		mA = Math.sqrt(mA);
		mB = Math.sqrt(mB);
		return dotproduct / (mA * mB);
	}

	// Generator-style "async" version of getEmbeddings
	const getEmbeddings = function* (paragraphs) {
		let embeddings = [];
		for (let i = 0; i < paragraphs.length; i++) {
			showToast(`Generating ${i + 1} / ${paragraphs.length} embeddings...`);
			let documentContent = paragraphs[i].snippet;
			let documentName = paragraphs[i].document;
			let documentContentHash = cyrb_hash(`${documentContent}`, 0, 4);

			let embeddingObj = yield DBComputeAndLoadEmbedding(documentContentHash, documentName, documentContent);

			if (embeddingObj) {
				embeddings.push(embeddingObj);
			}
		}
		return embeddings;
	};

	// Compute search embedding
	const searchEmbeddingList = yield* getEmbeddings([{ document: "UserInput", snippet: searchTerm }]);

	// Compute paragraph embeddings
	const otherEmbeddingList = yield* getEmbeddings(paragraphs);

	if(searchEmbeddingList.length==0 || otherEmbeddingList.length==0)
	{
		showToast("Error Getting Embeddings");
		return [];
	}

	// Compute similarity scores
	for (let i = 0; i < otherEmbeddingList.length; i++) {
		otherEmbeddingList[i].similarity = cosineSimilarity(searchEmbeddingList[0].embedding, otherEmbeddingList[i].embedding);
	}

	showToast("");

	// Sort by descending similarity
	otherEmbeddingList.sort((a, b) => a.similarity > b.similarity ? -1 : 1);
	return otherEmbeddingList;
});

//LTM TextDB Memsnipper searching
//searches dbText for searchStr and recentTextStr, returns up to 3 results
const DatabaseMinisearch = asyncRunner(function* (dbText, searchStr, recentTextStr, minSimilarity = 0.2)
{	//predefined minisearch constants
	const chunkSize = documentdb_chunksize;
	const chunkSizeOverlap = Math.min(chunkSize*0.5, 500);
	const maxResultsPerSection = 5; //returns up to 5 matches per section
	const valuesToReturn = documentdb_numresults;

	if(dbText=="" || searchStr=="")
	{
		return [];
	}

	//utility functions used in minisearch
	let cleanupSpecialTags = function(text) {
		text = text.replace(/\{\{\[INPUT\]\}\}/g, "").replace(/\{\{\[OUTPUT\]\}\}/g, "");
		text = text.replace(/\{\{\[INPUT_END\]\}\}/g, "").replace(/\{\{\[OUTPUT_END\]\}\}/g, "");
		text = text.replace(/\{\{\[SYSTEM\]\}\}/g, "").replace(/\{\{\[SYSTEM_END\]\}\}/g, "");
		return text;
	}

	let stripToTokens = function(text) {
		return cleanupSpecialTags(text).replace(/[^\w\s\d-]/g, " ").replace("\s+", " ");
	}

	let searchAndScore = function(searchStr, recentTextStr, paragraphs) {
		let searchSections = [];
		if(recentTextStr && recentTextStr!=searchStr) //extra nearby data passed to search
		{
			searchSections.push({term: stripToTokens(recentTextStr),strength: 1});
		}
		searchSections.push({term: stripToTokens(searchStr),strength: 2});

		let sectionResults = searchSections.map((entry) => {
			let term = entry.term, strength = entry.strength;
			let docs = miniSearch.search(term);
			if (docs.length === 0) {
				return [];
			}
			let maxScore = docs[0].score;
			return docs.slice(0, maxResultsPerSection).map(doc => {
				doc.score *= strength / maxScore;
				return doc;
			})
		}).flat();

		// Adds scores together across results to form a summary
		let sectionSummary = sectionResults.reduce((docs, doc) => {
			const existingDoc = docs.find((c) => c["id"] === doc["id"]);
			if (existingDoc) {
				existingDoc.score += doc.score;
			}
			else {
				docs.push(doc);
			}
			return docs;
		}, []);

		// Maps to the more simple standard output structure and sort by total score
		let comparisons = sectionSummary.map(doc => {
			return {
				match: doc.score,
				snippet: doc.snippet,
				document: doc.document
			};
		}).sort((a, b) => {
			return (a.match > b.match ? -1 : 1);
		});

		// Scales each score by max score to get a proportional match relevance
		if (comparisons.length === 0) {
			return [];
		}
		let maxScore = comparisons[0].match;
		return comparisons.map(result => {
			result.match /= maxScore;
			return result;
		});
	}

	//step 1: chunk the dbtext into paragraph chunks
	let paragraphs = [];
	let allText = cleanupSpecialTags(dbText);
	allText = replaceAll(allText,recentTextStr,"");

	// Ensure placeholders are replaced to allow searching for user / character
	allText = replace_search_placeholders(allText);
	searchStr = replace_search_placeholders(searchStr);
	recentTextStr = replace_search_placeholders(recentTextStr);

	let i = 0;
	allText.split("[DOCUMENT BREAK]").forEach(doc => {
		doc = doc.trim();
		if (!doc) { return; }
		let titleMatch = doc.match(/^\[([^\n]+?)\]/);
		let title = null;
		if (titleMatch !== null)
		{
			doc = doc.replace(titleMatch[0], "");
			title = titleMatch[1];
		}
		let startLoc = 0;
		while (startLoc < doc.length && i < Number.MAX_SAFE_INTEGER) {
			let actualChunkStart = Math.max(0, startLoc - chunkSizeOverlap);
			let actualChunkEnd = Math.min(doc.length, actualChunkStart + chunkSize);
			let currentSnippet = doc.substring(actualChunkStart, actualChunkEnd);
			paragraphs.push({snippet: currentSnippet, document: title});
			startLoc = actualChunkEnd;
			i++;
		}
	});
	paragraphs = paragraphs.map(c => {
		c.snippet = c.snippet.replace(/\n\n/g, "\n");
		return c;
	}).filter(c => !!c.snippet);

	let miniSearch;
	if ((documentdb_provider==2 && is_using_kcpp_with_embeddings()) || documentdb_provider==3)
	{
		let searchResults = yield getRankedEmbeddings(searchStr, paragraphs);
		searchResults = searchResults.filter(x=>x.similarity>minSimilarity);
		searchResults = searchResults.slice(0, valuesToReturn);
		return searchResults;
	}
	else
	{
		let pgcount = 0;
		paragraphs = paragraphs.map(paragraph => {
			pgcount += 1;
			return {
				id: pgcount,
				snippet: paragraph.snippet,
				text: stripToTokens(paragraph.snippet),
				category: "context",
				document: paragraph.document
			}
		});

		// a list of commonly used words that have little meaning and can be excluded from analysis.
		const stopwords = [
			'about', 'above', 'after', 'again', 'all', 'also', 'am', 'an', 'and', 'another',
			'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below',
			'between', 'both', 'but', 'by', 'came', 'can', 'cannot', 'come', 'could', 'did',
			'do', 'does', 'doing', 'during', 'each', 'few', 'for', 'from', 'further', 'get',
			'got', 'has', 'had', 'he', 'have', 'her', 'here', 'him', 'himself', 'his', 'how',
			'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'like', 'make', 'many', 'me',
			'might', 'more', 'most', 'much', 'must', 'my', 'myself', 'never', 'now', 'of', 'on',
			'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
			'said', 'same', 'see', 'she', 'should', 'since', 'so', 'some', 'still', 'such', 'take', 'than',
			'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
			'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was',
			'way', 'we', 'well', 'were', 'what', 'where', 'when', 'which', 'while', 'who',
			'whom', 'with', 'would', 'why', 'you', 'your', 'yours', 'yourself',
			'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
			'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '$', '1',
			'2', '3', '4', '5', '6', '7', '8', '9', '0', '_',
			'll', 're'
		];
		//step 2: initialize minisearch engine
		miniSearch = new MiniSearch({
			fields: ["text"], // fields to index for full-text search
			storeFields: ['category', "snippet", "document"], // fields to return with search results
			searchOptions: {
				fuzzy: 0,
				bm25: { // https://lucaong.github.io/minisearch/types/MiniSearch.BM25Params.html
					b: 0.7, // Normalisation for the length of the string
					d: 0.7, // Minimum significance of a term showing up once
					k: 1.5 // Term frequency falloff (higher values allow for bigger differences based on amount of repetition of terms)
				}
			},
			processTerm: (term, _fieldName) => {
				let processedTerm = stopwords.includes(term.toLowerCase()) ? false : MiniSearch.getDefault("processTerm")(term);
				return processedTerm;
			},
			tokenize: (str) => {
				let terms = MiniSearch.getDefault("tokenize")(str);
				return terms.concat(terms.map(porterStemmer));
			}
		});
		miniSearch.addAll(paragraphs); //populate minisearch with paragraphs

		//step 3: run the search over the dbText to generate matches
		let searchResults = searchAndScore(searchStr, recentTextStr, paragraphs);
		searchResults = searchResults.filter(x => x.match > minSimilarity);
		searchResults = searchResults.slice(0, valuesToReturn);
		return searchResults;
	}
});

/** Inspired by My Ghost Writer from trincadev - https://github.com/trincadev/my_ghost_writer */
//scan through full context to ngram a possible set of candidates
function trigger_wordsearch_candidates() {
	const searchBox = document.getElementById("wordsearch_input");
	const resultsContainer = document.getElementById("wordsearch_results");
	const sortByFreq = document.getElementById("wordsearch_sort").value=="0";
	const query = searchBox.value.trim();
	resultsContainer.innerHTML = "";

	let ngramParser = function (text, n) {
		const words = text.split(/ +/).filter(word => word.length > 0);
		const ngrams = {};
		let prevNgram = null;

		for (let i = 0; i <= words.length - n; i++) {
			let ngram = words.slice(i, i + n).join(' ');
			//strip leading and trailing punctuation
			ngram = ngram.replace(/^[,\.?!()\[\]{}\`:;\-\'\"—]+|[,\.?!()\[\]{}\`:;\-\'\"—]+$/g, '');
			if (ngram === prevNgram) continue; // skip duplicate overlaps
			prevNgram = ngram;

			if (ngrams[ngram]) {
				ngrams[ngram]++;
			} else {
				ngrams[ngram] = 1;
			}
		}
		const sortedNgrams = Object.entries(ngrams).sort((a, b) => b[1] - a[1]);
		return sortedNgrams.map(entry => ({ ng: entry[0], cnt: entry[1] }));
	};

	let prepare_candidates_from_text = function(query) {
		const fullgametext = concat_gametext(true, "").toLowerCase();
		let querylc = query.toLowerCase();
		let candidateDict = {};

		let textrows = fullgametext.split("\n").filter(x=>x);

		for(let l=0;l<textrows.length;++l)
		{
			for(let i=1;i<=3;++i) //ngram of 3
			{
				let res = ngramParser(textrows[l],i);
				if(querylc!="")
				{
					res = res.filter(x=>x.ng.toLowerCase().includes(querylc));
				}
				let lim = Math.min(res.length,250);
				for(let j=0;j<lim;++j)
				{
					if (!candidateDict[res[j].ng]) {
						candidateDict[res[j].ng] = res[j].cnt;
					} else {
						candidateDict[res[j].ng] += res[j].cnt;
					}
				}
			}
		}

		//todo: counts are not correct because of substrings. let's manually count each item for now
		for(let key in candidateDict)
		{
			candidateDict[key] = (fullgametext.split(key).length - 1);
		}

		if(querylc!="")
		{
			let basecount = (fullgametext.split(querylc).length - 1); //count of the pure substring
			candidateDict[query] = basecount;
		}

		return candidateDict;
	}

	let candidateDict = prepare_candidates_from_text(query);
	var candidateItems = Object.keys(candidateDict).map(function(key) {
		return [key, candidateDict[key]];
	});

	if(sortByFreq)
	{
		candidateItems.sort(function(first, second) {
			return second[1] - first[1];
		});
	}else
	{
		//sort alphabetically
		candidateItems.sort(function(first, second) {
			if (first[0] < second[0]) {
				return -1;
			}
			if (first[0] > second[0]) {
				return 1;
			}
			return 0;
		});

	}


	for(let i=0;i<candidateItems.length;++i)
	{
		let key = candidateItems[i][0];
		let count = candidateItems[i][1];
		const btn = document.createElement("div");
		btn.style.border = "1px solid #646464";
		btn.innerHTML = `<a href="#"><span class="color_wordsearch_surrounding">${key} (${count})</span></a>`;
		let searchstr = key;
		btn.onclick = () => {
			trigger_wordsearch_results(searchstr);
		};
		resultsContainer.appendChild(btn);
	}
}
function trigger_wordsearch_candidates_key()
{
	if (event.key === 'Enter') {
		trigger_wordsearch_candidates();
	}
}

function trigger_wordsearch_results(query) {
	const resultsContainer = document.getElementById("wordsearch_results");
	const gametext = document.getElementById("gametext");
	query = query.trim();
	resultsContainer.innerHTML = "";
	if (!query) return;

	let extract_surrounding_text = function(range, contextLength) {
		const textNode = range.startContainer;
		if (textNode.nodeType !== Node.TEXT_NODE) return;
		const textContent = textNode.textContent;
		const startOffset = range.startOffset;
		const endOffset = range.endOffset;
		// Compute raw bounds
		let start = Math.max(0, startOffset - contextLength);
		let end = Math.min(textContent.length, endOffset + contextLength);
		// Clamp to word boundaries
		start = textContent.lastIndexOf(' ', start);
		end = textContent.indexOf(' ', end);
		if (start === -1) start = 0;
		if (end === -1) end = textContent.length;
		const before = textContent.slice(start, startOffset);
		const middle = textContent.slice(startOffset, endOffset);
		const after = textContent.slice(endOffset,end);
		return {"before":before, "middle":middle, "after":after, "full":`${before}${middle}${after}`};
	}

	let search_text_for_strings = function(query) { //search text nodes for all instances of query
		const gametext = document.getElementById("gametext");
		let matchRanges = [];
		const walker = document.createTreeWalker(gametext, NodeFilter.SHOW_TEXT, null, false);

		while (walker.nextNode()) {
			const node = walker.currentNode;
			const text = node.nodeValue;
			let idx = 0;
			while ((idx = text.toLowerCase().indexOf(query.toLowerCase(), idx)) !== -1) {
			const range = document.createRange();
			range.setStart(node, idx);
			range.setEnd(node, idx + query.length);
			matchRanges.push({ range, preview: text.substr(idx, query.length) });
			idx += query.length;
			}
		}
		return matchRanges;
	}

	let matchRanges = search_text_for_strings(query);

	const topper = document.createElement("div");
	topper.style.border = "1px solid #646464";
	topper.innerText = `${matchRanges.length} results`;
	resultsContainer.appendChild(topper);
	matchRanges.forEach(({ range, preview }, i) => {
		const btn = document.createElement("div");
		btn.style.border = "1px solid #646464";
		let nearbytext = extract_surrounding_text(range, 8);  //8 chars clamped to word bounds
		btn.innerHTML = `<a href="#"><span class="color_wordsearch_surrounding">${nearbytext.before}</span><span class="color_wordsearch_target">${nearbytext.middle}</span><span class="color_wordsearch_surrounding">${nearbytext.after}</span></a>`;
		btn.onclick = () => {
			const sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);

			// Scroll the container
			const rect = range.getBoundingClientRect();
			const containerRect = gametext.getBoundingClientRect();
			if (rect.top < containerRect.top || rect.bottom > containerRect.bottom) {
				if (range.startContainer && range.startContainer.nodeType === Node.TEXT_NODE) {
					suppressScrollEvent = true;
					gametext.scrollTop = 0; //simple fix for safari scrolling
					suppressScrollEvent = false;
					const span = document.createElement("span");
					span.style.display = "inline";
					span.style.background = "transparent";
					span.id = "temp-scroll-target";
					range.insertNode(span); // Insert a temporary marker, then scroll to it
					document.querySelector("#temp-scroll-target").scrollIntoView({ behavior: "smooth", block: "center" });
					span.remove(); //remove temp marker
				}
			}
		};
		resultsContainer.appendChild(btn);
	});
}

//queries the decensoring prefix from a second OAI compatible endpoint and returns a string to add to our main request
const FetchDecensoredPrefix = asyncRunner(function* (submit_payload, endpoint_url, modelused, num_tokens)
{
	let oaiheaders = get_oai_header(custom_oai_key);

	let scaled_rep_pen = 0;
	if(submit_payload.params.presence_penalty > 0)
	{
		scaled_rep_pen = submit_payload.params.presence_penalty;
	}else{
		//original range between 1 and 3, scale to 0 and 2
		scaled_rep_pen = (submit_payload.params.rep_pen - 1.0);
	}
	let oai_payload =
	{
		"prompt": submit_payload.prompt,
		"max_tokens": num_tokens,
		"model": modelused,
		"temperature": submit_payload.params.temperature,
		"top_p": submit_payload.params.top_p,
		"stream": false,
		"presence_penalty": scaled_rep_pen,
		"stop": get_stop_sequences().slice(0, 4)
	};

	return fetch(endpoint_url, {
		method: 'POST',
		headers: oaiheaders,
		body: JSON.stringify(oai_payload),
		referrerPolicy: 'no-referrer',
	})
	.then((response) => response.json())
	.then((data) => {
		let reply = "";
		if (data.choices != null && data.choices.length > 0) {
			let dch = data.choices[0];
			if (dch.text) {
				reply = dch.text;
			}
		}
		return reply;
	})
	.catch((error) => {
		console.error('Error:', error);
		return "";
	});
});
