(function () {
    widget = Retina.Widget.extend({
        about: {
                title: "MG-RAST v4 Test Widget",
                name: "metagenome_metazen2",
                author: "Tobias Paczian",
                requires: [ "jquery.timepicker.js", "jquery.datepicker.js", "xlsx.js", "jszip.min.js" ]
        }
    });
    
    widget.setup = function () {
	return [ Retina.load_renderer("tree") ];
    };

    widget.metadata = {};

    widget.activeTabs = { "library-metagenome": true, "library-mimarks-survey": true, "library-metatranscriptome": true };
        
    widget.display = function (wparams) {
        widget = this;

	var container = widget.container = wparams ? wparams.main : widget.container;
	var sidebar = widget.sidebar = wparams ? wparams.sidebar : widget.sidebar;
	sidebar.parentNode.style.display = 'none';
	container.className = "span10 offset1";
	document.getElementById("pageTitle").innerHTML = "metazen";

	html = '<img src="Retina/images/waiting.gif" style="width: 16px; margin-right: 10px;">loading data ...';
	
	container.innerHTML = html;

	widget.loadData();
    };

    // load ontologies, cvs and the metadata template
    widget.loadData = function () {
	var widget = this;

	var promise1 = jQuery.Deferred();
	var promise2 = jQuery.Deferred();
	var promise3 = jQuery.Deferred();
	var promise4 = jQuery.Deferred();
	var promises = [ promise1, promise2, promise3, promise4 ];

	// load excel template
	promises.push(widget.loadExcelTemplate());

	// load controlled vocabularies
	promises.push(jQuery.getJSON(RetinaConfig.mgrast_api+"/metadata/cv", function (data) {
	    var widget = Retina.WidgetInstances.metagenome_metazen2[1];
	    stm.DataStore.cv = data;

	    // sort the versions
	    stm.DataStore.cv.versions.biome = stm.DataStore.cv.versions.biome.sort(Retina.sortDesc);
	    stm.DataStore.cv.versions.feature = stm.DataStore.cv.versions.feature.sort(Retina.sortDesc);
	    stm.DataStore.cv.versions.material = stm.DataStore.cv.versions.material.sort(Retina.sortDesc);

	    widget.currentENVOversion = stm.DataStore.cv.versions.biome[0];	    

	    stm.DataStore.cv.select.timezone = [ [ 'UTC-12:00', '(UTC-12:00) U.S. Baker Island, Howland Island'], [ 'UTC-11:00', '(UTC-11:00) Hawaii, American Samoa'], [ 'UTC-10:00', '(UTC-10:00) Cook Islands'], [ 'UTC-9:30', '(UTC-9:30) Marguesas Islands'], [ 'UTC-9:00', '(UTC-9:00) Gambier Islands'], [ 'UTC-8:00', '(UTC-8:00) U.S. & Canada Pacific Time Zone'], [ 'UTC-7:00', '(UTC-7:00) U.S. & Canada Mountain Time Zone'], [ 'UTC-6:00', '(UTC-6:00) U.S. & Canada Central Time Zone'], [ 'UTC-5:00', '(UTC-5:00) U.S. Eastern Time Zone'], [ 'UTC-4:30', '(UTC-4:30) Venezuela'], [ 'UTC-4:00', '(UTC-4:00) Canada Atlantic Time Zone'], [ 'UTC-3:30', '(UTC-3:30) Newfoundland'], [ 'UTC-3:00', '(UTC-3:00) French Guiana, Falkland Islands'], [ 'UTC-2:00', '(UTC-2:00) South Georgia and the South Sandwich Islands'], [ 'UTC-1:00', '(UTC-1:00) Cape Verde'], [ 'UTC+0:00', '(UTC+0:00) Ireland, London'], [ 'UTC+1:00', '(UTC+1:00) Amsterdam, Berlin'], [ 'UTC+2:00', '(UTC+2:00) Athens, Cairo, Johannesburg'], [ 'UTC+3:00', '(UTC+3:00) Baghdad, Riyadh'], [ 'UTC+3:30', '(UTC+3:30) Tehran'], [ 'UTC+4:00', '(UTC+4:00) Dubai, Moscow'], [ 'UTC+4:30', '(UTC+4:30) Kabul'], [ 'UTC+5:00', '(UTC+5:00) Pakistan'], [ 'UTC+5:30', '(UTC+5:30) Delhi, Mumbai'], [ 'UTC+5:45', '(UTC+5:45) Nepal'], [ 'UTC+6:00', '(UTC+6:00) Bangladesh'], [ 'UTC+6:30', '(UTC+6:30) Cocos Islands'], [ 'UTC+7:00', '(UTC+7:00) Bangkok, Hanoi'], [ 'UTC+8:00', '(UTC+8:00) Beijing, Singapore'], [ 'UTC+8:45', '(UTC+8:45) Eucla'], [ 'UTC+9:00', '(UTC+9:00) Seoul, Tokyo'], [ 'UTC+9:30', '(UTC+9:30) Adelaide'], [ 'UTC+10:00', '(UTC+10:00) Sydney, Melbourne'], [ 'UTC+10:30', '(UTC+10:30) New South Wales'], [ 'UTC+11:00', '(UTC+11:00) Solomon Islands'], [ 'UTC+11:30', '(UTC+11:30) Norfolk Island'], [ 'UTC+12:00', '(UTC+12:00) U.S. Wake Island'], [ 'UTC+12:45', '(UTC+12:45) Chatham Islands'], [ 'UTC+13:00', '(UTC+13:00) Samoa'], [ 'UTC+14:00', '(UTC+14:00) Line Islands' ] ];

	    stm.DataStore.cv.select['boolean'] = [ ['yes', 'yes'], [ 'no','no' ] ];
	    
	    jQuery.getJSON(RetinaConfig.mgrast_api+"/metadata/ontology?name=biome&version="+widget.currentENVOversion, function (data) {
		stm.DataStore.biome = data;
		promise1.resolve();
	    });
	    jQuery.getJSON(RetinaConfig.mgrast_api+"/metadata/ontology?name=feature&version="+widget.currentENVOversion, function (data) {
		stm.DataStore.feature = data;
		promise2.resolve();
	    });
	    jQuery.getJSON(RetinaConfig.mgrast_api+"/metadata/ontology?name=material&version="+widget.currentENVOversion, function (data) {
		stm.DataStore.material = data;
		promise3.resolve();
	    });
	}));

	// load metadata template
	jQuery.ajax( {
	    "dataType": "json",
	    "header": stm.authHeader,
	    "url": RetinaConfig.mgrast_api + '/metadata/template',
	    "success": function (data) {
		var widget = Retina.WidgetInstances.metagenome_metazen2[1];
		widget.metadataTemplate = data;
		var eps = Retina.keys(data.ep).sort();
		widget.eps = eps;
		for (var i=0; i<eps.length; i++) {
		    if (i==0) {
			widget.activeTabs["ep-"+eps[i]] = true;
		    } else {
			widget.activeTabs["ep-"+eps[i]] = false;
		    }
		}
		promise4.resolve();
	    },
	    "error": function (xhr) {
		var widget = Retina.WidgetInstances.metagenome_metazen2[1];
		widget.loadFailed();
	    }
	});
	
	jQuery.when.apply(this, promises).then(function() {
	    Retina.WidgetInstances.metagenome_metazen2[1].showMetadata();
	});
	

    };

    // error during loading of data
    widget.loadFailed = function () {
	var widget = this;

	widget.container.innerHTML = '<div class="alert alert-error" style="width: 400px;">There was an error loading the background data</div>';
    };

    // display the main view
    widget.showMetadata = function () {
	var widget = this;

	widget.getTemplateOrder();

	var html = [];

	// info box
	html.push('<div style="border-radius: 5px; border: 1px solid #ddd; padding: 8px; margin-bottom: 10px; float: left; width: 500px; display: none;" id="cellInfoBox"></div>');
	
	// tab select
	html.push('<div style="border-radius: 5px; border: 1px solid #ddd; padding: 8px; margin-bottom: 10px; float: right;">');
	
	// libraries
	html.push('<div style="float: left;"><div style="font-weight: bold;">libraries</div>');
	html.push('<div style="padding-left: 15px;"><input style="position: relative; bottom: 2px;" type="checkbox"'+(widget.activeTabs['library-metagenome'] ? " checked=checked" : "")+' onclick="Retina.WidgetInstances.metagenome_metazen2[1].updateTabs(this);" name="library-metagenome"> metagenome</div>');
	html.push('<div style="padding-left: 15px;"><input style="position: relative; bottom: 2px;" type="checkbox"'+(widget.activeTabs['library-mimarks-survey'] ? " checked=checked" : "")+' onclick="Retina.WidgetInstances.metagenome_metazen2[1].updateTabs(this);" name="library-mimarks-survey"> mimarks-survey</div>');
	html.push('<div style="padding-left: 15px;"><input style="position: relative; bottom: 2px;" type="checkbox"'+(widget.activeTabs['library-metatranscriptome'] ? " checked=checked" : "")+' onclick="Retina.WidgetInstances.metagenome_metazen2[1].updateTabs(this);" name="library-metatranscriptome"> metatranscriptome</div></div>');
	
	// eps
	html.push('<div style="float: left; margin-left: 20px;"><div style="font-weight: bold;">environmental packages</div><div style="float: left;">');
	for (var i=0; i<widget.eps.length; i++) {
	    html.push('<div style="padding-left: 15px;"><input style="position: relative; bottom: 2px;" type="checkbox"'+(widget.activeTabs["ep-"+widget.eps[i]] ? " checked=checked" : "")+' onclick="Retina.WidgetInstances.metagenome_metazen2[1].updateTabs(this);" name="ep-'+widget.eps[i]+'"> '+widget.eps[i]+'</div>');
	    if (i % 7 == 0 && i > 0) {
		html.push('</div><div style="float: left;">');
	    }
	}
	html.push('</div></div>');

	// ENVO
	html.push('<div style="float: left; margin-left: 20px;" id="envo_select_div"></div>');
	
	html.push('<div style="clear: both;"></div></div><div style="clear: both;"></div>');
	
	// create tabs
	html.push('<ul class="nav nav-tabs" id="metadataEdit" style="margin-bottom: 0px;">');
	html.push('<li class="active"><a href="#project" id="project-li">project</a></li>');
	html.push('<li><a href="#sample">sample</a></li>');
	html.push('<li id="library-metagenome-li"><a href="#library-metagenome">library metagenome</a></li>');
	html.push('<li id="library-mimarks-survey-li"><a href="#library-mimarks-survey">library mimarks-survey</a></li>');
	html.push('<li id="library-metatranscriptome-li"><a href="#library-metatranscriptome">library metatranscriptome</a></li>');
	for (var i=0; i<widget.eps.length; i++) {
	    var safeEP = widget.eps[i].replace(/\|/g, " ").replace(/\s/g, "-");
	    html.push('<li id="ep-'+safeEP+'-li"><a href="#ep-'+safeEP+'">'+ widget.eps[i]+'</a></li>');
	}

	// store div data
	var tables = [];
	
	// create divs
	html.push('</ul><div class="tab-content" style="border: 1px solid #ddd; border-top: none; padding-top: 20px; padding-bottom: 20px;">');
	html.push('<div class="tab-pane active" id="project">project</div>');
	tables.push( { "name": "project", "data": widget.metadataTemplate.project.project } );
	html.push('<div class="tab-pane" id="sample">sample</div>');
	tables.push( { "name": "sample", "data": widget.metadataTemplate.sample.sample } );
	html.push('<div class="tab-pane" id="library-metagenome">metagenome</div>');
	tables.push( { "name": "library-metagenome", "data": widget.metadataTemplate.library.metagenome } );
	html.push('<div class="tab-pane" id="library-mimarks-survey">mimarks-survey</div>');
	tables.push( { "name": "library-mimarks-survey", "data": widget.metadataTemplate.library["mimarks-survey"] } );
	html.push('<div class="tab-pane" id="library-metatranscriptome">metatranscriptome</div>');
	tables.push( { "name": "library-metatranscriptome", "data": widget.metadataTemplate.library.metatranscriptome } );
	for (var i=0; i<widget.eps.length; i++) {
	    var safeEP = widget.eps[i].replace(/\|/g, " ").replace(/\s/g, "-");
	    html.push('<div class="tab-pane" id="ep-'+safeEP+'">'+ widget.eps[i]+'</div>');
	    tables.push( { "name": "ep-"+widget.eps[i], "data": widget.metadataTemplate.ep[widget.eps[i]] } );
	}
	html.push('</div>');
	
	widget.container.innerHTML = html.join('');

	jQuery('#metadataEdit a').click(function (e) {
	    e.preventDefault();
	    jQuery(this).tab('show');
	});

	for (var i=0; i<widget.eps.length; i++) {
	    if (! widget.activeTabs["ep-"+widget.eps[i]]) {
		var safeEP = widget.eps[i].replace(/\|/g, " ").replace(/\s/g, "-");
		jQuery('#ep-'+safeEP+'-li').toggle();
	    }
	}

	var hashTable = {}
	for (var i=0; i<tables.length; i++) {
	    hashTable[tables[i].name] = tables[i].data;
	    var tarray = [];
	    var k = Retina.keys(tables[i].data);
	    var unordered = 0;
	    for (var h=0; h<k.length; h++) {
		tables[i].data[k[h]].name = k[h];
		if (! tables[i].data[k[h]].hasOwnProperty('order')) {
		    tables[i].data[k[h]].order = 999;
		    unordered++;
		}
		if (k[h] == 'envo_release') {
		    widget.envo_cell = tables[i].data[k[h]].order - 1;
		}
		tarray.push(tables[i].data[k[h]]);
	    }
	    if (tables[i].name == 'project') {
		widget.envo_cell += unordered;
	    }
	    tarray.sort(Retina.propSort('order'));
	    var cols = [];
	    for (var h=0; h<tarray.length; h++) {
		cols.push(tarray[h].name);
	    }
	    hashTable[tables[i].name].order = cols;
	    var empty = [];
	    for (var h=0; h<cols.length + 1; h++) {
		empty.push("");
	    }
	    empty = empty.join('</td><td class="editable">');
	    var thtml = [];
	    thtml.push('<table class="excel" onclick="Retina.WidgetInstances.metagenome_metazen2[1].tableClicked(event,\''+tables[i].name+'\');">');
	    thtml.push('<tr><th>&nbsp</th><th>'+cols.join('</th><th>')+'</th><th title="add a new column"><button class="btn btn-mini" onclick="jQuery(this).toggle();jQuery(this.nextSibling).toggle();document.getElementById(\''+tables[i].name+'\').parentNode.scrollLeft=document.getElementById(\''+tables[i].name+'\').parentNode.scrollLeftMax;">+</button><div class="input-append" style="display: none; position: relative; top: 4px;"><input type="text" style="font-size: 12px; height: 12px; width: 100px;"><button class="btn btn-mini" onclick="Retina.WidgetInstances.metagenome_metazen2[1].addMDField(\''+tables[i].name+'\',this.previousSibling.value);">add</button></div></th></tr>');
	    for (var h=0; h<25; h++) {
		thtml.push('<tr><th></th><td class="editable">');
		thtml.push(empty);
		thtml.push('</td></tr>');
	    }
	    thtml.push('</table>');
	    var safeName = tables[i].name.replace(/\|/g, " ").replace(/\s/g, "-");
	    document.getElementById(safeName).innerHTML = thtml.join("");
	}
	widget.tables = hashTable;

	widget.showENVOselect();
    };

    // cell edit helper
    widget.tableClicked = function (event, tablename) {
	var widget = this;
	event = event || window.event;
	
	var cell = event.target;
	if (cell.nodeName == 'TD') {

	    // get the column metadata
	    if (document.getElementById('cellInfoBox').style.display == 'none') {
		jQuery('#cellInfoBox').toggle();
	    }
	    var fieldname = widget.tables[tablename].order[cell.cellIndex - 1];

	    if (fieldname == 'envo_release') {
		return;
	    }
	    
	    var md = widget.tables[tablename][fieldname];
	    if (! md) {
		return;
	    }
	    if (widget.currField) {
		widget.lastField = jQuery.extend(true, {}, widget.currField);
	    }
	    widget.currField = { "table": tablename, "field": fieldname, "data": md };
	    document.getElementById('cellInfoBox').innerHTML = '<p style="font-size: 18px; font-weight: bold;">'+fieldname+'</p><p>'+md.definition+'</p><table style="text-align: left;"><tr><th>MiXS term</th><td>'+(md.hasOwnProperty('mixs') && md.mixs=='1' ? 'yes' : 'no')+'</td></tr><tr><th style="padding-right: 20px;">required field</th><td>'+(md.required=='0' ? 'no' : 'yes')+'</td></tr><tr><th>unit</th><td>'+(md.unit.length ? md.unit : '-')+'</td></tr><tr><th>type</th><td>'+md.type+'</td></tr></table>';
	    
	    // this cell is not in input mode
	    if (! cell.innerHTML.match(/\<input/) && ! cell.innerHTML.match(/\<select/) && ! cell.innerHTML.match(/\<div/)) {
		var value = cell.innerHTML;
		cell.style.backgroundColor = "aliceblue";

		// check what type this field is
		var input;
		
		/* 
		   SELECT BOX
		*/
		if (widget.currField.data.type == 'select' || widget.currField.data.type == 'timezone' || widget.currField.data.type == 'boolean') {
		    input = document.createElement('select');
		    var options;
		    var o = [ '<option value=""></option>' ];
		    if (widget.currField.data.type == 'timezone') {
			options = stm.DataStore.cv.select.timezone;
			options.shift();
		    }
		    else if (widget.currField.data.type == 'boolean') {
			options = stm.DataStore.cv.select['boolean'];
		    }
		    else if (widget.currField.data.type == 'select') {
			var t = widget.currField.field;
			if (t.match(/country/)) {
			    t = 'country';
			}

			if (stm.DataStore.cv.select.hasOwnProperty(t)) {
			    options = stm.DataStore.cv.select[t];
			}
		    }
		    
		    // check if there is an entry in the row above
		    var preval = "";
		    if (cell.parentNode.rowIndex > 1) {
			preval = cell.parentNode.parentNode.childNodes[cell.parentNode.rowIndex - 1].childNodes[cell.cellIndex].innerHTML;
		    }

		    for (var i=0; i<options.length; i++) {
			if (typeof options[i] == 'string') {
			    options[i] = [ options[i], options[i] ];
			}
			var sel = "";
			if (preval == options[i][0]) {
			    sel = " selected=selected";
			}
			o.push('<option'+sel+' value="'+options[i][0]+'">'+options[i][1]+'</option>');
		    }
		    input.innerHTML = o.join('');
		}

		/*
		  TREE
		*/
		else if (widget.currField.data.type == "ontology") {
		    input = document.createElement('div');
		}

		/* 
		   TEXT FIELD
		*/
		else {
		    input = document.createElement('input');
		    input.setAttribute('type', 'text');
		    input.setAttribute('value', value);
		}

		// remember old data
		input.setAttribute('data-old', value);
		input.setAttribute('id', 'currInputField');

		// event listeners
		if (! (widget.currField.data.type == 'ontology' || widget.currField.data.type == 'time' || widget.currField.data.type == 'date')) {
		    
		    // keypress listener
		    input.addEventListener('keypress', function (event) {
			var widget = Retina.WidgetInstances.metagenome_metazen2[1];
			event = event || window.event;
			
			// validation
			var s = String.fromCharCode(event.charCode);
			if (s.match(/[\u0020-\u007e\u00a0-\u00ff]/)) {
			    if (widget.currField.data.type == 'float' || widget.currField.data.type == 'coordinate') {
				if (! s.match(/[\d\.-]/ ) || this.value.indexOf(".") > -1 && s == ".") {
				    event.preventDefault();
				    return false;
				}
			    } else if (widget.currField.data.type == 'int') {
				if (! s.match(/\d/)) {
				    event.preventDefault();
				    return false;
				}
			    }
			}
			
			// enter is pressed
			if (event.keyCode == '13') {
			    var p = this.parentNode.parentNode.parentNode.childNodes;
			    
			    // there are not enough rows, append a new one
			    if (p.length <= this.parentNode.parentNode.rowIndex + 1) {
				var cols = this.parentNode.parentNode.childNodes;
				var empty = [];
				for (var h=0; h<cols.length - 1; h++) {
				    empty.push("");
				}
				empty = '<th></th><td class="editable">'+empty.join('</td><td class="editable">')+'</td>';
				var r = document.createElement('tr');
				r.innerHTML = empty;
				this.parentNode.parentNode.parentNode.appendChild(r);
			    }
			    var next = p[this.parentNode.parentNode.rowIndex + 1].childNodes[this.parentNode.cellIndex];
			    
			    next.click();
			}
			
			// escape is pressed
			else if (event.keyCode == '27') {
			    this.parentNode.innerHTML = this.getAttribute('data-old');
			    if (document.getElementById('cellInfoBox').style.display == '') {
				jQuery('#cellInfoBox').toggle();
			    }
			}
			
			// tab is pressed
			else if (event.keyCode == '9') {
			    event.preventDefault();
			    
			    var p = this.parentNode.parentNode.parentNode.childNodes;
			    
			    // check if there is a next column
			    if (p.length > this.parentNode.cellIndex) {
				var next = this.parentNode.parentNode.childNodes[this.parentNode.cellIndex + 1];
				next.click();
			    }
			}
		    });
		    
		    // cell loses focus
		    input.addEventListener('blur', function (event) {
			var widget = Retina.WidgetInstances.metagenome_metazen2[1];
			event = event || window.event;
			this.parentNode.style.backgroundColor = "white";
			Retina.WidgetInstances.metagenome_metazen2[1].updateCell();
			if (document.getElementById('cellInfoBox').style.display == '') {
			    jQuery('#cellInfoBox').toggle();
			}
		    });
		}

		// check for time field
		if (widget.currField.data.type == "time") {
		    var t;
		    if (cell.innerHTML.length) {
			t = cell.innerHTML;
		    } else {
			t = '00:00:00';
			if (cell.parentNode.rowIndex > 1 && cell.parentNode.parentNode.childNodes[cell.parentNode.rowIndex - 1].childNodes[cell.cellIndex].innerHTML.length) {
			    t = cell.parentNode.parentNode.childNodes[cell.parentNode.rowIndex - 1].childNodes[cell.cellIndex].innerHTML;
			}
		    }
		    cell.innerHTML = "";
		    var d = document.createElement('div');
		    d.setAttribute('class', 'input-append bootstrap-timepicker-component');
		    d.setAttribute('style','margin-bottom: 0px;');
		    d.appendChild(input);
		    cell.appendChild(d);
		    jQuery('#currInputField').timepicker({'showMeridian': false, 'minuteStep': 1, 'showSeconds': true,'defaultTime':t});
		    input.addEventListener('blur', function (event) {
			var widget = Retina.WidgetInstances.metagenome_metazen2[1];
			event = event || window.event;
			Retina.WidgetInstances.metagenome_metazen2[1].updateCell();
			if (document.getElementById('cellInfoBox').style.display == '') {
			    jQuery('#cellInfoBox').toggle();
			}
		    });
		    input.addEventListener('keypress', function (event) {
			var widget = Retina.WidgetInstances.metagenome_metazen2[1];
			event = event || window.event;

			// escape
			if (event.keyCode == '27') {
			    this.parentNode.parentNode.style.backgroundColor = "white";
			    this.parentNode.parentNode.innerHTML = this.getAttribute('data-old');
			    if (document.getElementById('cellInfoBox').style.display == '') {
				jQuery('#cellInfoBox').toggle();
			    }
			}

			// backspace
			else if (event.keyCode == '8') {
			    event.preventDefault();
			    Retina.WidgetInstances.metagenome_metazen2[1].updateCell(true);
			    if (document.getElementById('cellInfoBox').style.display == '') {
				jQuery('#cellInfoBox').toggle();
			    }
			}
		    });

		} else {
		    cell.innerHTML = "";
		    cell.appendChild(input);
		}

		// focus the input
		input.focus();
		if (typeof input.select == 'function') {
		    input.select();
		}

		// check for tree
		if (widget.currField.data.type == "ontology") {
		    if (stm.DataStore.hasOwnProperty(widget.currField.field)) {
			var val = input.getAttribute('data-old');
			if (! val.length) {
			    if (cell.parentNode.rowIndex > 1 && cell.parentNode.parentNode.childNodes[cell.parentNode.rowIndex - 1].childNodes[cell.cellIndex].innerHTML.length) {
				val = cell.parentNode.parentNode.childNodes[cell.parentNode.rowIndex - 1].childNodes[cell.cellIndex].innerHTML;
			    }
			}
			Retina.Renderer.create('tree', {
			    target: document.getElementById('currInputField'),
			    data: stm.DataStore[widget.currField.field],
			    width: 0,
			    height: 0,
			    buttonText: "set",
			    showCollapseAllButton: false,
			    showExpandAllButton: false,
			    callback: widget.ontologySet }).render();
			input.setAttribute('class', '');
			cell.setAttribute('style', '');
			var inp = document.getElementById('tree_search_input_1');
			inp.setAttribute('style', 'width: 144px; height: 24px; font-size: 12px; border: 1px solid #ddd; top: 0px; padding-left: 5px;');
			inp.value = val;
			inp.addEventListener('keypress', function (e) {
			    e = e || window.event;

			    // escape
			    if (e.keyCode == 27) {
				var p = this.parentNode.parentNode;
				p.style.backgroundColor = "white";
				p.parentNode.innerHTML = p.getAttribute('data-old');
				if (document.getElementById('cellInfoBox').style.display == '') {
				    jQuery('#cellInfoBox').toggle();
				}
				Retina.RendererInstances.tree = [ Retina.RendererInstances.tree[0] ];
			    }
			});		     
			inp.focus();
		    } else {
			alert('unknown ontology');
		    }
		}

		// check for date field
		if (widget.currField.data.type == "date") {
		    var nowTemp = new Date();
		    var d = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
		    var dstring = [d.getFullYear(),
				   (d.getMonth()+1).padLeft(),
				   d.getDate().padLeft()].join('-');
		    if (! input.value.length && input.parentNode.parentNode.rowIndex > 1) {
			if (input.parentNode.parentNode.parentNode.childNodes[input.parentNode.parentNode.rowIndex - 1].childNodes[input.parentNode.cellIndex].innerHTML.length) {
			    input.value = input.parentNode.parentNode.parentNode.childNodes[input.parentNode.parentNode.rowIndex - 1].childNodes[input.parentNode.cellIndex].innerHTML;
			}
		    }
		    input.setAttribute('value', input.value.length ? input.value : dstring);
		    jQuery('#currInputField').datepicker({format: 'yyyy-mm-dd'}).on('changeDate', function(ev) {
			jQuery('#currInputField').datepicker('hide');
			input.parentNode.style.backgroundColor = "white";
			input.parentNode.innerHTML = input.value;
		    });
		    jQuery('#currInputField').datepicker('show');
		}

		// store a reference to the current input element
		widget.currentInputElement = input;
	    }
	}
    };

    widget.ontologySet = function (node) {
	var widget = Retina.WidgetInstances.metagenome_metazen2[1];
	var rend = this;
	var field = document.getElementById('currInputField');
	Retina.RendererInstances.tree = [ Retina.RendererInstances.tree[0] ];

	widget.updateCell(node.label, field.parentNode.parentNode.rowIndex, field);
    };

    // a cell has new data
    widget.updateCell = function (clear) {
	var widget = this;

	
	var val = widget.currentInputElement.value;
	if (clear) {
	    val = "";
	}
	var p = widget.currentInputElement.parentNode; // cell
	var row = p.parentNode.rowIndex - 1;
	
	// perform validation
	var valid = true;
	if (val.length) {
	    if (widget.lastField.data.type == 'url' && ! val.match(/^http(s?)\:\/\//)) {
		alert('invalid url');
		val = "";
		valid = false;
	    }
	    if (widget.lastField.data.type == 'email' && ! val.match(/\@/)) {
		alert('invalid email');
		val = "";
		valid = false;
	    }
	    if (widget.lastField.data.type == 'coordinate' && Math.abs(parseFloat(val)) > 180) {
		alert('coordinates only range from -180 to 180 degrees');
		val = "";
		valid = false;
	    }
	} else {
	    valid = false;
	}

	if (valid) {
	    if (! widget.metadata.hasOwnProperty(widget.lastField.table)) {
		widget.metadata[widget.lastField.table] = {};
	    }
	    
	    if (! widget.metadata[widget.lastField.table].hasOwnProperty(widget.lastField.field)) {
		widget.metadata[widget.lastField.table][widget.lastField.field] = [];
	    }
	    
	    widget.metadata[widget.lastField.table][widget.lastField.field][row] = val;
	}

	p.innerHTML = val;
	p.setAttribute('style','');
    };

    // ENVO
    widget.selectENVO = function (sel) {
	var widget = this;

	widget.currentENVOversion = sel.options[sel.selectedIndex].value;

	var promise1 = jQuery.Deferred();
	var promise2 = jQuery.Deferred();
	var promise3 = jQuery.Deferred();
	var promises = [ promise1, promise2, promise3 ];
	
	jQuery.getJSON(RetinaConfig.mgrast_api+"/metadata/ontology?name=biome&version="+widget.currentENVOversion, function (data) {
	    stm.DataStore.biome = data;
	    promise1.resolve();
	});
	jQuery.getJSON(RetinaConfig.mgrast_api+"/metadata/ontology?name=feature&version="+widget.currentENVOversion, function (data) {
	    stm.DataStore.feature = data;
	    promise2.resolve();
	});
	jQuery.getJSON(RetinaConfig.mgrast_api+"/metadata/ontology?name=material&version="+widget.currentENVOversion, function (data) {
	    stm.DataStore.material = data;
	    promise3.resolve();
	});

	jQuery.when.apply(this, promises).then(function() {
	    var widget = Retina.WidgetInstances.metagenome_metazen2[1];
	    widget.showENVOselect();
	});
	
	document.getElementById('envo_select_div').innerHTML = "<div class='alert alert-info'><img src='Retina/images/waiting.gif' style='width: 24px;'> loading selected ENVO version</div>";
    };

    widget.showENVOselect = function () {
	var widget = this;

	var select = document.getElementById('envo_select_div');

	var html = "<p style='font-weight: bold;'>ENVO version</p><div class='input-append'><select style='width: 110px;'>";
	for (var i=0; i<stm.DataStore.cv.versions.biome.length; i++) {
	    var sel = "";
	    if (stm.DataStore.cv.versions.biome[i] == widget.currentENVOversion) {
		sel = " selected=selected";
	    }
	    html += "<option"+sel+">"+stm.DataStore.cv.versions.biome[i]+"</option>";
	}
	html += "</select><button class='btn' onclick='Retina.WidgetInstances.metagenome_metazen2[1].selectENVO(this.previousSibling);'>select</button></div>";
	select.innerHTML = html;

	select.style.display = "";

	document.getElementById('project').firstChild.firstChild.childNodes[1].childNodes[widget.envo_cell].innerHTML = widget.currentENVOversion;
	if (! widget.metadata.hasOwnProperty('project')) {
	    widget.metadata.project = {};
	}
	widget.metadata.project.envo_release = [ widget.currentENVOversion ];
    };

    // tab activation
    widget.updateTabs = function (checkbox) {
	var widget = this;

	var name = checkbox.getAttribute('name').replace(/\|/g, " ").replace(/\s/g, "-");
	var sel = checkbox.checked;
	
	widget.activeTabs[name] = sel;

	jQuery('#'+name+"-li").toggle();
	document.getElementById('project-li').click();
    };

    // add a new misc param
    widget.addMDField = function (name, value) {
	var widget = this;
	
    };

    // Excel export / import
    widget.loadExcelTemplate = function () {
	var widget = this;

	widget.excelPromise = jQuery.Deferred();
	var base_url = "data/MGRAST_MetaData_template_1.7.xlsx";

	JSZipUtils.getBinaryContent(base_url, function(err, data) {
	    if(err) {
		throw err;
	    }
	    var zip = new JSZip();
	    zip.loadAsync(data).then(function(zip) {
		xlsx(zip).then(function (workbook) {
		    Retina.WidgetInstances.metagenome_metazen2[1].excelWorkbook = workbook;
		    Retina.WidgetInstances.metagenome_metazen2[1].excelPromise.resolve();
		});
	    });
	});

	return widget.excelPromise;
    };

    widget.exportExcel = function (toSHOCK) {
    	var widget = this;

    	var wb = jQuery.extend(true, {}, widget.excelWorkbook);
	var data = widget.metadata;

	if (! (data.hasOwnProperty('project') && data.hasOwnProperty('sample'))) {
	    alert('you must fill out the project and the sample sheet');
	    return;
	}
	
	for (var h=1; h<wb.worksheets.length; h++) {
	    var dname = wb.worksheets[h].name;
	    dname = dname.replace(/\s/, "-");
	    if (data.hasOwnProperty(dname)) {
		for (var i=0; i<wb.worksheets[h].maxCol; i++) {
    		    if (data[dname].hasOwnProperty(wb.worksheets[h].data[0][i].value)) {
			var vals = data[dname][wb.worksheets[h].data[0][i].value];
			for (var j=2; j<(vals.length+2); j++) {
    			    wb.setCell(h, i, j, vals[j-2]);
			}
    		    }
    		}
		for (var i in data[dname]) {
    		    if (data[dname].hasOwnProperty(i) && i.match(/^misc_param_\d+/)) {
    			wb.setCell(h, wb.worksheets[h].maxCol, 0, i);
			var vals = data[dname][i];
			for (var j=2; j<(vals.length+2); j++) {
    			    wb.setCell(h, wb.worksheets[h].maxCol - 1, j, vals[j-2]);
			}
    		    }
    		}
	    } else {
		wb.removeWorksheet(h);
		h--;
	    }
	}

	// export to user inbox
	if (toSHOCK) {
	    
	    xlsx(wb, 'blob').then(function(data) {
		var widget = Retina.WidgetInstances.metagenome_metazen2[1];
		
		var url = RetinaConfig.shock_url+'/node';
		
		// set up the node
		var attributes = new Blob([ JSON.stringify({ "type": "inbox", "user": stm.user.login, "id": stm.user.id, "email": stm.user.email }) ], { "type" : "text\/json" });
	
		var xlsfile = data.base64;
		var form = new FormData();
		var filename = widget.metadata.project.project_name[0]+".xlsx";
		form.append('attributes', attributes);
		form.append('file_name', filename);
		form.append('upload', xlsfile);

		jQuery.ajax(url, {
	    	    contentType: false,
	    	    processData: false,
	    	    data: form,
	    	    success: function(data) {

			// add ACLs for mgrast user
			jQuery.ajax({ url: RetinaConfig.shock_url + "/node/" + data.data.id + "/acl/all?users=mgrast",
				      nodeid: data.data.id,
				      success: function(data) {

					  // data is uploaded to the inbox, issue validation call
	    				  var url = RetinaConfig.mgrast_api+'/metadata/validate';
					  jQuery.ajax(url, {
					      data: { "node_id": this.nodeid },
					      success: function(data){
						  console.log(data);
					      },
					      error: function(jqXHR){
						  console.log('error validate');
						  console.log(jqXHR);
					      },
					      crossDomain: true,
					      headers: stm.authHeader,
					      type: "POST"
					  });
					  
				      },
				      error: function(jqXHR) {
					  console.log('error adding acl');
					  console.log(jsXHR);
					  
				      },
				      crossDomain: true,
				      headers: stm.authHeader,
				      type: "PUT"
				    });
	    	    },
	    	    error: function(jqXHR){
	    		console.log('error upload');
			console.log(jqXHR);
	    	    },
	    	    crossDomain: true,
	    	    headers: stm.authHeader,
	    	    type: "POST"
		});
		
	    });
	}

	// export to xlsx file
	else {
    	    xlsx(wb).then(function(data) {
    		stm.saveAs(data.base64, "metadata.xlsx", true, "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,");
    	    });
	}
    };

    widget.getTemplateOrder = function () {
	var widget = this;

	var wb = jQuery.extend(true, {}, widget.excelWorkbook);
	for (var h=1; h<wb.worksheets.length; h++) {
	    var ws = wb.worksheets[h];
	    var x1 = ws.name.split(/\s/)[0];
	    var x2 = ws.name.substr(ws.name.indexOf(" ") > -1 ? ws.name.indexOf(" ") + 1 : 0);
	    for (var i=0; i<ws.maxCol; i++) {
		if (widget.metadataTemplate[x1][x2].hasOwnProperty(ws.data[0][i].value)) {
		    widget.metadataTemplate[x1][x2][ws.data[0][i].value].order = i;
    		}
	    }
	}
    };

    
})();