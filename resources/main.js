
var vm = new Vue({
    el: '#vued3chart',
    data: {
      data: [4, 8, 15, 16, 23, 42]
    },
    methods: {
      renderChart: function(data) {
        // This code is based on https://bost.ocks.org/mike/bar/2/
        var width = 750,
            barHeight = 20;
        var x = d3.scale.linear()
            .domain([0, d3.max(data)])
            .range([0, width]);
        var vuechart = d3.select(this.$el)
            .attr("width", width)
            .attr("height", barHeight * data.length);
        var d = vuechart.selectAll("g")
            .data(data);
       
        var g = d.enter().append("g")
            .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

        g.append("rect")
            .attr("width", x)
            .attr("height", barHeight - 1);
        g.append("text")
            .attr("x", function(d) { return x(d) - 3; })
            .attr("y", barHeight / 2)
            .attr("dy", ".35em")
            .text(function(d) { return d; });
      }
    },
    mounted: function() {
      this.renderChart(this.$data.data);
    },
    watch: {
      data: function(val) {
        this.renderChart(val);
      }
    }
  });

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
  (function () {
      const vscode = acquireVsCodeApi();
      const counter = document.getElementById("lines-of-code-counter");
      const commMsg = document.getElementById("latest-comm");
      const shouldDisplay = document.getElementById("container");
      let count = 0;
      setInterval( () => {
          counter.textContent = count++;
          if ((count % 250) === 0) {
              console.log("Sending a message to the host...");
              vscode.postMessage({
                  command: 'alert',
                  text: 'communicating with host'
              });
          }
      }, 500);

      // allow the expandable nature of the profile table
      $("#table-profile").treetable({ expandable: true, initialState : "expanded" });

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
       var dataset = [ 5, 10, 15, 14];
      d3.select("body").selectAll("p")
           .data(dataset)
           .enter()
           .append("p")
           .text("New paragraph!");
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

