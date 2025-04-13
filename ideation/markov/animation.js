import { color, buildGraph, drawGraph } from "./drawing.js";

let currentSimulation = null; // Global reference for the simulation

// ===== Letter Grid Configuration and Functions =====
const maxColumns = 10; // Maximum letters per row.
const rowHeight = 40; // Vertical spacing (pixels) per row.
const maxRows = 15; // Maximum number of rows visible.

// letterGrid is an array of rows; each row is an array of objects: { letter, color }.
let letterGrid = [];

function addLetter(letter, letterColor, svgEl) {
    if (letterGrid.length === 0) {
        letterGrid.push([]);
    }
    let lastRow = letterGrid[letterGrid.length - 1];
    if (lastRow.length >= maxColumns) {
        lastRow = [];
        letterGrid.push(lastRow);
    }
    lastRow.push({ letter, color: letterColor });
    if (letterGrid.length > maxRows) {
        letterGrid = [];
        svgEl.selectAll(".letter-grid").remove();
    }
    renderLetterGrid(svgEl);
}

function renderLetterGrid(svgEl) {
    let letterGroup = svgEl.select(".letter-grid");
    if (letterGroup.empty()) {
        letterGroup = svgEl
            .append("g")
            .attr("class", "letter-grid")
            .attr("transform", "translate(10, 30)");
    }

    let rowGroups = letterGroup
        .selectAll("g.letter-row")
        .data(letterGrid, (d, i) => i);

    const rowGroupsEnter = rowGroups
        .enter()
        .append("g")
        .attr("class", "letter-row")
        .attr("transform", (d, i) => `translate(0, ${i * rowHeight})`);

    rowGroups = rowGroupsEnter.merge(rowGroups);
    rowGroups
        .transition()
        .duration(300)
        .attr("transform", (d, i) => `translate(0, ${i * rowHeight})`);

    rowGroups.exit().remove();

    rowGroups.each(function (rowData, rowIndex) {
        const rowSel = d3
            .select(this)
            .selectAll("text")
            .data(rowData, (d, i) => i);

        const lettersEnter = rowSel
            .enter()
            .append("text")
            .attr("class", "letter-item")
            .attr("x", maxColumns * 30)
            .attr("y", 0)
            .attr("fill", (d) => d.color)
            .attr("font-weight", "bold")
            .text((d) => d.letter);

        rowSel
            .merge(lettersEnter)
            .transition()
            .duration(300)
            .attr("x", (d, i) => i * 30)
            .attr("fill", (d) => d.color)
            .text((d) => d.letter);

        rowSel.exit().remove();
    });
}

function updateGraph() {
    const svgSelector = "#mySVG";
    const svg = d3.select(svgSelector);

    // Remove any lingering SVG elements and transitions.
    svg.selectAll("*").interrupt();
    svg.selectAll("*").remove();

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

    let graph;
    try {
        graph = buildGraph(matrix);
    } catch (e) {
        alert(e.message);
        return;
    }

    const { link, node, svg: svgEl } = drawGraph(graph, svgSelector);

    const bbox = svgEl.node().getBoundingClientRect();
    const width = bbox.width;
    const height = bbox.height;

    // Create a new simulation.
    currentSimulation = d3
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

    node.call(
        d3
            .drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
    );

    function dragstarted(event, d) {
        if (!event.active) currentSimulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    function dragended(event, d) {
        if (!event.active) currentSimulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    currentSimulation.on("tick", () => {
        let centerx = 0,
            centery = 0;
        graph.nodes.forEach((n) => {
            centerx += n.x;
            centery += n.y;
        });
        centerx /= graph.nodes.length;
        centery /= graph.nodes.length;

        link.attr("d", (d) => {
            if (d.source.id === d.target.id) {
                const S = { x: d.source.x, y: d.source.y };
                const factor = 150;
                let normalx = S.x - centerx,
                    normaly = S.y - centery;
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
                const dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    dr = Math.sqrt(dx * dx + dy * dy);
                return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
            }
        });

        node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // Remove any previous movingCircle transitions.
    svgEl.selectAll("circle.moving").interrupt();

    const movingCircle = svgEl
        .append("circle")
        .attr("class", "moving")
        .attr("r", 8)
        .attr("fill", "rgba(0,0,0,0.5)");

    let currentNode = graph.nodes[0];

    function animateTransition() {
        // If the SVG element is removed, stop.
        if (!svgEl.node()) return;

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

        let pathEl = link.filter((d) => d === selectedLink).node();
        if (!pathEl) return;

        d3.select(pathEl).raise();

        const originalStroke = pathEl.getAttribute("stroke");
        const baseColor = color(selectedLink.source.id);
        pathEl.setAttribute("stroke", baseColor);

        const markerEnd = pathEl.getAttribute("marker-end");
        let originalMarkerStroke, originalMarkerFill;
        if (markerEnd) {
            const markerId = markerEnd.replace("url(#", "").replace(")", "");
            const marker = document.getElementById(markerId);
            if (marker) {
                const markerPath = marker.querySelector("path");
                originalMarkerStroke = markerPath.getAttribute("stroke");
                originalMarkerFill = markerPath.getAttribute("fill");
                markerPath.setAttribute("stroke", baseColor);
                markerPath.setAttribute("fill", baseColor);
            }
        }

        let pathLength = pathEl.getTotalLength();
        movingCircle.attr(
            "transform",
            `translate(${currentNode.x},${currentNode.y})`
        );

        // Interrupt any previous transition on the moving circle.
        movingCircle.interrupt();

        movingCircle
            .transition()
            .duration(500)
            .attrTween("transform", () => (t) => {
                let point = pathEl.getPointAtLength(t * pathLength);
                return `translate(${point.x},${point.y})`;
            })
            .on("end", () => {
                // Restore original stroke and marker attributes.
                pathEl.setAttribute("stroke", originalStroke);
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
                // Update the current node and add the corresponding letter.
                currentNode = selectedLink.target;
                addLetter(
                    String.fromCharCode(65 + currentNode.id),
                    color(currentNode.id),
                    svgEl
                );
                animateTransition();
            });
    }
    animateTransition();

    // Restart simulation on window resize.
    window.addEventListener("resize", () => {
        const newBbox = svgEl.node().getBoundingClientRect();
        currentSimulation.force(
            "center",
            d3.forceCenter(newBbox.width / 2, newBbox.height / 2)
        );
        currentSimulation.alpha(0.3).restart();
    });
}

updateGraph();
