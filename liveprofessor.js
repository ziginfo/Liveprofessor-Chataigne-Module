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

Snap = local.values.addStringParameter("Active Snapshot", "Shows Active Snapshot Name","Recall Snapshot First");
activeCue = local.values.addStringParameter("Active Cue", "Shows Active Cue Name","Active Cue");
nextCue = local.values.addStringParameter("Next Cue", "Shows Next Cue Name","Next Cue");
cpu = local.values.addFloatParameter("CPU Load", "Shows the actual CPU-Load in %", 0, 0, 100);
		cpu.setAttribute("readonly" ,true);


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
 	
 // >>> CPU-Charge
 	if (address == "/DSPmeter")
 	{local.values.cpuLoad.set(args[0]);}	

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

//========================================================================
//					KEEP ALIVE
//========================================================================

function update(deltaTime) {
	var now = util.getTime();
	if(now > TSSendAlive) {
		TSSendAlive = now + 2;
		keepAlive(); }
}

function keepAlive() {
	local.send("/StatusPoll");
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

function chains_view() {
	local.send("/Command/ViewModes/Chains");
}

function main_view(val) {
	local.send("/Command/ViewModes/"+val);
}

function plug_manager() {
	local.send("/Command/Options/PluginManager");
}

function shortcuts() {
	local.send("/Command/Options/KeyboardShortcuts");
}

function program_options() {
	local.send("/Command/Options/ProgramOptions");
}

function project_options() {
	local.send("/Command/Options/ProjectOptions");
}

function fullscreen() {
	local.send("/Command/View/FullScreen");
}

/// =========== Show Hide Panels =============

function audio_panel() {
	local.send("/Command/View/PluginAudioRouting");
}

function midi_panel() {
	local.send("/Command/View/PluginMidiPanel");
}

function plugsnap_panel() {
	local.send("/Command/View/PluginSnapshotPanel");
}

function plugpreset_panel() {
	local.send("/Command/View/PluginPresetList");
}

function navi_panel() {
	local.send("/Command/View/Navigator");
}

function snapshots_panel() {
	local.send("/Command/View/GlobalSnapshotsPanel");
}

function cuelists_panel() {
	local.send("/Command/View/CueListPanel");
}

function transport_panel() {
	local.send("/Command/View/TransportPanel");
}

function workspace_panel() {
	local.send("/Command/View/WorkspacePanel");
}

/// =========== Main Actions =============

function save() {
	local.send("/Command/Project/SaveProject");
}

function save_as() {
	local.send("/Command/Project/SaveAs");
}

function rename_project() {
	local.send("/Command/Project/RenameProject");
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



