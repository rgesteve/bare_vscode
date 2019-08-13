  (function () {
      const vscode = acquireVsCodeApi();
      window.vscode = vscode;

      /*
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
      */

      var pdataElem = document.getElementById("profileData");
      let profileData = undefined;
      if (!pdataElem) {
        console.log("----> Something element with the element<----");
        return;
      }

      try {
        //let profileData = JSON.parse(document.getElementById("profileData").textContent);
        profileData = JSON.parse(pdataElem.textContent);

        let moduleDistribution = profileData.module_attribution;
        let executionTime = profileData.total_time;
        var modules = [];
        var othersFraction = 0;

        moduleDistribution.forEach((element) => {
            if (element.fraction > 1) {
                modules.push(Array(element.module, element.fraction));
            } else {
                othersFraction += element.fraction;
            }
        });
        modules.push(Array('others', othersFraction));

        var time = ['x', 0];
        var cpu = ['cpu', 0];

        profileData.cpu.forEach((element) => { 
           cpu.push(element);
        });
        
        var i = 0;
        profileData.cpu.forEach(() => {
            i += executionTime / (cpu.length - 2);
            //console.log(`i is ${i}`)
            time.push( i.toFixed(3) );
        });
        console.log(`Time array length ${time.length}`);
        console.log(`CPU array length ${cpu.length}`);

        /*
        // CPU utilization timeline chart
        var chart = c3.generate({
            bindto: '#timeline',
            data: {
                x:'x',
                columns: [time, cpu],
                type: 'area-spline'
            },
            axis: {
                x: {
                    padding: {left: 0},
                    min: 0
                }
            }
        });
        */

        // Modules chart
        var chart = c3.generate({
            bindto: '#modules',

            data: {
                columns : modules,
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
                hide: false,
                position: 'right'
            }
        });

      } catch (err) {
        console.log("----> couldn't parse contents of profiledata, or couldn't find data in the right format <-----------");
      }

      window.addEventListener('message', event => {
          const message = event.data; // the message data the host sent
          console.log("This should be displayed in the developer tools if they're open");
          if (!'command' in message) {
              console.log("Got an unexpected command");
              return;
          }

          switch(message.command) {
              case 'newdata':
                  let data = message.payload;
                  if (! 'module_attribution' in data) {
                      console.log(`Got new data, but not in the form I was expecting, keys: << ${Object.keys().join(",")} >>.`);
                  } else {
                    let modattrib = data['module_attribution'];
                    let mods = [];
                    let restfrac = 0;
                    modattrib.forEach((element) => {
                        console.log(`Reading from data: module: ${element.module}, fraction: ${element.fraction}.`);
                        if (element.fraction > 1) {
                            mods.push(Array(element.module, element.fraction));
                        } else {
                            restfrac += element.fraction;
                        }
                    });
                    mods.push(Array('others', restfrac));
                    chart.unload();
                    chart.load({
                        columns : mods,
                        type: 'donut',
                        tooltip: { show: true }
                    });
                  }
                  break;
              default:
                  console.log(`Don't now how to handle command type: ${message.command}.`);
                  return;
          }

          // should acknowledge if could display data
          vscode.postMessage({
            command: 'alert',
            text: 'communicating with host'
        });
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

var minRowHeight = 5;
var currentRowHeight = minRowHeight;
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

    if (window.vscode) {

        window.vscode.postMessage({
            command: 'should_open',
            text: selectedRowsString
        });
        console.log("Should have just sent message to host");
    } else {
        console.log("Cannot find vscode instance");
    }
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
    //ag-grid setting up the appropriate theme
    if(document.body.className == "vscode-light"){
        document.getElementById("myGrid").classList.remove('ag-theme-dark');
        document.getElementById("myGrid").classList.add('ag-theme-blue');
    } else {
        document.getElementById("myGrid").classList.remove('ag-theme-blue');
        document.getElementById("myGrid").classList.add('ag-theme-dark');
    }   
    var gridDiv = document.querySelector('#myGrid');  
    var dataTxt = document.querySelector('#profileData').textContent;

    try {
        var data = JSON.parse(dataTxt);
        new agGrid.Grid(gridDiv, gridOptions);
        gridOptions.api.sizeColumnsToFit();
        gridOptions.api.setRowData(data.frames.frames);
        console.log(data.frames.frames);
        //gridOptions.api.setRowData(JSON.parse(data));
    } catch (err) {
        console.log(`Couldn't parse text, output follows: {dataTxt}`);
    }

});
