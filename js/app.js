console.log("Plotly-3 here")
// Samples.json is a dictionary with the following items:
// {
//   "names": [integers, presumably anonymous people]
//   "metadata": [ ... the following dictionaries ...
// 		              {"id", "ethnicity", "gender", "age", "location", "bbtype", "wfreq"} 
// 	             ]
//   "samples: [ ... the following dictionaries ...  
// 		              { "id": integer 
// 		                "otu_ids": [ integers, variable-length ]
//   		              "sample_values": [ integers, variable-length ]
//   		              "otu_labels": [ strings, variable-length ]
//                  }
//             ]
// } 

// Javascript color scale from 0% to 100%, rendering it from 
// red to yellow to green
// grabbed from https://gist.github.com/mlocati/7210513
function perc2color(perc) {
	var r, g, b = 0;
	if(perc < 50) {
		r = 255;
		g = Math.round(5.1 * perc);
	}
	else {
		g = 255;
		r = Math.round(510 - 5.10 * perc);
	}
	var h = r * 0x10000 + g * 0x100 + b * 0x1;
	return '#' + ('000000' + h.toString(16)).slice(-6);
}

function unpack(rows, key) {
    return rows.map(function(row) {
      return row[key];
    });
}

function optionChanged(val) {
  d3.select(".panel-body").html("") 
  plot_subject(val);
}

function init() {
  plot_subject(940);
}

function plot_subject(subject_param) {

  console.log(`plot_subject(${subject_param})`);   //  debug

  d3.json("samples.json").then((data) => {
    metadata_ids = unpack(data.metadata, 'id')
    metadata_ids.forEach(otu_id => 
      d3.select("#selDataset").append("option").text(otu_id));

    // *********************************************************************
    // ** get the selected subject's data
    // ** which will be used below
    // *********************************************************************
    var subject = subject_param;

    console.log(`internal subject value: (${subject})`);   //  debug

    var subject_metadata = data.metadata.find(function(element) {
      return element['id'] == subject})
    var subject_sample = data.samples.find(function(element) {
      return element['id'] == subject})
    var all_otu_ids_arr = subject_sample['otu_ids']
    var all_sample_values_arr = subject_sample['sample_values']
    max_otu_id = Math.max.apply(Math, all_otu_ids_arr); 
    min_otu_id = Math.min.apply(Math, all_otu_ids_arr); 
    var color_array = all_otu_ids_arr.map(function(otu_id) {
      perc = 100 * (otu_id - min_otu_id) / (max_otu_id - min_otu_id)
      return perc2color(perc);
    });
    console.log(wfreq)
    
    // data for only the top 10 OTUs
    var top_otu_ids_labels_arr = []
    var top_sample_values_arr = []
    var top_otu_labels_arr = []
    for (var i=0; i<10; i++) {
      top_otu_ids_labels_arr.push('OTU ' + subject_sample['otu_ids'][i].toString())
      top_sample_values_arr.push(subject_sample['sample_values'][i])
      top_otu_labels_arr.push(subject_sample['otu_labels'][i])
    }

    // washing frequency
    var wfreq = data.metadata.find(function(element) {
      return element['id'] == subject})['wfreq'];


    // *********************************************************************
    // ** Metadata of selected subject
    // *********************************************************************
    Object.entries(subject_metadata).forEach(([key, value]) => {
      // add the key and value to the html element
      d3.select(".panel-body").append("div").text(`${key}:  ${value}`);
    });

    // *********************************************************************
    // ** Bar chart of top 10 OTU's of the selected subject
    // *********************************************************************
    var trace1 = {
      y: top_otu_ids_labels_arr.reverse(),
      x: top_sample_values_arr.reverse(),
      text: top_otu_labels_arr.reverse(),
      type: "bar",
      orientation: "h"
      };

    var data = [trace1];

    // Apply the group barmode to the layout
    var layout = {
      barmode: "group"
    };

    // Render the plot to the div tag with id "bar"
    Plotly.newPlot("bar", data, layout);

    // *********************************************************************
    // ** Bubble chart of the selected subject
    // *********************************************************************
    var trace1 = {
      x: all_otu_ids_arr,
      y: all_sample_values_arr,
      mode: 'markers',
      marker: {
        size: all_sample_values_arr,
        color: color_array
      }
    };
    
    var data = [trace1];
    
    var layout = {
    };
    
    Plotly.newPlot('bubble', data, layout);


  });  // end of d3.json()
}   // end of plot_subject()

init();
