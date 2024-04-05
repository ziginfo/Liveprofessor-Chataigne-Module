// ========================== VARS ===========================

var snapcount = local.values.numberOfSnapshots.get() ;
var chaincount = local.values.numberOfChains.get() ;

//====================================================================
//			INITIAL FUNCTIONS 
//====================================================================

function init() {

// =====================================================================
// 			CREATE CONTAINERS
// =====================================================================

Snap = local.values.addStringParameter("Active Snapshot", "Active Snapshot","Active Snapshot");
activeCue = local.values.addStringParameter("Active Cue", "Active Cue","Active Cue");
nextCue = local.values.addStringParameter("Next Cue", "Next Cue","Next Cue");


//Snaphot Labels Container >>>>>>>>>>>>>>>>>>>>>>		
		snap=local.values.addContainer("Snapshot Labels");
		snap.setCollapsed(true);
		snap.addTrigger("Sync Labels", "Get Labels from Liveprofessor" , false);
		snap.addTrigger("Reset Labels", "Reset All Labels" , false);	
		for (var n = 1; n <= snapcount; n++) {
			snap.addStringParameter("Snapshot "+n, "", ""); }
			
// Chain Faders Container>>>>>>>>>>>>>>>>>>>>>
		
		faders = local.values.addContainer("Chain Gains");
		faders.setCollapsed(true);
		faders.addTrigger("Sync Gains", "Get Fader Values from Liveprofessor" , false);		
		faders.addTrigger("Reset Values", "Reset All Values" , false);		
		for (var n = 1; n <= chaincount; n++) {
			var fade = faders.addFloatParameter("Chain "+n+" In", "", 0, 0, 1);
			fade.setAttribute("readonly" ,true);
			var fade = faders.addFloatParameter("Chain "+n+" Out", "", 0, 0, 1);
			fade.setAttribute("readonly" ,true);  }
			
			
}

// =====================================================================
// 			PARAM CHANGES
// =====================================================================

function moduleParameterChanged(param) {
  
  
}

// =====================================================================
// 			VALUE CHANGES -> RESET etc...
// =====================================================================

function moduleValueChanged(value) {
  
  	if (value.name == "syncGains"){ 
  	local.send("/GlobalSnapshots/Refresh"); 
  	local.send("/StatusPoll") ;  	}
  	
  	if (value.name == "syncLabels"){ 
  	local.send("/GlobalSnapshots/Refresh"); }
  	
  	if (value.name == "resetLabels"){ 
  	for (var n = 0; n < snapcount; n++) {
	var no = n+1 ;
	local.values.snapshotLabels.getChild('Snapshot'+no).set(""); 
	} }
	
	if (value.name == "resetValues"){ 
  	for (var n = 0; n < chaincount; n++) {
	var no = n+1 ;
	var child = "chain"+no+"IN" ;
	local.values.chainGains.getChild(child).set(0);
	var child = "chain"+no+"OUT" ;
	local.values.chainGains.getChild(child).set(0); 
	} }
    
  
}

//============================================================
//			OSC EVENTS
//============================================================

function oscEvent(address, args) {

// >>> active and next Cue
	if (address == "/GlobalSnapshots/Recalled")
 	{local.values.activeSnapshot.set(args[0]);}	
 	if (address == "/CueLists/ActiveCue")
 	{local.values.activeCue.set(args[0]);}
	if (address == "/CueLists/NextCue")
 	{local.values.nextCue.set(args[0]);}

// >>> insert Snapshot Labels	
	for (var n = 0; n < snapcount; n++) {
	var no = n+1 ;
	var addr = "/GlobalSnapshots/Name" ;
	var child = "Snapshot"+no ;
	if (address == addr) {
	var snap = args[1] ;
	if (snap == n) 
	{local.values.snapshotLabels.getChild('Snapshot'+no).set(args[0]);} 
	} }
	
// >>> insert Gain Values	
	for (var n = 0; n < chaincount; n++) {
	var no = n+1 ;
	var fadno = n*2+1 ;
	var addr = "/1/fader"+fadno ;
	if (address == addr) {
	var child = "chain"+no+"IN" ;
	local.values.chainGains.getChild(child).set(args[0]);} }
	
	for (var n = 0; n < chaincount; n++) {
	var no = n+1 ;
	var fadno = n*2+2 ;
	var addr = "/1/fader"+fadno ;
	if (address == addr) {
	var child = "chain"+no+"OUT" ;
	local.values.chainGains.getChild(child).set(args[0]);} }
	 
	
}
// =====================================================================
// 			GENEREIC FUNCTIONS
// =====================================================================

/// ===========Snapshots  ==================

function set_snap(val) {
	val = val-1 ;
	local.send("/GlobalSnapshots/Recall", val);
}

function prev_snap() {
	local.send("/Command/GlobalSnapshots/RecallPreviousGlobalSnapshot");
}

function next_snap() {
	local.send("/Command/GlobalSnapshots/RecallNextGlobalSnapshot");
}

function update_snap() {
	local.send("/Command/GlobalSnapshots/UpdateActiveGlobalSnapshot");
}

function add_snap() {
	local.send("/Command/GlobalSnapshots/AddNewGlobalSnapshot");
}

/// ===========Cues  ==================

function cuelist_top() {
	local.send("/Command/CueLists/GoToTop");
}

function cue_down() {
	local.send("/Command/CueLists/StepDown");
}

function cue_up() {
	local.send("/Command/CueLists/StepUp");
}

function set_listcue(list, cue) {
//	val = val-1 ;
	
	local.send("/Cue/Recall", [list , cue]);
}

function set_cue(val) {
//	val = val-1 ;
	local.send("/Cue/Recall", val);
}

function prev_cue() {
	local.send("/Command/CueLists/FirePreviousCue");
}

function next_cue() {
	local.send("/Command/CueLists/FireNextCue");
}

function stop_cues() {
	local.send("/Command/CueLists/StopAllCues");
}

/// =========== Chain Control =============

function add_chain() {
	local.send("/Command/Chains/AddNewChain");
}

function prev_chain() {
	local.send("/Command/PluginWindows/SelectPreviousChain");
}

function next_chain() {
	local.send("/Command/PluginWindows/SelectNextChain");
}

function prev_plug() {
	local.send("/Command/PluginWindows/SelectPreviousPlugin");
}

function next_plug() {
	local.send("/Command/PluginWindows/SelectNextPlugin");
}

function move_up() {
	local.send("/GigPerformer/MoveUp");
}

function move_down() {
	local.send("/GigPerformer/MoveDown");
}

/// =========== View Control =============

function recall_view(val) {
	local.send("/Command/ViewSets/RecallViewSet"+val);
}

function routing_view() {
	local.send("/Command/View/PluginAudioRouting");
}

function wiring_view() {
	local.send("/Command/ViewModes/WireView");
}

function navi_view() {
	local.send("/Command/View/Navigator");
}

function chains_view() {
	local.send("/Command/ViewModes/Chains");
}

function main_view(val) {
	local.send("/Command/ViewModes/"+val);
}

function plug_manager() {
	local.send("/Command/Options/PluginManager");
}

function fullscreen() {
	local.send("/Command/View/FullScreen");
}

/// =========== Main Actions =============

function save() {
	local.send("/Command/Project/SaveProject");
}

function save_as() {
	local.send("/Command/Project/SaveAs");
}

function close() {
	local.send("/Command/Project/CloseProject");
}

function open() {
	local.send("/Command/Project/Open");
}

function quit() {
	local.send("/Command/Application/Quit");
}

function recall_workspace(val) {
	local.send("/Command/Workspaces/RecallWorkspace"+val);
}



