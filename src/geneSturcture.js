/*
 * @Descripttion: 
 * @version: 
 * @Author: Mengwei Li
 * @Date: 2020-04-09 12:26:16
 * @LastEditors: Anke Wang
 * @LastEditTime: 2020-10-09 14:15:03
 */

import * as d3 from 'd3';
import { globalSearch } from './search';
import { nodeHighlight } from './partsHighlight';
import { updateNodeTable, updateNodeTableByVirus } from './nodeTable';
import { push } from 'core-js/fn/array';
import { drawCircle } from './mapPlot';
import { geneStructure, nsp } from './plotConfig';


export const drawGeneStructure = (colorCustom, graph, node, link, uniqueVirus, chart, url, map, getLatlng, uniqueCountry) => {
    d3.select("#genePlot").select("svg").remove()
    Promise
        .all([
            geneStructure.gene,
            nsp.nsp,
         //   d3.tsv('https://bigd.big.ac.cn/ewas/haplotypetest/2019-nCoV_3437_altCoverage.tsv'),？？？excuseme？
        //    d3.tsv('https://bigd.big.ac.cn/ewas/haplotypetest/2019-nCoV_3437_amioCoverage.tsv'),
            d3.json(url),
            graph
        ]).then(([geneData, nspData, variants, graph]) => {

            //   console.log(geneData);
              //  console.log(nspData);

            function sortByKey(array, key) {
                return array.sort(function (a, b) {
                    var x = a[key]; var y = b[key];
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });
            }

            let vdata = [];
            variants.nodes.forEach(d => {
                d.snp.forEach(e => {
                    //console.log(e.freq);
                    vdata.push({ node: d.node, freq: e.freq, loci: e.loci });
                });
            })

            let vdata2 = sortByKey(vdata, 'loci');
            //console.log(vdata2);

            let pvdata = [];
            let tnode = [];
            tnode.push(vdata2[0].node);
           // pvdata.push(vdata2[0]);
            pvdata.push({ node: vdata2[0].node, freq: parseInt(vdata2[0].freq), loci: parseInt(vdata2[0].loci) });

            for (let i = 1, j = 0; i < vdata2.length; i++) {

                if (vdata2[i].loci == vdata2[i - 1].loci) {
                    // console.log(pvdata[j].node);
                    tnode.push(vdata2[i].node);
                    //pvdata[j].node.append(vdata2[i].node);
                }
                else {
                    pvdata[j].node = tnode;
                    j++;
                    tnode = [];
                    tnode.push(vdata2[i].node);
                    pvdata.push({ node: vdata2[i].node, freq: parseFloat(vdata2[i].freq), loci: parseInt(vdata2[i].loci) });

                }

            }

            //console.log(pvdata);
            
            geneData.forEach((e, i) => {
                e.color = colorCustom[i];
                e.start = parseInt(e.start)
                e.end = parseInt(e.end)
            })

            pvdata.forEach((d) => {
                d.color = setColor(d.loci)
            })

            //console.log(pvdata);

            function setColor(loci){
                if(loci >= geneData[0].start && loci <= geneData[0].end) return geneData[0].color;
                if(loci >= geneData[1].start && loci <= geneData[1].end) return geneData[1].color;
                if(loci >= geneData[2].start && loci <= geneData[2].end) return geneData[2].color;
                if(loci >= geneData[3].start && loci <= geneData[3].end) return geneData[3].color;
                if(loci >= geneData[4].start && loci <= geneData[4].end) return geneData[4].color;
                if(loci >= geneData[5].start && loci <= geneData[5].end) return geneData[5].color;
                if(loci >= geneData[6].start && loci <= geneData[6].end) return geneData[6].color;
                if(loci >= geneData[7].start && loci <= geneData[7].end) return geneData[7].color;
                if(loci >= geneData[8].start && loci <= geneData[8].end) return geneData[8].color;
                if(loci >= geneData[9].start && loci <= geneData[9].end) return geneData[9].color;
                if(loci >= geneData[10].start && loci <= geneData[10].end) return geneData[10].color;
                if(loci >= geneData[11].start && loci <= geneData[11].end) return geneData[11].color;
                else return "black";
            }

            let geneWidth = $("#genePlot").width();
            let geneHeight = Math.max($("#genePlot").height(), 300);
            let xGeneScale = d3.scaleLinear()
                .domain(d3.extent([0, 29903]))
                .range([0, geneWidth - 40])
            // .nice();

            let xAxis = d3.axisBottom(xGeneScale)
                .tickSize(10)
                .tickPadding(3);

            let svg = d3.select("#genePlot").append("svg")
                .attr("width", geneWidth)
                .attr("height", geneHeight)

            let geneCanvas = svg.append('g')
                .attr('transform', `translate(20, 10)`)
            // drawDotPlot = (c, canvas,           width,  data,   xrange,     yT, t, graph)
            //  drawDotPlot('ntPlot', geneCanvas, geneWidth, altData, [0, 29903], 10, graph)

            //    drawDotPlot('aaPlot', geneCanvas, geneWidth, amioData, [0, 29903], 140,"", graph, node, link, uniqueVirus, chart)
            // drawDotPlot('ntPlot', geneCanvas, geneWidth, altData, sx, 10, "NT", graph)
            const xAxisCanvas = geneCanvas.append('g')
                .attr('transform', `translate(0, 265)`);

            let xAxisG = xAxisCanvas.append('g')
                .call(xAxis)

            let geneStruCanvas = geneCanvas.append('g')
                .attr('transform', `translate(0, 235)`);

            geneStruCanvas.selectAll('rect').data(geneData)
                .enter().append('rect')
                .attr('x', (d) => xGeneScale(d.start))
                .attr('width', d => xGeneScale(d.end - d.start + 1))
                .attr('height', 20)
                .attr('fill', (d, i) => d.color)
                .attr("stroke-width", 0.4)
                .attr("stroke", "black");

            let nspCanvas = geneCanvas.append('g')
                .attr('transform', `translate(0, 170)`);

            nspCanvas.selectAll('rect').data(nspData)
                .enter().append('rect')
                .attr('x', (d) => xGeneScale(d.start))
                .attr('width', d => xGeneScale(d.end - d.start + 1))
                .attr('height', 20)
                .attr("y", (d, i) => i % 2 == 0 ? 20 : 0)
                .attr('fill', "gray");

            nspCanvas.selectAll('text').data(nspData)
                .enter().append('text')
                .attr('x', (d) => xGeneScale(d.start) + xGeneScale(d.end - d.start + 1) / 2)
                .attr("y", (d, i) => i % 2 == 1 ? 15 : 35)
                .text((d, i) => i + 1)
                .attr("font-size", "10px")
                .attr('text-anchor', 'middle')

            nspCanvas.append("line")
                .attr('x1', 0)
                .attr('x2', xGeneScale(21552))
                .attr('y1', 45)
                .attr('y2', 45)
                .attr("stroke-width", 1)
                .attr("stroke", "gray")

            nspCanvas.append("text")
                .text("nsp")
                .attr("font-size", "15px")
                .attr('text-anchor', 'middle')
                .attr('x', xGeneScale(21552 / 2))
                .attr("y", 60)

            nspCanvas.append("rect")
                .attr('x', xGeneScale(22550))
                .attr('width', xGeneScale(23311 - 22550 + 1))
                .attr('height', 20)
                .attr('y', 10)
                .attr('fill', "red");

            nspCanvas.append("text")
                .text("RBD")
                .attr("font-size", "15px")
                .attr('fill', 'red')
                .attr('x', xGeneScale(23311))
                .attr("y", 25)

            const brush = d3.brushX()
                .extent([[0, -15], [geneWidth - 40, 120]])
                .on("end", brushed);

            let largeCanvas = geneCanvas.append('g')
                .attr('transform', `translate(0, 140)`);

            geneCanvas.append("g")
                .attr('transform', `translate(0, 180)`)
                .call(brush)
                .call(brush.move, [1, 29903].map(xGeneScale));

            function brushed() {

                const selection = d3.event.selection;
                let sx;
                if (selection === null) {
                    sx = [1, 1];
                } else {
                    sx = selection.map(xGeneScale.invert);
                }

                let a = geneData.filter(e => e.end > sx[0])
                    .filter(e => e.start < sx[1])

                let largeScale = d3.scaleLinear()
                    .domain(d3.extent([0, sx[1] - sx[0] + 1]))
                    .range([0, geneWidth - 40])

                let rectL = []
                let rectS = []
                largeCanvas.selectAll('text').remove()
                largeCanvas.selectAll('rect').remove()
                largeCanvas.selectAll('rect').data(a)
                    .enter().append('rect')
                    .attr('x', (d) => d.start <= sx[0] ? 0 : largeScale(d.start - sx[0]))
                    .attr('width', (d, i) => {
                        let b = d.start <= sx[0] ? 0 : largeScale(d.start - sx[0]);
                        if (d.start <= sx[0] && d.end <= sx[1]) {
                            rectL[i] = largeScale(d.end - sx[0] + 1)
                            rectS[i] = b + rectL[i] / 2
                            return largeScale(d.end - sx[0] + 1)
                        } else if (d.start <= sx[0] && d.end >= sx[1]) {
                            rectL[i] = largeScale(sx[1] - sx[0] + 1)
                            rectS[i] = b + rectL[i] / 2
                            return largeScale(sx[1] - sx[0] + 1)
                        } else if (d.start >= sx[0] && d.end <= sx[1]) {
                            rectL[i] = largeScale(d.end - d.start + 1)
                            rectS[i] = b + rectL[i] / 2
                            return largeScale(d.end - d.start + 1)
                        } else {
                            rectL[i] = largeScale(sx[1] - d.start + 1)
                            rectS[i] = b + rectL[i] / 2
                            return largeScale(sx[1] - d.start + 1)
                        }
                    })
                    .attr('height', 20)
                    .attr('fill', (d, i) => d.color)
                    .attr("stroke-width", 0.4)
                    .attr("stroke", "black");


                largeCanvas.selectAll('text').data(a)
                    .enter().append('text')
                    .text(((d, i) => {
                        if (rectL[i] > 20) {
                            return d.name
                        }
                    }))
                    .attr('fill', "white")
                    .attr('x', (d, i) => rectS[i])
                    .attr("y", 13)
                    .attr('text-anchor', 'middle')
                    .attr("font-size", "10px")

                drawDotPlot('ntPlot', geneCanvas, geneWidth, pvdata, sx, 10, "NT", graph, node, link, uniqueVirus, chart, map, getLatlng, uniqueCountry)
                // drawDotPlot('aaPlot', geneCanvas, geneWidth, amioData, sx, 140, "AA")

            }

        });
}

