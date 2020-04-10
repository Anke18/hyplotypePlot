/*
 * @Descripttion: 
 * @version: 
 * @Author: Mengwei Li
 * @Date: 2020-04-02 10:03:38
 * @LastEditors: Anke Wang
 * @LastEditTime: 2020-04-10 21:53:41
 */
import './css/index.css'
import * as d3 from 'd3';
import { getUniqueCountry, getUniqueDate, getUniqueVirus } from './dataProcess';
import { buildNode } from './buildNode';
import { nodeLink, setScale } from './nodeLink';
import { defaultColor, defaultBehaviors, linkRange, nodeRange, chargeRange } from './plotConfig';
// import { refreshNodeTable, updateNodeTable, updateNodeTableByVirus } from './nodeTable';
import { globalSearch } from './search';
import { nodeHighlight, linkHighlight } from './partsHighlight';
import 'bootstrap';
// import 'bootstrap-table';
import 'select2';
import { drawBarPlot, drawHeatmapDate } from './datePlot';
import { playStart } from './player';
// import { legendDataCountry } from './legend';
import { setCountryCoord, drawMap, drawCircle } from './mapPlot';
import { setSimulation } from './simulation';
import { drawGeneStructure } from './geneSturcture';

d3.json("https://bigd.big.ac.cn/ncov/rest/variation/haplotype/json?date=2020-04-01&area=china").then(graph => {

    let uniqueCountry = getUniqueCountry(graph);
    let uniqueDate = getUniqueDate(graph)
    let uniqueVirus = getUniqueVirus(graph)

    let colorCustom = defaultColor;
    let nodeExtent = d3.extent(graph.nodes.map(a => a.radius))
    let linkExtent = d3.extent(graph.links.map(a => a.distance))

    let nodeScale = setScale("sqrt", nodeExtent, nodeRange)
    let linkScale = setScale("sqrt", linkExtent, linkRange)
    let charge = chargeRange

    let width = $('.network-panel').width();
    let height = $('.network-panel').height();

    let svg = d3.select("#plot").append("svg")
        .attr("width", width)
        .attr("height", height);

    function zoomed() {
        plotCanvas.attr("transform", d3.event.transform);
    }

    const zoom = d3.zoom()
        .scaleExtent([0.1, 40])
        .on("zoom", zoomed);

    let plotCanvas = svg.append('g')
        .call(() => zoom)
        .on("wheel.zoom", null)
        .on("dblclick.zoom", null);

    d3.select("#zoomReset")
        .on("click", () => plotCanvas.transition().call(zoom.scaleTo, 1))

    d3.select("#zoomIn")
        .on("click", () => plotCanvas.transition().call(zoom.scaleBy, 1.2))

    d3.select("#zoomOut")
        .on("click", () => plotCanvas.transition().call(zoom.scaleBy, 0.8))

    let { node, link } = nodeLink(graph, plotCanvas)

    let simulation = setSimulation(linkScale, nodeScale, charge, width, height)

    node.each(function (d) {
        buildNode(d3.select(this), nodeScale(d.radius), d.pieChart, uniqueCountry, d.id)
    });

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    $("#setCharge").on("change", e => {
        let linkRange = [parseInt($("#linkSize").val().split(",")[0]), parseInt($("#linkSize").val().split(",")[1])]
        let nodeRange = [parseInt($("#nodeSize").val().split(",")[0]), parseInt($("#nodeSize").val().split(",")[1])]
        let charge = $("#setCharge").val();
        $("#chargeSize").val(charge);


        linkScale = setScale($("input[name='linkScaleType']:checked").val(), linkExtent, linkRange)
        nodeScale = setScale($("input[name='nodeScaleType']:checked").val(), nodeExtent, nodeRange)


        simulation.stop()
        simulation = setSimulation(linkScale, nodeScale, charge, width, height)
        simulation
            .nodes(graph.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(graph.links);


        d3.selectAll("#plot>svg>.nodes>g>*").remove()

        node.each(function (d) {
            buildNode(d3.select(this), nodeScale(d.radius), d.pieChart, uniqueCountry, d.id)
        });
    });

    $("input[name='linkScaleType'],input[name='nodeScaleType'],#linkSize,#nodeSize,#chargeSize").on("change", e => {
        let linkRange = [parseInt($("#linkSize").val().split(",")[0]), parseInt($("#linkSize").val().split(",")[1])]
        let nodeRange = [parseInt($("#nodeSize").val().split(",")[0]), parseInt($("#nodeSize").val().split(",")[1])]
        let charge = $("#chargeSize").val();

        $("#setCharge").val(charge);

        linkScale = setScale($("input[name='linkScaleType']:checked").val(), linkExtent, linkRange)
        nodeScale = setScale($("input[name='nodeScaleType']:checked").val(), nodeExtent, nodeRange)

        simulation.stop()
        simulation = setSimulation(linkScale, nodeScale, charge, width, height)
        simulation
            .nodes(graph.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(graph.links);


        d3.selectAll("#plot>svg>.nodes>g>*").remove()

        node.each(function (d) {
            buildNode(d3.select(this), nodeScale(d.radius), d.pieChart, uniqueCountry, d.id)
        });

    });

    node
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    function ticked() {

        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        d3.select("#plot").selectAll("path")
            .attr("transform", d => "translate(" + d.x + "," + d.y + ")")

        d3.select("#plot").selectAll("circle").attr("cx", d => d.x)
            .attr("cy", d => d.y);

        d3.select("#plot").selectAll("text.t1")
            .attr("x", d => d.x)
            .attr("y", d => d.y);
    }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active)
            simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    // refreshNodeTable(graph.nodes)


    defaultBehaviors(uniqueCountry, uniqueDate, graph)

    $('#searchBar').on('select2:select', function (e) {
        nodeHighlight(node, link, globalSearch($('#searchBar').val(), graph), 0.2)
    });

    let chart = drawHeatmapDate(uniqueDate)

    // legendDataCountry(graph, uniqueCountry, colorCustom, globalSearch, nodeHighlight, node, link, chart, uniqueVirus);
    chart.on('mouseover', function (params) {
        chart.dispatchAction({
            type: 'restore'
        })
        chart.dispatchAction({
            type: 'highlight',
            seriesIndex: 0,
            name: params.name
        })
        let res = globalSearch(params.value[0] + "|date", graph)
        nodeHighlight(node, link, res, 0.2);
        let a = uniqueVirus.filter(e => e.date === params.value[0])
        // updateNodeTableByVirus(a)
        // updateNodeTable(graph.nodes.filter(e => res.indexOf(e.id) >= 0))
    });

    chart.on('mouseout', function (params) {
        node.style('opacity', 1);
        link.style('opacity', 1);
    });

    node.on("click", d => {
        // updateNodeTable([d])
        nodeHighlight(node, link, d.id, 0.2)
        chart.dispatchAction({
            type: 'restore'
        })
        chart.dispatchAction({
            type: 'highlight',
            seriesIndex: 0,
            name: d.Virus.map(e => e.date)
        })
    })

    // $(".fa-globe-americas").on("click", () => drawBarPlot(uniqueCountry))
    // $(".fa-calendar-alt").on("click", () => drawHeatmapDate(uniqueDate))


    var map = drawMap();
    var getLatlng = setCountryCoord();

    drawCircle(map, getLatlng, uniqueCountry.map(e => e.name), uniqueCountry.map(e => e.count), uniqueCountry.map(e => e.color), node, link, chart, uniqueVirus, graph)

    $(".fa-play-circle").on("click", () => {
        playStart($(".fa-play-circle"), uniqueDate, graph, node, link, chart,
            map, getLatlng, uniqueVirus, uniqueCountry)
    })

    $(".fa-redo").on("click", () => {
        chart.dispatchAction({
            type: 'restore'
        })
        node.style('opacity', 1);
        link.style('opacity', 1);
    })


    drawGeneStructure(colorCustom)


})



