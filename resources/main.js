/*
new Vue({
          el: "#vuec3chart",
          mounted: function() {
              c3.generate({
              bindto: this.$el,
              data: {
                  type: "area",
                  x: "x",
                  xFormat: "%H:%M",
                  columns: [
                     [
                       "x",
                       "12:38",
                       "12:39",
                       "12:40",
                       "12:41",
                       "12:42",
                       "12:43",
                       "12:44",
                       "12:45",
                       "12:46",
                       "12:47",
                       "12:48",
                       "12:49",
                       "12:50",
                       "12:51",
                       "12:52",
                       "12:53",
                       "12:54",
                       "12:55",
                       "12:56",
                       "12:57",
                       "12:58",
                       "12:59",
                     ],
                     [
                       "write",
                       9884,
                       1353,
                       2243,
                       3302,
                       3443,
                       5731,
                       4163,
                       8329,
                       8809,
                       3145,
                       5843,
                       9190,
                       0899,
                       6873,
                       7113,
                       0870,
                       0700,
                       8144,
                       8624,
                       9513,
                       6307,
                       6307,
                     ],
                     [
                       "read",
                       848,
                       536,
                       432,
                       024,
                       432,
                       312,
                       632,
                       296,
                       096,
                       456,
                       432,
                       904,
                       992,
                       736,
                       136,
                       704,
                       808,
                       440,
                       240,
                       136,
                       072,
                       073,
                     ]
                  ]             
                },              
            axis: {
              x: {
                  type: "timeseries",
                  tick: {
                      format: '%H:%M'
                  }
              }
            }
      });
    }
  });
  */

  function graphSeries() {
    c3.generate({
            bindto: "#vuec3chart",
            data: {
                type: "area",
                x: "x",
                xFormat: "%H:%M",
                columns: [
                   [
                     "x",
                     "12:38",
                     "12:39",
                     "12:40",
                     "12:41",
                     "12:42",
                     "12:43",
                     "12:44",
                     "12:45",
                     "12:46",
                     "12:47",
                     "12:48",
                     "12:49",
                     "12:50",
                     "12:51",
                     "12:52",
                     "12:53",
                     "12:54",
                     "12:55",
                     "12:56",
                     "12:57",
                     "12:58",
                     "12:59",
                   ],
                   [
                     "write",
                     9884,
                     1353,
                     2243,
                     3302,
                     3443,
                     5731,
                     4163,
                     8329,
                     8809,
                     3145,
                     5843,
                     9190,
                     0899,
                     6873,
                     7113,
                     0870,
                     0700,
                     8144,
                     8624,
                     9513,
                     6307,
                     6307,
                   ],
                   [
                     "read",
                     848,
                     536,
                     432,
                     024,
                     432,
                     312,
                     632,
                     296,
                     096,
                     456,
                     432,
                     904,
                     992,
                     736,
                     136,
                     704,
                     808,
                     440,
                     240,
                     136,
                     072,
                     073,
                   ]
                ]             
              },              
          axis: {
            x: {
                type: "timeseries",
                tick: {
                    format: '%H:%M'
                }
            }
          }
    });
  }

  (function () {
      const vscode = acquireVsCodeApi();
      console.log("**** This is from the 'init' entry point (to call it something) ****");
      const counter = document.getElementById("lines-of-code-counter");
      const commMsg = document.getElementById("latest-comm");
      const shouldDisplay = document.getElementById("container");
      let count = 0;
      setInterval( () => {
          counter.textContent = count++;
          if ((count % 5) === 0 && count < 10) {
              console.log("Sending a message to the host...");
              vscode.postMessage({
                  command: 'alert',
                  text: 'communicating with host'
              });
          }
      }, 500);

      // first chart
      graphSeries();

     let data = JSON.parse(document.getElementById("dataDiv").textContent);
     let data2 = JSON.parse(document.getElementById("dataDiv2").textContent);
      // a second chart
      var chart = c3.generate({
          bindto: '#visitor',
          data: {
              columns : data,
              type: 'donut',
              tooltip: {
                  show: true
              }
          },
          donut: {
              label: {
                  show: false
              },
              title: "Modules",
              width: 35,
          },
          legend: {
              hide: true
          },
          color: {
              pattern: ['#40c4ff', '#2961ff', '#ff821c', '#7e74fb']
          }
      });

      var dataset = [ 5, 10, 15, 20, 25 ];
      var chart = c3.generate({
       bindto: '#chart',
       data: {
         columns: [
           ['data1', 30, 200, 100, 400, 150, 250],
           ['data2', 50, 20, 10, 40, 15, 25]
         ],
         axes: {
           data2: 'y2' // ADD
         }
       },
       axis: {
         y2: {
           show: true // ADD
         }
       }
       });

       var chart = c3.generate({
          bindto: '#chart2',
          data: {
              json: data2
          }
      });

     //  Handle a message inside the webview
     document.getElementById("message").textContent = "hello";
      window.addEventListener('message', event => {
          const message = event.data; // the message data the host sent
          //shouldDisplay.style.visibility = "visible";
          document.getElementById("message").textContent = "testing";

          counter.textContent = 10;
          commMsg.textContent = "Just received a message at time [" + count + "]";
          console.log("This should be displayed in the developer tools if they're open");

      });
  })();

  function linkRenderer(params) {
    // Need to check data when grouping (see https://www.ag-grid.com/javascript-grid-cell-rendering-components/#cell-renderers-and-row-groups)
    if (!params.node.group) {
        // data exists, so we can access it
        return `<a href="javascript:testLink('${params.value}')">${params.value}</a>`;
    } else {
        // `null` signals ag-grid to display a blank cell
        return null;
    }
};

function testLink(functionName) {
    console.log(`Should be redirecting to function [${functionName}]`)
}

var columnDefs = [
    {headerName: "Function", field: 'function', cellRenderer:'agGroupCellRenderer'},
    {headerName: "CPU Time", field: "cpu_time"},
    {headerName: "Module", field: "module"},
    {headerName: "Function (Full)", field: "function_full", cellRenderer : linkRenderer},
    {headerName: "Source File", field: "source_file"},
    {headerName: "Start Address", field: "start_address"}
];

var gridOptions = {
    columnDefs: columnDefs,
    enableSorting: true,
    animateRows: true,
    enableFilter: true,
    enableColResize: true,
    rowSelection: 'single',
    onSelectionChanged: onSelectionChanged,
    getNodeChildDetails: getNodeChildDetails
};

function onSelectionChanged() {
    var selectedRows = gridOptions.api.getSelectedRows();
    var selectedRowsString = '';
    selectedRows.forEach( function(selectedRow, index) { // this should only be one
        if (index!==0) {
            selectedRowsString += ', ';
        }
        selectedRowsString += selectedRow.source_file;
    });
    console.log(`The selected row is [${selectedRowsString}]`);
}

function getNodeChildDetails(rowItem) {
    if (rowItem.children) {
        return {
            group: true,
            children: rowItem.children,
            // the key is used by the default group cellRenderer
            key: rowItem.function,

        };
    } else {
        return null;
    }
}

function onTextboxFilterChanged() {
    var value = document.getElementById('filter-textbox').value;
    gridOptions.api.setQuickFilter(value);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    var dataTxt = document.querySelector('#dataDiv2').textContent;
    var data = JSON.parse(dataTxt);

    new agGrid.Grid(gridDiv, gridOptions);
    gridOptions.api.sizeColumnsToFit();
    gridOptions.api.setRowData(data);
    gridOptions.api.setRowData(JSON.parse(data));
});
