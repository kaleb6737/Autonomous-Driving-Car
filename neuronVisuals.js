class Visualizer {
    static drawNetwork(ctx, network) {
        const margin = 50;
        const left = margin;
        const top = margin;
        const width = ctx.canvas.width - margin * 2;
        const height = ctx.canvas.height - margin * 2;

        const levelHeight = height / network.levels.length;

    for(let i = network.levels.length - 1; i>=0; i--) {
        const levelTop = top + lerp(
            height - levelHeight,
            0,
            network.levels.length == 1 ? 0.5 : i / (network.levels.length - 1)
        );

        ctx.setLineDash([7,3]);
        Visualizer.drawLevel(ctx,network.levels[i],
            left,levelTop,
            width,levelHeight,
            i==network.levels.length-1
                ?['\u2191', '\u2190', '\u2192','\u2193']
                :[]
                
        );
    }

        


    }

    static drawLevel(ctx, level, left, top, width, height, outputLables) {
        const right = left + width;
        const bottom = top + height;

        const { inputs, outputs, weights, biases } = level;
        const nodeRadius = 18;

        for (let i = 0; i < inputs.length; i++) {
            for (let j = 0; j < outputs.length; j++) {
                ctx.beginPath();
                ctx.moveTo(Visualizer.#getNodex(inputs, i, left, right), bottom);
                ctx.lineTo(Visualizer.#getNodex(outputs, j, left, right), top);

                ctx.lineWidth = 2;
                ctx.strokeStyle =getRGBA(weights[i][j]);
                ctx.stroke();
            }
        }

        for (let i = 0; i < inputs.length; i++) {
            const x = Visualizer.#getNodex(inputs, i, left, right);

            ctx.beginPath();
            ctx.arc(x, bottom, nodeRadius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = "black";
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, bottom, nodeRadius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = getRGBA(inputs[i]);
            ctx.fill();
        }

        for (let i = 0; i < outputs.length; i++) {
            const x = Visualizer.#getNodex(outputs, i, left, right);

            ctx.beginPath();
            ctx.arc(x, top, nodeRadius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = "black";
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, top, nodeRadius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = getRGBA(outputs[i]);
            ctx.fill();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.arc(x, top, nodeRadius * 0.8, 0, Math.PI * 2);
            ctx.strokeStyle = getRGBA(biases[i]);
            ctx.setLineDash([3,3]);
            ctx.stroke();
            ctx.setLineDash([]); 
            if (outputLables[i]) {
                ctx.beginPath();
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "black";
                ctx.strokeStyle = "green";
                ctx.font = (nodeRadius * 1.5) + "px Arial";
                ctx.fillText(outputLables[i], x, top);
                ctx.lineWidth = 2;
                ctx.strokeText(outputLables[i], x, top);
            
                // Draw arrows with white outline
                ctx.lineWidth = 3; // Set a thicker line for the outline
                ctx.strokeStyle = "white"; // Set the color to white for the outline
            
                // Draw the first arrow (outline)
                ctx.moveTo(x, top + nodeRadius);
                ctx.lineTo(x, top + nodeRadius + 10); // Example: Draw a 10px arrow
                ctx.lineTo(x - 5, top + nodeRadius + 5); // Example: Draw the arrowhead
                ctx.moveTo(x, top + nodeRadius);
                ctx.lineTo(x + 5, top + nodeRadius + 5); // Example: Draw the other side of the arrowhead
            
                ctx.stroke(); // Draw the outline
            
                // Draw the second arrow (main arrow)
                ctx.lineWidth = 1; // Set a thinner line for the main arrow
                ctx.strokeStyle = "black"; // Set the color to black for the main arrow
            
                ctx.moveTo(x, top + nodeRadius);
                ctx.lineTo(x, top + nodeRadius + 10); // Example: Draw a 10px arrow
                ctx.lineTo(x - 5, top + nodeRadius + 5); // Example: Draw the arrowhead
                ctx.moveTo(x, top + nodeRadius);
                ctx.lineTo(x + 5, top + nodeRadius + 5); // Example: Draw the other side of the arrowhead
            
                ctx.stroke(); // Draw the main arrow
            }
            
            
            
        }
    }

    static #getNodex(nodes, index, left, right) {
        return lerp(left, right, nodes.length === 1 ? 0.5 : index / (nodes.length - 1));
    }
}