class Car {
    constructor(initialX, initialY, carWidth, carHeight, controlType, maxSpeed = 3, color  = "purple") {
        this.x = initialX;
        this.y = initialY;
        this.width = carWidth;
        this.height = carHeight;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;
        this.angle = 0;
        this.damaged = false;

        this.useBrain = controlType == "AI";

        if (controlType !== "DUMMY") {
            this.sensor = new Sensor(this);
            this.brain = new NeuralNetwork([this.sensor.numberOfRays, 6, 4]);
        }
        this.controls = new Controls(controlType);

        this.img = new Image();
        this.img.src = "car.png";

        this.mask = document.createElement("canvas");
        this.mask.width = carWidth;
        this.mask.height = carHeight;

        const maskCtx = this.mask.getContext("2d");
        this.img.onload = () => {
            maskCtx.fillStyle = color;
            maskCtx.fillRect(0, 0, this.width, this.height); // Use fillRect instead of rect and fill
            maskCtx.globalCompositeOperation = "destination-atop";
            maskCtx.drawImage(this.img, 0, 0, this.width, this.height);
        }
    }

    update(roadBorders, traffic) {
        if (!this.damaged) {
            this.#movement();
            this.polygon = this.#newPolygon();
            this.damaged = this.#checkDamage(roadBorders, traffic);
        }
        if (this.sensor) {
            this.sensor.update(roadBorders, traffic);
            const sensorOffsets = this.sensor.rayReadings.map(
                reading => reading === null ? 0 : 1 - reading.offset
            );
            const neuralOutputs = NeuralNetwork.feedForward(sensorOffsets, this.brain);

            if (this.useBrain) {
                this.controls.forward = neuralOutputs[0];
                this.controls.left = neuralOutputs[1];
                this.controls.right = neuralOutputs[2];
                this.controls.reverse = neuralOutputs[3];
            }
        }
    }

    #checkDamage(roadBorders, traffic) {
        for (let border of roadBorders) {
            if (polysIntersect(this.polygon, border)) {
                return true;
            }
        }
        for (let vehicle of traffic) {
            if (polysIntersect(this.polygon, vehicle.polygon)) {
                return true;
            }
        }
        return false;
    }

    #newPolygon() {
        const points = [];
        const radius = Math.hypot(this.width, this.height) / 2;
        const angleOffset = Math.atan2(this.width, this.height);

        points.push({
            x: this.x - Math.sin(this.angle - angleOffset) * radius,
            y: this.y - Math.cos(this.angle - angleOffset) * radius
        });
        points.push({
            x: this.x - Math.sin(this.angle + angleOffset) * radius,
            y: this.y - Math.cos(this.angle + angleOffset) * radius
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - angleOffset) * radius,
            y: this.y - Math.cos(Math.PI + this.angle - angleOffset) * radius
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + angleOffset) * radius,
            y: this.y - Math.cos(Math.PI + this.angle + angleOffset) * radius
        });

        return points;
    }

    #movement() {
        if (this.controls.forward) {
            this.speed += this.acceleration;
        }
        if (this.controls.reverse) {
            this.speed -= this.acceleration;
        }

        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
        if (this.speed < -this.maxSpeed / 2) {
            this.speed = -this.maxSpeed / 2;
        }

        if (this.speed > 0) {
            this.speed -= this.friction;
        }
        if (this.speed < 0) {
            this.speed += this.friction;
        }
        if (Math.abs(this.speed) < this.friction) {
            this.speed = 0;
        }

        if (this.speed !== 0) {
            const direction = this.speed > 0 ? 1 : -1;
            if (this.controls.left) {
                this.angle += 0.03 * direction;
            }
            if (this.controls.right) {
                this.angle -= 0.03 * direction;
            }
        }

        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }

    draw(context, drawSensor = false) {
        if (this.sensor && drawSensor) {
            this.sensor.draw(context);
        }

        context.save();
        context.translate(this.x, this.y);
        context.rotate(-this.angle);

        if (!this.damaged){
            context.drawImage(this.mask, -this.width / 2, -this.height / 2, this.width, this.height);
            context.globalCompositeOperation = "multiply";
        }
        context.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);
        context.restore();

    }
}