const drawDotPlot = (c, canvas, width, data, xrange, yT, t, graph, node, link, uniqueVirus, chart, map, getLatlng, uniqueCountry) => {
    //console.log(data);
    //console.log(c, canvas, width, data, xrange, yT, t, graph, node, link, uniqueVirus, chart, map, getLatlng, uniqueCountry);
    // console.log(t);[22081.787474499695, 26659.494495271232]
    //console.log(data.variants);
    d3.select("." + c).remove()
    let dotCanvas = canvas.append("g")
        .attr('class', c)
        .attr('transform', `translate(0, ${yT})`);

    let xScale = d3.scaleLinear()
        .domain(xrange)
        .range([0, width - 40])

    let xAxis = d3.axisBottom(xScale)
        .tickSize(10)
        .tickPadding(3);

    let xAxisCanvas = dotCanvas.append('g')
        .attr('transform', `translate(0, 100)`);

    let xAxisG = xAxisCanvas.append('g')
        .call(xAxis)

    let yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([100, 0])
    // .nice();

    let yAxis = d3.axisLeft(yScale)
        .tickSize(-2)
        .tickPadding(1);

    let yAxisCanvas = dotCanvas.append('g')

    let yAxisG = yAxisCanvas.append('g')
        .call(yAxis)

    let a = data.filter(e => (e.loci >= xrange[0] && e.loci <= xrange[1]))

    //console.log(a);
    dotCanvas.selectAll('.l1').data(a)
        .enter().append('line')
        .attr("class", "l1")
        .attr("stroke-width", 2)
        .attr("stroke", d => d.color)
        .attr('x1', (d, i) => {
            // console.log(d.pos + ":" + xScale(parseInt(d.pos)))
            return xScale(parseInt(d.loci))
        })
        .attr('x2', (d, i) => xScale(parseInt(d.loci)))
        .attr('y1', yScale(0))
        .attr('y2', (d, i) => yScale(d.freq))
        .attr("cursor", "pointer")
        .on("mouseover", (d) => {
            d3.select(".dotProp").remove()
            let tx = Math.min(xScale(parseInt(d.loci)) + 2, width - 100)
           // console.log(d.freq);
            let ty = Math.min(yScale(d.freq) / 2, 120)

            let propCanvas = dotCanvas.append('g')
                .attr('class', 'dotProp')
                .attr('transform', `translate(${tx}, ${ty})`)

            propCanvas.append("rect")
                .attr('rx', 8)
                .attr('width', 80)
                .attr('height', 40)
                .attr('fill', 'rgba(0, 0, 0, 0.8)')
                .transition()
                .duration(500);

            propCanvas.append("text")
                .text("Freq: " + (d.freq).toFixed(5))
                .attr("fill", "white")
                .attr('font-size', 10)
                .attr('transform', `translate(5, 18)`)

            propCanvas.append("text")
                    .text("Loci: " + d.loci)
                    .attr("fill", "white")
                    .attr('font-size', 10)
                    .attr('transform', `translate(5, 28)`)
        })
        .on("click", e => {

          // console.log(e);
         //   let getrange = [parseInt(e.loci) - 20, parseInt(e.loci) + 20];
        //    drawDotPlot(c, canvas, width, data, getrange, yT, t, graph, node, link, uniqueVirus, chart, map, getLatlng, uniqueCountry);
         //   dotCanvas.select(this).select("li").style("stroke", "red");
            //e.attr("stroke", "red");loci: "25563"
            let res = e.node;

            // console.log(res.indexOf(e.id));
            nodeHighlight(node, link, res, 0.05)
            let filterNodes = graph.nodes.filter(e => res.indexOf(e.id) >= 0)

            let tvirus = [];

            filterNodes.forEach(node => {
                tvirus = tvirus.concat(node.Virus)
            })

            // let a = uniqueVirus.filter(e => e.date === "2020-05-25")//(e => e.loci.split("-")[0] === d)
            updateNodeTableByVirus(tvirus)
            chart.dispatchAction({
                type: 'restore'
            })

            chart.dispatchAction({
                type: 'highlight',
                seriesIndex: 0,
                name: tvirus.map(e => e.date)
            })

            let lociCount = tvirus.map(e => e.loci.split("-")[0]).reduce(function (allNames, name) { if (name in allNames) { allNames[name]++; } else { allNames[name] = 1; } return allNames; }, {});

            let colorMap = {}

            uniqueCountry.forEach(e => {
                colorMap[e.name] = e.color
            })

            drawCircle(map, getLatlng, Object.keys(lociCount), Object.values(lociCount), Object.keys(lociCount).map(e => colorMap[e]), node, link, chart, uniqueVirus, graph)
        });

    dotCanvas.append("text")
        .text(t)
        .attr('transform', `translate(10, 10)`)

}