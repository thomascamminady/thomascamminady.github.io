// animation.js
import { color, buildGraph, drawGraph } from "./drawing.js";

// Set up the click event for simulation.
document
    .getElementById("simulate-button")
    .addEventListener("click", updateGraph);

function updateGraph() {
    const svgSelector = "#mySVG";
    const svg = d3.select(svgSelector);

    // Get and parse the matrix input.
    let matrixText = document.getElementById("matrix-input").value;
    let matrix;
    try {
        matrix = JSON.parse(matrixText);
    } catch (e) {
        alert("Invalid matrix format. Please ensure it is valid JSON.");
        return;
    }
    if (!Array.isArray(matrix) || matrix.length === 0) {
        alert("Matrix must be a non-empty array.");
        return;
    }

    // Build the graph data structure.
    let graph;
    try {
        graph = buildGraph(matrix);
    } catch (e) {
        alert(e.message);
        return;
    }

    // Draw the static elements (nodes, links, markers).
    const { link, node, svg: svgEl } = drawGraph(graph, svgSelector);

    // Get SVG dimensions.
    const bbox = svgEl.node().getBoundingClientRect();
    const width = bbox.width;
    const height = bbox.height;

    // Create the force simulation.
    const simulation = d3
        .forceSimulation(graph.nodes)
        .force(
            "link",
            d3
                .forceLink(graph.links)
                .id((d) => d.id)
                .distance(150)
        )
        .force("charge", d3.forceManyBody().strength(-500))
        .force("center", d3.forceCenter(width / 2, height / 2));

    // Add drag interactivity to nodes.
    node.call(
        d3
            .drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
    );

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    // Update positions on each tick.
    simulation.on("tick", () => {
        // Compute the center of all nodes.
        let centerx = 0,
            centery = 0;
        graph.nodes.forEach((n) => {
            centerx += n.x;
            centery += n.y;
        });
        centerx /= graph.nodes.length;
        centery /= graph.nodes.length;

        // Update link paths.
        link.attr("d", (d) => {
            if (d.source.id === d.target.id) {
                // Self-loop using a cubic Bézier curve.
                const S = { x: d.source.x, y: d.source.y };
                const factor = 150;
                let normalx = S.x - centerx;
                let normaly = S.y - centery;
                const norm = Math.sqrt(normalx * normalx + normaly * normaly);
                normalx /= norm;
                normaly /= norm;
                const angle = Math.PI / 4;
                const normalx1 =
                    normalx * Math.cos(angle) - normaly * Math.sin(angle);
                const normaly1 =
                    normalx * Math.sin(angle) + normaly * Math.cos(angle);
                const normalx2 =
                    normalx * Math.cos(-angle) - normaly * Math.sin(-angle);
                const normaly2 =
                    normalx * Math.sin(-angle) + normaly * Math.cos(-angle);
                const P1 = {
                    x: S.x + normalx1 * factor,
                    y: S.y + normaly1 * factor,
                };
                const P2 = {
                    x: S.x + normalx2 * factor,
                    y: S.y + normaly2 * factor,
                };
                return `M${d.source.x},${d.source.y} C${P1.x},${P1.y} ${P2.x},${P2.y} ${d.target.x},${d.target.y}`;
            } else {
                // For non-self loops, draw an arc.
                const dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    dr = Math.sqrt(dx * dx + dy * dy);
                return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
            }
        });

        // Update node positions.
        node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // Create the moving circle (agent) with black, 50% opacity.
    const movingCircle = svgEl
        .append("circle")
        .attr("r", 8)
        .attr("fill", "rgba(0,0,0,0.5)");

    let currentNode = graph.nodes[0];

    // Animate the moving agent along outgoing links.
    function animateTransition() {
        let outgoing = graph.links.filter(
            (l) => l.source.id === currentNode.id
        );
        if (outgoing.length === 0) {
            currentNode =
                graph.nodes[Math.floor(Math.random() * graph.nodes.length)];
            animateTransition();
            return;
        }
        let rand = Math.random(),
            cumulative = 0,
            selectedLink;
        for (let l of outgoing) {
            cumulative += l.weight;
            if (rand <= cumulative) {
                selectedLink = l;
                break;
            }
        }
        if (!selectedLink) selectedLink = outgoing[outgoing.length - 1];

        // Find the corresponding path element.
        let pathEl = link.filter((d) => d === selectedLink).node();
        if (!pathEl) return;

        // Temporarily update the selected link's stroke to full opacity.
        // Save the original (alpha-blended) stroke color.
        const originalStroke = pathEl.getAttribute("stroke");
        // Use selectedLink.source.id to get the correct base color.
        const baseColor = color(selectedLink.source.id);
        pathEl.setAttribute("stroke", baseColor);

        // Update the arrowhead marker for this link.
        const markerEnd = pathEl.getAttribute("marker-end");
        let originalMarkerStroke, originalMarkerFill;
        if (markerEnd) {
            const markerId = markerEnd.replace("url(#", "").replace(")", "");
            const marker = document.getElementById(markerId);
            if (marker) {
                const markerPath = marker.querySelector("path");
                originalMarkerStroke = markerPath.getAttribute("stroke");
                originalMarkerFill = markerPath.getAttribute("fill");
                // Set both stroke and fill to the fully opaque base color.
                markerPath.setAttribute("stroke", baseColor);
                markerPath.setAttribute("fill", baseColor);
            }
        }

        // Animate the moving circle along the path.
        let pathLength = pathEl.getTotalLength();
        movingCircle.attr(
            "transform",
            `translate(${currentNode.x},${currentNode.y})`
        );
        movingCircle
            .transition()
            .duration(1000)
            .attrTween("transform", () => (t) => {
                let point = pathEl.getPointAtLength(t * pathLength);
                return `translate(${point.x},${point.y})`;
            })
            .on("end", () => {
                // Restore the original stroke on the link.
                pathEl.setAttribute("stroke", originalStroke);
                // Restore the original stroke and fill on the arrowhead.
                if (markerEnd) {
                    const markerId = markerEnd
                        .replace("url(#", "")
                        .replace(")", "");
                    const marker = document.getElementById(markerId);
                    if (marker) {
                        const markerPath = marker.querySelector("path");
                        markerPath.setAttribute("stroke", originalMarkerStroke);
                        markerPath.setAttribute("fill", originalMarkerFill);
                    }
                }
                currentNode = selectedLink.target;
                animateTransition();
            });
    }
    animateTransition();

    // Update the simulation's center on window resize.
    window.addEventListener("resize", () => {
        const newBbox = svgEl.node().getBoundingClientRect();
        simulation.force(
            "center",
            d3.forceCenter(newBbox.width / 2, newBbox.height / 2)
        );
        simulation.alpha(0.3).restart();
    });
}

// Initialize the graph when the script loads.
updateGraph();
