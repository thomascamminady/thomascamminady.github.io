// Set up event listener for update button
document.getElementById("update-button").addEventListener("click", updateGraph);

function updateGraph() {
    // Clear previous svg (if any)
    d3.select("#graph").select("svg").remove();

    // Read and parse matrix from textarea
    let matrixText = document.getElementById("matrix-input").value;
    let matrix;
    try {
        matrix = JSON.parse(matrixText);
    } catch (e) {
        alert("Invalid matrix format. Please ensure it is valid JSON.");
        return;
    }

    // Ensure matrix is square and nonempty
    if (!Array.isArray(matrix) || matrix.length === 0) {
        alert("Matrix must be a non-empty array.");
        return;
    }
    const n = matrix.length;
    for (let row of matrix) {
        if (!Array.isArray(row) || row.length !== n) {
            alert(
                "Matrix must be square with equal number of elements in each row."
            );
            return;
        }
    }

    // Create node and link arrays
    let nodes = [];
    for (let i = 0; i < n; i++) {
        nodes.push({ id: i });
    }
    let links = [];
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            let p = matrix[i][j];
            if (p > 0) {
                links.push({ source: i, target: j, weight: p });
            }
        }
    }

    // Set SVG dimensions
    const width = 800,
        height = 600;
    const svg = d3
        .select("#graph")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Define an arrow marker whose tip is at (0,0)
    // (This marker is defined in reverse so that its tip attaches exactly at the path endpoint.)
    // Define an arrow marker with a smaller head.
    // The marker’s viewBox and size are adjusted so that its tip (at (0,0))
    // will be shifted along the path by 20 pixels (the node radius), placing it at the target’s edge.
    // Define an arrow marker with a small head that attaches exactly at the end of the path.
    svg.append("defs")
        .append("marker")
        .attr("id", "arrow")
        .attr("markerUnits", "strokeWidth")
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("refX", 5)
        .attr("refY", 3)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,0 L0,6 L6,3 Z")
        .attr("fill", "#999");

    // Create force simulation
    const simulation = d3
        .forceSimulation(nodes)
        .force(
            "link",
            d3
                .forceLink(links)
                .id((d) => d.id)
                .distance(200)
        )
        .force("charge", d3.forceManyBody().strength(-500))
        .force("center", d3.forceCenter(width / 2, height / 2));

    // Create curved link paths with wider strokes
    const link = svg
        .append("g")
        .attr("class", "links")
        .selectAll("path")
        .data(links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("stroke-width", (d) => d.weight * 5)
        // Attach the marker at the end of the path
        .attr("marker-end", "url(#arrow)");

    // Create node groups (to allow labels alongside circles)
    const node = svg
        .append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(nodes)
        .enter()
        .append("g")
        .call(drag(simulation));

    // Append circles for nodes
    node.append("circle").attr("r", 20).attr("fill", "#69b3a2");

    // Append text labels for nodes
    node.append("text")
        .attr("dy", 4)
        .attr("text-anchor", "middle")
        .text((d) => d.id);

    // Drag functions
    function drag(simulation) {
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

        return d3
            .drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    simulation.on("tick", () => {
        // Update node positions.
        node.attr("transform", (d) => `translate(${d.x},${d.y})`);

        // Update link paths as cubic Bézier curves.
        link.attr("d", (d) => {
            const r = 20; // node radius

            if (d.source.id === d.target.id) {
                // Self-loop: define endpoints on the node boundary.
                const S = { x: d.source.x, y: d.source.y };
                // Choose fixed endpoints (for example, start at the right edge, end at the top edge).
                const P0 = { x: S.x + r, y: S.y };
                const P3 = { x: S.x, y: S.y - r };
                // For a longer, gentle loop, choose control points:
                const factor = 80; // adjust for loop length/curvature
                const P1 = { x: P0.x + factor, y: P0.y - factor };
                const P2 = { x: P3.x, y: P3.y - factor };
                return `M${P0.x},${P0.y} C${P1.x},${P1.y} ${P2.x},${P2.y} ${P3.x},${P3.y}`;
            } else {
                // Non-self loops.
                const S = { x: d.source.x, y: d.source.y };
                const T = { x: d.target.x, y: d.target.y };
                const dx = T.x - S.x,
                    dy = T.y - S.y;
                const D = Math.hypot(dx, dy);
                // Unit vector from S to T.
                const u = { x: dx / D, y: dy / D };
                // Perpendicular unit vector.
                const v = { x: -u.y, y: u.x };

                // Compute endpoints on the node boundaries.
                const P0 = { x: S.x + r * u.x, y: S.y + r * u.y };
                const P3 = { x: T.x - r * u.x, y: T.y - r * u.y };

                // Let the remaining distance (center-to-center minus 2r) determine control point spacing.
                const remaining = D - 2 * r;
                const factor = remaining / 3; // control point distance along u

                // Choose control points:
                // P1 is offset from P0 along u plus a curvature offset along v.
                const curvature = 60; // adjust for more curvature
                const P1 = {
                    x: P0.x + factor * u.x + curvature * v.x,
                    y: P0.y + factor * u.y + curvature * v.y,
                };
                // P2 is chosen so that the derivative at P3 is exactly u.
                const P2 = {
                    x: P3.x - factor * u.x,
                    y: P3.y - factor * u.y,
                };

                return `M${P0.x},${P0.y} C${P1.x},${P1.y} ${P2.x},${P2.y} ${P3.x},${P3.y}`;
            }
        });
    });

    // Create a moving circle (the "agent" that moves along transitions)
    let movingCircle = svg.append("circle").attr("r", 8).attr("fill", "red");

    // Start from the first node (or choose randomly)
    let currentNode = nodes[0];

    // Animation function: selects an outgoing link based on probability and animates along it
    function animateTransition() {
        // Find all outgoing links from the current node
        let outgoing = links.filter((l) => l.source.id === currentNode.id);
        if (outgoing.length === 0) {
            // If no outgoing link, jump to a random node and restart
            currentNode = nodes[Math.floor(Math.random() * nodes.length)];
            animateTransition();
            return;
        }
        // Weighted random selection (using the weight as probability)
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

        // Get the corresponding path element for the selected link
        let path = link.filter((d) => d === selectedLink).node();
        let pathLength = path.getTotalLength();

        // Position the moving circle at the start of the path
        movingCircle.attr(
            "transform",
            `translate(${currentNode.x},${currentNode.y})`
        );

        // Animate along the path
        movingCircle
            .transition()
            .duration(2000)
            .attrTween("transform", function () {
                return function (t) {
                    let point = path.getPointAtLength(t * pathLength);
                    return `translate(${point.x},${point.y})`;
                };
            })
            .on("end", function () {
                // Once reached, update current node and repeat
                currentNode = selectedLink.target;
                animateTransition();
            });
    }

    // Kick off the animation
    animateTransition();
}

// Create the initial graph on load
updateGraph();
