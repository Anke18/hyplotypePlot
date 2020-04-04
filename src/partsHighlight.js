/*
 * @Descripttion: 
 * @version: 
 * @Author: Anke Wang
 * @Date: 2020-04-03 15:08:55
 * @LastEditors: Mengwei Li
 * @LastEditTime: 2020-04-04 18:31:56
 */

import * as d3 from 'd3';

/**
 * @name: fadeReset
 * @description: fadeReset
 * @param1: {
 *      node and link in graph
 *      }
 * @return: null
 * @detail: 
 */
export const fadeReset = (allNodes, allLinks) => {

    allNodes.style('stroke-opacity', 1);
    allLinks.style('stroke-opacity', 1);
}

/**
 * @name: nodeHighlight
 * @description: 点击node或者搜索节点之后的高亮行为，需要考虑多节点选择问题
 * @param1: {
 *      allNodes -- node
 *      allLinks -- link 
 *      nodesID -- node.id 
 *      opacity -- set opacity
 *      }
 * @return: null
 * @detail: 
 */

export const nodeHighlight = (allNodes, allLinks, nodesID, opacity) => {

    fadeReset(allNodes, allLinks);
    
    allNodes.each(function(d) {

        let element;
        element = d3.select(this);
        element.style("opacity", opacity);

        if (Array.isArray(nodesID) === false) 
        {   
            if(d.id === nodesID)
            {
                element.style("opacity", "1");
                allLinks.style('stroke-opacity', o => (o.source.id === nodesID || o.target.id === nodesID ? 1 : opacity));
                allLinks.style('stroke', o => (o.source.id === nodesID || o.target.id === nodesID ? "#ffc107" : "#999"));
            }
        }
        else
        {
            if (nodesID.includes(d.id))
            {
                element.style("opacity", "1");
                allLinks.style('stroke-opacity', o => (nodesID.includes(o.source.id) && nodesID.includes(o.target.id) ? 1 : opacity));
            }
        }
    });

}


/**
 * @name: linkHighlight
 * @description: 点击link之后的高亮行为
 * @param1: {
 *      allNodes -- node
 *      allLinks -- link 
 *      link -- selected link 
 *      opacity -- set opacity
 *      }
 * @return: null
 * @detail: 
 */

export const linkHighlight = (allNodes, allLinks, link, opacity) => {

    fadeReset(allNodes, allLinks);

    allLinks.each(function(d) {

        let element;
        element = d3.select(this);
        element.style("opacity", opacity);

        if(d.source === link.source && d.target === link.target)
		{
            element.style("opacity", "1");
           
		}

    });

   allNodes.style('opacity', o => (link.source.id === o.id || link.target.id === o.id ? 1 : opacity));

}