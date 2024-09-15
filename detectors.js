class Sensor {
    constructor(vehicle) {
        this.vehicle = vehicle;
        this.numberOfRays = 5;
        this.rayLength = 150;
        this.raySpread = Math.PI / 2;

        this.rays = [];
        this.rayReadings = [];
    }

    update(roadEdges, trafficVehicles) {
        this.#castRays();
        this.rayReadings = [];
        for (let rayIndex = 0; rayIndex < this.rays.length; rayIndex++) {
            this.rayReadings.push(
                this.#getRayReading(
                    this.rays[rayIndex],
                    roadEdges,
                    trafficVehicles
                )
            );
        }
    }

    #getRayReading(ray, roadEdges, trafficVehicles) {
        let intersections = [];

        for (let edgeIndex = 0; edgeIndex < roadEdges.length; edgeIndex++) {
            const intersection = getIntersection(
                ray[0],
                ray[1],
                roadEdges[edgeIndex][0],
                roadEdges[edgeIndex][1]
            );
            if (intersection) {
                intersections.push(intersection);
            }
        }

        for (let vehicleIndex = 0; vehicleIndex < trafficVehicles.length; vehicleIndex++) {
            const polygon = trafficVehicles[vehicleIndex].polygon;
            for (let vertexIndex = 0; vertexIndex < polygon.length; vertexIndex++) {
                const intersection = getIntersection(
                    ray[0],
                    ray[1],
                    polygon[vertexIndex],
                    polygon[(vertexIndex + 1) % polygon.length]
                );
                if (intersection) {
                    intersections.push(intersection);
                }
            }
        }

        if (intersections.length === 0) {
            return null;
        } else {
            const offsets = intersections.map(intersection => intersection.offset);
            const minOffset = Math.min(...offsets);
            return intersections.find(intersection => intersection.offset === minOffset);
        }
    }

    #castRays() {
        this.rays = [];
        for (let rayIndex = 0; rayIndex < this.numberOfRays; rayIndex++) {
            const rayAngle = lerp(
                this.raySpread / 2,
                -this.raySpread / 2,
                this.numberOfRays === 1 ? 0.5 : rayIndex / (this.numberOfRays - 1)
            ) + this.vehicle.angle;

            const startPoint = { x: this.vehicle.x, y: this.vehicle.y };
            const endPoint = {
                x: this.vehicle.x - Math.sin(rayAngle) * this.rayLength,
                y: this.vehicle.y - Math.cos(rayAngle) * this.rayLength
            };
            this.rays.push([startPoint, endPoint]);
        }
    }

    draw(ctx) {
        for (let rayIndex = 0; rayIndex < this.numberOfRays; rayIndex++) {
            let endPoint = this.rays[rayIndex][1];
            if (this.rayReadings[rayIndex]) {
                endPoint = this.rayReadings[rayIndex];
            }

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";
            ctx.moveTo(
                this.rays[rayIndex][0].x,
                this.rays[rayIndex][0].y
            );
            ctx.lineTo(
                endPoint.x,
                endPoint.y
            );
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";
            ctx.moveTo(
                this.rays[rayIndex][1].x,
                this.rays[rayIndex][1].y
            );
            ctx.lineTo(
                endPoint.x,
                endPoint.y
            );
            ctx.stroke();
        }
    }
}
